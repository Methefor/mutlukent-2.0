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

// Types for reports list
export type DailyReport = {
    id: string
    branch_id: string
    branch_name?: string
    created_by: string
    creator_name?: string
    report_date: string
    cash_sales: number
    credit_card_sales: number
    debit_card_sales: number
    total_sales: number
    notes: string | null
    is_verified: boolean
    verified_by: string | null
    verified_at: string | null
    created_at: string
    updated_at: string
}

export type GetReportsParams = {
    page?: number
    perPage?: number
    dateFrom?: string
    dateTo?: string
    branchIds?: string[]
}

export type ReportsListResponse = {
    data: DailyReport[]
    count: number
    page: number
    perPage: number
    totalPages: number
}

const MAX_FILE_SIZE = 5000000 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export async function createDailyReport(prevState: State, formData: FormData) {
    const supabase = await createClient()

    console.log('🚀 ===== Z-RAPOR SUBMISSION BAŞLADI =====')

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        console.error('❌ Auth Error:', authError)
        return {
            message: 'Unauthorized',
        }
    }

    console.log('✅ User authenticated:', user.id)

    // Extract data
    const branchId = formData.get('branch_id') as string // UUID
    const rawDate = formData.get('report_date') as string
    const cashSales = parseFloat((formData.get('cash_sales') as string) || '0')
    const creditCardSales = parseFloat((formData.get('credit_card_sales') as string) || '0')
    const notes = formData.get('notes') as string
    const photo = formData.get('photo') as File

    console.log('📊 Form Data:')
    console.log('  - branch_id:', branchId)
    console.log('  - branch_id type:', typeof branchId)
    console.log('  - branch_id length:', branchId?.length)
    console.log('  - report_date:', rawDate)
    console.log('  - cash_sales:', cashSales)
    console.log('  - credit_card_sales:', creditCardSales)
    console.log('  - notes:', notes)
    console.log('  - photo:', photo ? `${photo.name} (${photo.size} bytes)` : 'No photo')
    console.log('  - user_id (created_by):', user.id)

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

    console.log('💾 Attempting database insert...')
    console.log('Insert payload:', {
        created_by: user.id,
        branch_id: branchId,
        report_date: rawDate,
        cash_sales: cashSales,
        credit_card_sales: creditCardSales,
        notes: notes,
        // total_sales: Database hesaplıyor, göndermeyelim
    })

    const { error: insertError } = await supabase
        .from('daily_reports')
        .insert({
            created_by: user.id,
            branch_id: branchId,
            report_date: rawDate,
            cash_sales: cashSales,
            credit_card_sales: creditCardSales,
            // total_sales KALDIRILDI - database otomatik hesaplıyor (generated column veya trigger)
            notes: notes,
        })

    if (insertError) {
        console.error('❌ DATABASE INSERT ERROR:')
        console.error('Error Code:', insertError.code)
        console.error('Error Message:', insertError.message)
        console.error('Error Details:', insertError.details)
        console.error('Error Hint:', insertError.hint)
        console.error('Full Error:', JSON.stringify(insertError, null, 2))
        return {
            message: `Veritabanı hatası: ${insertError.message || 'Rapor kaydedilemedi.'}`,
        }
    }

    console.log('✅ Report successfully inserted into database!')

    revalidatePath('/dashboard/reports') // Updated path to match current route
    
    console.log('🎉 ===== Z-RAPOR BAŞARIYLA KAYDEDİLDİ =====')
    
    return {
        message: 'success',
    }
}

// ==================== REPORTS LIST FUNCTIONS ====================

/**
 * Get paginated and filtered list of reports
 */
