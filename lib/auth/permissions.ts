import { createClient } from '@/lib/supabase/server'
import { Permission, ROLE_DEFINITIONS } from './constants'

export type UserRole = keyof typeof ROLE_DEFINITIONS

interface RoleData {
    name: string
    permissions: any
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
    const supabase = await createClient()
    
    const { data: user, error } = await supabase
        .from('users')
        .select(`
            role_id,
            roles:role_id (name, permissions)
        `)
        .eq('id', userId)
        .single()

    if (error || !user) {
        console.error('Error fetching user role:', error)
        return null
    }

    // Foreign key returns single object, not array
    const role = user.roles as unknown as RoleData
    return role?.name as UserRole || null
}

export async function hasPermission(userId: string, requiredPermission: Permission): Promise<boolean> {
    const supabase = await createClient()

    const { data: user, error } = await supabase
        .from('users')
        .select(`
            roles:role_id (permissions)
        `)
        .eq('id', userId)
        .single()

    if (error || !user) {
        return false
    }

    // Foreign key returns single object
    const role = user.roles as unknown as { permissions: any }
    const permissions = role?.permissions

    if (!permissions) {
        return false
    }

    // Type assertion for permissions array
    if (Array.isArray(permissions)) {
        return permissions.includes(requiredPermission)
    }

    return false
}

export async function getCurrentUserPermissions(): Promise<string[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return []

    const { data: userData } = await supabase
        .from('users')
        .select(`
            roles:role_id (permissions)
        `)
        .eq('id', user.id)
        .single()

    if (!userData) return []

    // Foreign key returns single object
   const role = userData.roles as unknown as { permissions: any }
    const permissions = role?.permissions

    if (!permissions || !Array.isArray(permissions)) return []

    return permissions as string[]
}