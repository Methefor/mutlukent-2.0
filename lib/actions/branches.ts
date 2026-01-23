'use server'

import { createClient } from '@/lib/supabase/server'

export interface Branch {
  id: string
  name: string
  code: string
  season: string
  is_active: boolean
}

export async function getBranches(): Promise<Branch[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('branches')
    .select('id, name, code, season, is_active')
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching branches:', error)
    return []
  }
  
  return data || []
}