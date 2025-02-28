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

async function createTestProfile() {
  try {
    console.log('Creating a test profile...');
    
    // First, create a test user
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'test-user@example.com',
      password: 'test-password-123',
      email_confirm: true
    });
    
    if (userError) {
      console.error('Error creating test user:', userError.message);
      return;
    }
    
    console.log('Test user created successfully:', {
      id: userData.user.id,
      email: userData.user.email
    });
    
    // Now create a profile for this user
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userData.user.id,
        email: userData.user.email,
        role: 'user',
        full_name: 'Test User',
        username: 'testuser'
      })
      .select();
    
    if (profileError) {
      console.error('Error creating profile:', profileError.message);
      
      if (profileError.message.includes('column "username" of relation "profiles" does not exist')) {
        console.log('❌ ERROR: Username column does not exist in the profiles table.');
        console.log('Please add the column using the Supabase SQL Editor or Table Editor.');
      }
      
      return;
    }
    
    console.log('Test profile created successfully:', profileData[0]);
    console.log('✅ SUCCESS: Profile created with username field!');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

createTestProfile(); 