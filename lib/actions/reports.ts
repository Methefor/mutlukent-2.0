'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { parseISO, format } from 'date-fns'

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

export type DailyReport = {
  id: string
  user_id: string
  branch_id: string
  branch_name: string
  report_date: string
  cash_sales: number
  credit_card_sales: number
  total_sales: number
  notes: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export type GetReportsResponse = {
  data: DailyReport[]
  count: number
  error?: string
}

export type GetReportResponse = {
  data: DailyReport | null
  error?: string
}

export type ActionResponse = {
  success: boolean
  error?: string
  data?: any
}

const MAX_FILE_SIZE = 5000000 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

/**
 * Create a new daily report with optional photo upload
 */
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

  revalidatePath('/dashboard/reports')
  return {
    message: 'success',
  }
}

/**
 * Get paginated list of all reports with optional filters
 */
export async function getReports(params: {
  page?: number
  perPage?: number
  dateFrom?: string
  dateTo?: string
  branchId?: string
}): Promise<GetReportsResponse> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: [], count: 0, error: 'Unauthorized' }
  }

  const page = params.page || 1
  const perPage = params.perPage || 20
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  try {
    let query = supabase
      .from('daily_reports')
      .select(
        `
        id,
        user_id,
        branch_id,
        report_date,
        cash_sales,
        credit_card_sales,
        total_sales,
        notes,
        photo_url,
        created_at,
        updated_at,
        branches (
          name
        )
      `,
        { count: 'exact' }
      )
      .order('report_date', { ascending: false })

    // Apply date filters
    if (params.dateFrom) {
      query = query.gte('report_date', params.dateFrom)
    }
    if (params.dateTo) {
      query = query.lte('report_date', params.dateTo)
    }

    // Apply branch filter
    if (params.branchId) {
      query = query.eq('branch_id', params.branchId)
    }

    // Apply pagination
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      return { data: [], count: 0, error: error.message }
    }

    // Map branch name into response
    const mappedData: DailyReport[] = (data || []).map((report: any) => ({
      ...report,
      branch_name: report.branches?.name || 'Bilinmeyen Şube',
    }))

    return {
      data: mappedData,
      count: count || 0,
    }
  } catch (error) {
    console.error('Error fetching reports:', error)
    return { data: [], count: 0, error: 'Rapor alınırken hata oluştu' }
  }
}

/**
 * Get single report by ID
 */
export async function getReportById(id: string): Promise<GetReportResponse> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: 'Unauthorized' }
  }

  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .select(
        `
        id,
        user_id,
        branch_id,
        report_date,
        cash_sales,
        credit_card_sales,
        total_sales,
        notes,
        photo_url,
        created_at,
        updated_at,
        branches (
          name
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return { data: null, error: 'Rapor bulunamadı' }
    }

    if (!data) {
      return { data: null, error: 'Rapor bulunamadı' }
    }

    const branchData = Array.isArray(data.branches) ? data.branches[0] : data.branches
    const report: DailyReport = {
      ...data,
      branch_name: branchData?.name || 'Bilinmeyen Şube',
    }

    return { data: report }
  } catch (error) {
    console.error('Error fetching report:', error)
    return { data: null, error: 'Rapor alınırken hata oluştu' }
  }
}

/**
 * Update existing report
 */
export async function updateReport(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Extract data
    const branchId = formData.get('branch_id') as string
    const rawDate = formData.get('report_date') as string
    const cashSales = parseFloat((formData.get('cash_sales') as string) || '0')
    const creditCardSales = parseFloat((formData.get('credit_card_sales') as string) || '0')
    const notes = formData.get('notes') as string
    const photo = formData.get('photo') as File | null

    // Validation
    if (!branchId || !rawDate || cashSales < 0 || creditCardSales < 0) {
      return { success: false, error: 'Lütfen tüm alanları kontrol ediniz.' }
    }

    let photoUrl = null

    if (photo && photo.size > 0) {
      // Validate file
      if (photo.size > MAX_FILE_SIZE) {
        return { success: false, error: 'Dosya boyutu 5MB dan küçük olmalı.' }
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(photo.type)) {
        return { success: false, error: 'Sadece .jpg, .jpeg, .png ve .webp formatları kabul edilir.' }
      }

      const fileExt = photo.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('z_reports')
        .upload(fileName, photo)

      if (uploadError) {
        console.error('Upload Error:', uploadError)
        return { success: false, error: 'Fotoğraf yüklenirken hata oluştu.' }
      }
      photoUrl = fileName
    }

    const totalSales = cashSales + creditCardSales
    const updateData: any = {
      branch_id: branchId,
      report_date: rawDate,
      cash_sales: cashSales,
      credit_card_sales: creditCardSales,
      total_sales: totalSales,
      notes: notes,
      updated_at: new Date().toISOString(),
    }

    // Only update photo_url if a new one was provided
    if (photoUrl) {
      updateData.photo_url = photoUrl
    }

    const { error } = await supabase
      .from('daily_reports')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Update Error:', error)
      return { success: false, error: 'Rapor güncellenirken hata oluştu.' }
    }

    revalidatePath('/dashboard/reports')
    return { success: true }
  } catch (error) {
    console.error('Error updating report:', error)
    return { success: false, error: 'Rapor güncellenirken hata oluştu.' }
  }
}

/**
 * Soft delete report by setting deleted_at timestamp
 * Note: Requires deleted_at column in database
 */
export async function deleteReport(id: string): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const { error } = await supabase
      .from('daily_reports')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Delete Error:', error)
      return { success: false, error: 'Rapor silinirken hata oluştu.' }
    }

    revalidatePath('/dashboard/reports')
    return { success: true }
  } catch (error) {
    console.error('Error deleting report:', error)
    return { success: false, error: 'Rapor silinirken hata oluştu.' }
  }
}
