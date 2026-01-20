'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type State = {
    errors?: {
        branch_id?: string[]
        report_date?: string[]
        cash_sales?: string[]
        credit_card_sales?: string[]
        notes?: string[]
        photo?: string[]
    }
    message?: string | null
}

const MAX_FILE_SIZE = 5000000 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export async function createDailyReport(prevState: State, formData: FormData) {
    const supabase = await createClient()

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return {
            message: 'Unauthorized',
        }
    }

    // Extract data
    const branchId = formData.get('branch_id') as string // UUID
    const rawDate = formData.get('report_date') as string
    const cashSales = parseFloat((formData.get('cash_sales') as string) || '0')
    const creditCardSales = parseFloat((formData.get('credit_card_sales') as string) || '0')
    const notes = formData.get('notes') as string
    const photo = formData.get('photo') as File

    // Basic validation
    const errors: State['errors'] = {}
    if (!branchId) errors.branch_id = ['Şube seçimi zorunludur.']
    if (!rawDate) errors.report_date = ['Tarih gereklidir.']
    if (cashSales < 0) errors.cash_sales = ['Nakit satış 0 dan küçük olamaz.']
    if (creditCardSales < 0) errors.credit_card_sales = ['Kredi kartı satış 0 dan küçük olamaz.']

    if (photo && photo.size > 0) {
        if (photo.size > MAX_FILE_SIZE) {
            errors.photo = ['Dosya boyutu 5MB dan küçük olmalı.']
        }
        if (!ACCEPTED_IMAGE_TYPES.includes(photo.type)) {
            errors.photo = ['Sadece .jpg, .jpeg, .png ve .webp formatları kabul edilir.']
        }
    }

    if (Object.keys(errors).length > 0) {
        return {
            errors,
            message: 'Lütfen formu kontrol ediniz.',
        }
    }

    let photoUrl = null

    if (photo && photo.size > 0) {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
            .from('z_reports')
            .upload(fileName, photo)

        if (uploadError) {
            console.error('Upload Error:', uploadError)
            return { message: 'Fotoğraf yüklenirken hata oluştu.' }
        }
        photoUrl = fileName
    }

    const totalSales = cashSales + creditCardSales

    const { error: insertError } = await supabase
        .from('daily_reports')
        .insert({
            user_id: user.id,
            branch_id: branchId,
            report_date: rawDate,
            cash_sales: cashSales,
            credit_card_sales: creditCardSales,
            total_sales: totalSales,
            notes: notes,
            photo_url: photoUrl,
        })

    if (insertError) {
        console.error('Insert Error:', insertError)
        return {
            message: 'Veritabanı hatası: Rapor kaydedilemedi.',
        }
    }

    revalidatePath('/dashboard/reports') // Updated path to match current route
    return {
        message: 'success',
    }
}
