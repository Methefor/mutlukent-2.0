const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBranches() {
    const { data, error } = await supabase.from('branches').select('id, name');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Branches:', JSON.stringify(data, null, 2));
    }
}

checkBranches();
