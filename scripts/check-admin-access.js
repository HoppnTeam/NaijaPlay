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

async function checkAdminAccess() {
  try {
    console.log('Checking admin access...');
    
    // Get the admin user
    const targetEmail = '5waycontractors@gmail.com';
    const targetId = '5b6330a1-86a3-45a6-b871-704492093ff3';
    
    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetId)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      return;
    }
    
    console.log('Admin profile data:');
    console.log(JSON.stringify(profile, null, 2));
    
    // Check if the user has an admin role
    const isAdmin = profile.role === 'admin';
    console.log('Is admin:', isAdmin);
    
    if (!isAdmin) {
      console.log('Updating user to admin role...');
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', targetId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating profile:', updateError.message);
        return;
      }
      
      console.log('Updated profile with admin role:', updatedProfile);
    }
    
    // Check middleware permissions
    console.log('\nChecking middleware permissions...');
    console.log('The middleware.ts file should allow access to /admin/* routes for users with admin role.');
    console.log('If you are still having issues, check the following:');
    console.log('1. The NavClient component is correctly checking for admin role');
    console.log('2. The middleware is correctly checking for admin role');
    console.log('3. The admin layout is correctly checking for admin role');
    
    // Check for any active sessions
    const { data: sessions, error: sessionsError } = await supabase.auth.admin.listUsers();
    
    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError.message);
      return;
    }
    
    const adminUser = sessions.users.find(u => u.email === targetEmail);
    
    if (!adminUser) {
      console.error('Admin user not found in active sessions');
      return;
    }
    
    console.log('\nAdmin user session data:');
    console.log({
      id: adminUser.id,
      email: adminUser.email,
      last_sign_in_at: adminUser.last_sign_in_at,
      created_at: adminUser.created_at
    });
    
    console.log('\nAdmin access check complete.');
    console.log('If you are still having issues, try the following:');
    console.log('1. Sign out and sign back in with the admin account');
    console.log('2. Clear browser cookies and cache');
    console.log('3. Check browser console for any errors');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

checkAdminAccess(); 