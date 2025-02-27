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

async function verifyAdminRole() {
  const email = '5waycontractors@gmail.com';
  
  try {
    // Get the user's profile from the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', '5b6330a1-86a3-45a6-b871-704492093ff3')
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      return;
    }
    
    if (!profileData) {
      console.error('Profile not found');
      return;
    }
    
    console.log('Profile data:');
    console.log(JSON.stringify(profileData, null, 2));
    
    if (profileData.role === 'admin') {
      console.log('✅ User has been successfully set as an admin');
    } else {
      console.log('❌ User does not have admin role. Current role:', profileData.role);
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

verifyAdminRole(); 