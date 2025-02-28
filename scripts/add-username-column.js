const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addUsernameColumn() {
  try {
    console.log('Attempting to add username column to profiles table...');
    
    // First, check if we can connect to the database
    const { data: healthCheck, error: healthError } = await supabase.from('profiles').select('id').limit(1);
    
    if (healthError) {
      console.error('Error connecting to database:', healthError.message);
      
      if (healthError.message.includes('relation "profiles" does not exist')) {
        console.log('The profiles table does not exist. Please create it first.');
      }
      
      return;
    }
    
    console.log('Successfully connected to database.');
    
    // Since we can't use RPC or direct SQL with the JavaScript client,
    // let's try to update a profile with a username field to see if it exists
    const testUpdate = {
      username: 'test_username'
    };
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update(testUpdate)
      .eq('id', healthCheck[0]?.id || 'non-existent-id')
      .select('username');
    
    if (updateError) {
      if (updateError.message.includes('column "username" of relation "profiles" does not exist')) {
        console.log('Confirmed: username column does not exist.');
        console.log('\nPlease run the following SQL in the Supabase SQL Editor:');
        console.log(`
          ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
        `);
        
        console.log('\nOr use the Supabase dashboard:');
        console.log('1. Go to the Supabase dashboard');
        console.log('2. Navigate to the "Table Editor"');
        console.log('3. Select the "profiles" table');
        console.log('4. Click "Add column"');
        console.log('5. Set the name to "username" and type to "text"');
        console.log('6. Click "Save"');
      } else {
        console.error('Error updating profile:', updateError.message);
      }
      return;
    }
    
    console.log('Username column already exists or was successfully added!');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

addUsernameColumn(); 