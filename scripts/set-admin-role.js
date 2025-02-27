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

async function setAdminRole() {
  const email = '5waycontractors@gmail.com';
  
  try {
    // First, try to get the user from auth
    console.log(`Looking for user with email: ${email}`);
    
    // Since we're using a local instance, we might not have admin API access
    // Let's try to get the user ID from the profiles table directly
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error fetching profile by email:', profileError.message);
      
      // Fallback: Try to use the auth API if available
      try {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
        
        if (userError) {
          console.error('Error fetching user from auth API:', userError.message);
          return;
        }
        
        if (!userData || !userData.user) {
          console.error('User not found with email:', email);
          return;
        }
        
        const userId = userData.user.id;
        console.log(`Found user with ID: ${userId}`);
        
        // Update the user's role in the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId);
        
        if (error) {
          console.error('Error updating user role:', error.message);
          return;
        }
        
        console.log(`Successfully updated user ${email} to admin role`);
      } catch (adminError) {
        console.error('Admin API not available:', adminError.message);
      }
      return;
    }
    
    if (!profileData) {
      console.error('Profile not found with email:', email);
      return;
    }
    
    const userId = profileData.id;
    console.log(`Found user with ID: ${userId}`);
    
    // Update the user's role in the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating user role:', error.message);
      return;
    }
    
    console.log(`Successfully updated user ${email} to admin role`);
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

setAdminRole(); 