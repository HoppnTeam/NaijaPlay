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

async function createDirectProfile() {
  try {
    console.log('Creating a direct profile entry...');
    
    // Generate a random UUID for the profile
    const profileId = 'test-' + Math.random().toString(36).substring(2, 15);
    
    // Try to insert a profile directly
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: profileId,
        email: 'test-direct@example.com',
        role: 'user',
        full_name: 'Test Direct User',
        username: 'testdirect',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (profileError) {
      console.error('Error creating profile:', profileError.message);
      
      if (profileError.message.includes('column "username" of relation "profiles" does not exist')) {
        console.log('❌ ERROR: Username column does not exist in the profiles table.');
        console.log('Please add the column using the Supabase SQL Editor or Table Editor.');
      } else if (profileError.message.includes('violates foreign key constraint')) {
        console.log('Note: The profiles table has a foreign key constraint to auth.users.');
        console.log('This is expected behavior - profiles should be linked to users.');
        console.log('\nPlease use the Supabase Studio to:');
        console.log('1. Create a user in the Auth section');
        console.log('2. Then create a profile with the same ID in the Table Editor');
      } else if (profileError.message.includes('relation "profiles" does not exist')) {
        console.log('❌ ERROR: The profiles table does not exist.');
        console.log('Please create the profiles table using the Supabase SQL Editor or Table Editor.');
      }
      
      return;
    }
    
    console.log('Test profile created successfully:', profileData[0]);
    console.log('✅ SUCCESS: Profile created with username field!');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

createDirectProfile(); 