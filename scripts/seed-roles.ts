import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { ROLE_DEFINITIONS } from '../lib/auth/constants'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service key for admin tasks

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedRoles() {
    console.log('🌱 Seeding roles...')

    for (const roleKey in ROLE_DEFINITIONS) {
        const roleDef = ROLE_DEFINITIONS[roleKey as keyof typeof ROLE_DEFINITIONS]
        
        console.log(`Processing role: ${roleDef.name}`)

        // Check if role exists
        const { data: existingRole, error: fetchError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', roleDef.name)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error(`Error fetching role ${roleDef.name}:`, fetchError)
            continue
        }

        if (existingRole) {
            console.log(`Updating role: ${roleDef.name}`)
            const { error: updateError } = await supabase
                .from('roles')
                .update({
                    display_name: roleDef.display_name,
                    permissions: roleDef.permissions,
                })
                .eq('id', existingRole.id)

            if (updateError) console.error(`Failed to update ${roleDef.name}:`, updateError)
        } else {
            console.log(`Creating role: ${roleDef.name}`)
            const { error: insertError } = await supabase
                .from('roles')
                .insert({
                    name: roleDef.name,
                    display_name: roleDef.display_name,
                    permissions: roleDef.permissions,
                })

            if (insertError) console.error(`Failed to create ${roleDef.name}:`, insertError)
        }
    }

    console.log('✅ Roles seeding completed.')
}

seedRoles().catch(console.error)