export async function getReports(params: GetReportsParams = {}): Promise<ReportsListResponse> {
    const supabase = await createClient()

    const {
        page = 1,
        perPage = 20,
        dateFrom,
        dateTo,
        branchIds = []
    } = params

    console.log('📋 Fetching reports with params:', params)

    // Start query
    let query = supabase
        .from('daily_reports')
        .select(`
            *,
            branches:branch_id (name),
            users:created_by (full_name)
        `, { count: 'exact' })

    // Apply filters
    if (dateFrom) {
        query = query.gte('report_date', dateFrom)
    }
    if (dateTo) {
        query = query.lte('report_date', dateTo)
    }
    if (branchIds.length > 0) {
        query = query.in('branch_id', branchIds)
    }

    // Pagination
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    query = query
        .order('report_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to)

    const { data, error, count } = await query

    if (error) {
        console.error('❌ Error fetching reports:', error)
        return {
            data: [],
            count: 0,
            page,
            perPage,
            totalPages: 0
        }
    }

    // Transform data to include branch and user names
    const transformedData: DailyReport[] = (data || []).map((report: any) => ({
        ...report,
        branch_name: report.branches?.name || 'Bilinmiyor',
        creator_name: report.users?.full_name || 'Bilinmiyor',
    }))

    const totalPages = Math.ceil((count || 0) / perPage)

    console.log(`✅ Fetched ${transformedData.length} reports (page ${page}/${totalPages})`)

    return {
        data: transformedData,
        count: count || 0,
        page,
        perPage,
        totalPages,
    }
}

/**
 * Get a single report by ID
 */
export async function getReportById(reportId: string): Promise<DailyReport | null> {
    const supabase = await createClient()

    console.log('📄 Fetching report:', reportId)

    const { data, error } = await supabase
        .from('daily_reports')
        .select(`
            *,
            branches:branch_id (name),
            users:created_by (full_name)
        `)
        .eq('id', reportId)
        .single()

    if (error) {
        console.error('❌ Error fetching report:', error)
        return null
    }

    const transformedData: DailyReport = {
        ...data,
        branch_name: data.branches?.name || 'Bilinmiyor',
        creator_name: data.users?.full_name || 'Bilinmiyor',
    }

    return transformedData
}

/**
 * Update an existing report
 */
export async function updateReport(reportId: string, prevState: State, formData: FormData): Promise<State> {
    const supabase = await createClient()

    console.log('🔄 Updating report:', reportId)

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { message: 'Unauthorized' }
    }

    // Extract data
    const branchId = formData.get('branch_id') as string
    const rawDate = formData.get('report_date') as string
    const cashSales = parseFloat((formData.get('cash_sales') as string) || '0')
    const creditCardSales = parseFloat((formData.get('credit_card_sales') as string) || '0')
    const notes = formData.get('notes') as string

    // Basic validation
    const errors: State['errors'] = {}
    if (!branchId) errors.branch_id = ['Şube seçimi zorunludur.']
    if (!rawDate) errors.report_date = ['Tarih gereklidir.']
    if (cashSales < 0) errors.cash_sales = ['Nakit satış 0 dan küçük olamaz.']
    if (creditCardSales < 0) errors.credit_card_sales = ['Kredi kartı satış 0 dan küçük olamaz.']

    if (Object.keys(errors).length > 0) {
        return { errors, message: 'Lütfen formu kontrol ediniz.' }
    }

    const { error: updateError } = await supabase
        .from('daily_reports')
        .update({
            branch_id: branchId,
            report_date: rawDate,
            cash_sales: cashSales,
            credit_card_sales: creditCardSales,
            notes: notes,
            updated_at: new Date().toISOString(),
        })
        .eq('id', reportId)

    if (updateError) {
        console.error('❌ Error updating report:', updateError)
        return {
            message: `Güncelleme hatası: ${updateError.message}`,
        }
    }

    console.log('✅ Report updated successfully')
    revalidatePath('/dashboard/reports/list')

    return { message: 'success' }
}

/**
 * Soft delete a report (sets is_deleted flag if exists, otherwise hard delete)
 * NOTE: is_deleted column needs to be added to database schema
 */
export async function deleteReport(reportId: string): Promise<{ success: boolean; message: string }> {
    const supabase = await createClient()

    console.log('🗑️ Deleting report:', reportId)

    // Validate session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { success: false, message: 'Unauthorized' }
    }

    // For now, we'll do hard delete since is_deleted column doesn't exist yet
    // TODO: Add is_deleted column to database and use soft delete
    const { error } = await supabase
        .from('daily_reports')
        .delete()
        .eq('id', reportId)

    if (error) {
        console.error('❌ Error deleting report:', error)
        return {
            success: false,
            message: `Silme hatası: ${error.message}`,
        }
    }

    console.log('✅ Report deleted successfully')
    revalidatePath('/dashboard/reports/list')

    return {
        success: true,
        message: 'Rapor başarıyla silindi',
    }
}
