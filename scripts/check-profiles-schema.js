const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesSchema() {
  try {
    // Get the profiles table schema
    const { data, error } = await supabase.rpc('get_table_definition', {
      table_name: 'profiles'
    });
    
    if (error) {
      console.error('Error fetching profiles schema:', error.message);
      
      // Fallback: Try to get a sample profile to infer schema
      const { data: sampleProfile, error: sampleError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();
      
      if (sampleError) {
        console.error('Error fetching sample profile:', sampleError.message);
        return;
      }
      
      console.log('Sample profile (to infer schema):');
      console.log(JSON.stringify(sampleProfile, null, 2));
      return;
    }
    
    console.log('Profiles table schema:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Unexpected error:', error.message);
    
    // Fallback: Try to get a sample profile to infer schema
    try {
      const { data: sampleProfile, error: sampleError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();
      
      if (sampleError) {
        console.error('Error fetching sample profile:', sampleError.message);
        return;
      }
      
      console.log('Sample profile (to infer schema):');
      console.log(JSON.stringify(sampleProfile, null, 2));
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError.message);
    }
  }
}

checkProfilesSchema(); 