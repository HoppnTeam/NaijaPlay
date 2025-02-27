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

async function addUsernameColumn() {
  try {
    console.log('Checking profiles table structure...');
    
    // First, let's check if we can get a profile
    const { data: sampleProfile, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleError) {
      console.error('Error fetching sample profile:', sampleError.message);
      return;
    }
    
    console.log('Profiles table exists. Sample profile:');
    console.log(JSON.stringify(sampleProfile, null, 2));
    
    // Check if the username column exists
    const hasUsername = Object.keys(sampleProfile).includes('username');
    
    if (hasUsername) {
      console.log('Username column already exists.');
    } else {
      console.log('Username column is missing. We need to update the layout.tsx file to not require it.');
    }
    
    // Now let's update the admin user
    const targetEmail = '5waycontractors@gmail.com';
    const targetId = '5b6330a1-86a3-45a6-b871-704492093ff3';
    
    // Update the profile to ensure it has the admin role
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        email: targetEmail,
        role: 'admin'
      })
      .eq('id', targetId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating profile:', updateError.message);
      return;
    }
    
    console.log('Updated profile with admin role:', updatedProfile);
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

addUsernameColumn(); 