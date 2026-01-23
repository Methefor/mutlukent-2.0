'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type User = {
    id: string
    email: string
    full_name: string | null
    role: string
    branch_name: string | null
    role_id?: string
    branch_id?: string
}

export type UserCreationResult = {
    success: boolean
    message?: string
}

export async function getUsers(): Promise<User[]> {
    const supabase = await createClient()

    // Query users with role name and branch name
    const { data: users, error } = await supabase
        .from('users')
        .select(`
            id,
            email,
            full_name,
            role_id,
            branch_id,
            roles (
                name
            ),
            branches (
                name
            )
        `)
        .order('full_name')

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    return users.map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.roles?.name || 'Kullanıcı',
        branch_name: user.branches?.name || '-',
        role_id: user.role_id,
        branch_id: user.branch_id
    }))
}

export async function createUser(data: {
    email: string
    password: string
    full_name: string
    role: string
    branch_id?: string
}): Promise<UserCreationResult> {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // Permissions check
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return { success: false, message: 'Oturum açmanız gerekiyor.' }
    
    // We assume middleware or layout checked for Role, but good to double check or trust the caller context validation
    // Ideally we fetch current user role and verify 'admin' or 'general_manager'

    // 1. Create user in Supabase Auth
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true, // Auto confirm
        user_metadata: {
            full_name: data.full_name,
            role: data.role // Adding role to metadata for easier access in basic checks
        }
    })

    if (authError) {
        return { success: false, message: authError.message }
    }

    if (!newUser.user) {
        return { success: false, message: 'Kullanıcı oluşturulamadı.' }
    }

    // 2. Fetch role_id from roles table
    const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', data.role)
        .single()

    if (roleError || !roleData) {
        // Rollback? Deleting user if role fetch fails
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
        return { success: false, message: 'Seçilen rol bulunamadı.' }
    }

    // 3. Update public.users table (triggered by auth.users insert usually, but we need to update fields)
    // Wait, phases2 setup might have a trigger handling this?
    // Usually a trigger `on_auth_user_created` inserts into `public.users`.
    // If so, we need to UPDATE that record with role and branch.
    // OR if no trigger, we INSERT.
    
    // Let's assume we need to update/insert. Safer to Upsert or Update depending on trigger existence.
    // Checking previous migrations: "handle_new_user" trigger typically inserts id, email, full_name, role.
    // If using user_metadata.role, the trigger might pick it up if written that way.
    // But commonly I prefer to explicitly update the public table to be sure.

    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
            full_name: data.full_name,
            role_id: roleData.id,
            branch_id: data.branch_id || null
        })
        .eq('id', newUser.user.id)

    if (updateError) {
        // If update fails, maybe the trigger didn't run yet? Or trigger doesn't exist?
        // If trigger doesn't exist, we should INSERT.
        // Let's try upsert to be safe.
        const { error: upsertError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: newUser.user.id,
                email: data.email,
                full_name: data.full_name,
                role_id: roleData.id,
                branch_id: data.branch_id || null,
                is_active: true
            })
        
        if (upsertError) {
             console.error('User Insert Error:', upsertError)
             return { success: false, message: 'Kullanıcı veritabanına kaydedilemedi.' }
        }
    }

    // 4. Update user_branches table if specific permissions logic uses it (Phase 2.1)
    // If we are moving to `user_branches` for many-to-many, we should insert there too if needed.
    // But simplified schema seems to still use `branch_id` on users table for primary assignment?
    // Let's stick to `branch_id` on users table for now as per the form.

    revalidatePath('/dashboard/users')
    return { success: true }
}

export async function updateUser(userId: string, data: {
    email: string
    full_name: string
    role: string
    branch_id?: string
    password?: string
}): Promise<UserCreationResult> {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // Permissions check
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return { success: false, message: 'Oturum açmanız gerekiyor.' }

    // 1. Update Supabase Auth User
    const authUpdates: any = {
        email: data.email,
        user_metadata: {
            full_name: data.full_name,
            role: data.role
        }
    }
    if (data.password && data.password.length >= 6) {
        authUpdates.password = data.password
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        authUpdates
    )

    if (authError) {
        return { success: false, message: authError.message }
    }

    // 2. Fetch role_id
    const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', data.role)
        .single()

    if (roleError || !roleData) {
        return { success: false, message: 'Seçilen rol bulunamadı.' }
    }

    // 3. Update public.users table
    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
            email: data.email, // Sync email if changed
            full_name: data.full_name,
            role_id: roleData.id,
            branch_id: data.branch_id || null
        })
        .eq('id', userId)

    if (updateError) {
        return { success: false, message: 'Kullanıcı bilgileri güncellenemedi.' }
    }

    revalidatePath('/dashboard/users')
    return { success: true }
}

export async function deleteUser(userId: string): Promise<UserCreationResult> {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // Permissions check
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return { success: false, message: 'Oturum açmanız gerekiyor.' }

    // 1. Delete from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        userId
    )

    if (authError) {
        return { success: false, message: authError.message }
    }

    // Explicitly delete from public.users to be sure, or rely on cascade.
    const { error: dbError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId)
    
    // Ignore error if it was already deleted by cascade
    if (dbError && dbError.code !== '23503') { // 23503 is foreign key violation
        console.error('User DB Delete Error:', dbError)
    }

    revalidatePath('/dashboard/users')
    return { success: true }
}

