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

async function updateProfileEmail() {
  const userId = '5b6330a1-86a3-45a6-b871-704492093ff3';
  const email = '5waycontractors@gmail.com';
  
  try {
    // First, check if the profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      return;
    }
    
    console.log('Current profile data:');
    console.log(JSON.stringify(profileData, null, 2));
    
    // Update the email field
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        email: email,
        role: 'admin' // Ensure role is set to admin
      })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating profile:', error.message);
      return;
    }
    
    console.log(`Successfully updated profile email to ${email} and role to admin`);
    
    // Verify the update
    const { data: updatedProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (verifyError) {
      console.error('Error verifying profile update:', verifyError.message);
      return;
    }
    
    console.log('Updated profile data:');
    console.log(JSON.stringify(updatedProfile, null, 2));
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

updateProfileEmail(); 