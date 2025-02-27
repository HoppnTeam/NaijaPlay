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

// The email of the user you want to check
const targetEmail = '5waycontractors@gmail.com';

async function checkCurrentSession() {
  try {
    // Get the user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError.message);
      return;
    }
    
    const user = userData.users.find(u => u.email === targetEmail);
    
    if (!user) {
      console.error(`User with email ${targetEmail} not found`);
      return;
    }
    
    console.log('Found user:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    });
    
    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      return;
    }
    
    console.log('User profile:', profile);
    
    // Check if the user has an admin role
    const isAdmin = profile.role === 'admin';
    console.log('Is admin:', isAdmin);
    
    // Get the user's session
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.getUserById(user.id);
    
    if (sessionError) {
      console.error('Error fetching session:', sessionError.message);
      return;
    }
    
    console.log('User session data:', sessionData);
    
    // Check if the user's email matches the profile email
    const emailMatch = user.email === profile.email;
    console.log('Email matches profile email:', emailMatch);
    
    if (!emailMatch) {
      console.log('Email mismatch detected. Updating profile email...');
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ email: user.email })
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating profile email:', updateError.message);
        return;
      }
      
      console.log('Updated profile:', updatedProfile);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

checkCurrentSession(); 