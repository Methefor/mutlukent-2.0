'use server'

import { createClient } from '@/lib/supabase/server'

export type Branch = {
    id: string
    name: string
}

export async function getBranches() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .order('name')

    if (error) {
        console.error('Error fetching branches:', error)
        return []
    }

    return data as Branch[]
}
