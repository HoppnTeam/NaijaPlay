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

// The email of the user you want to check and update
const targetEmail = '5waycontractors@gmail.com';

async function checkAndUpdateRole() {
  try {
    // First, get the user by email
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
    
    // Check current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      
      // If profile doesn't exist, create it
      if (profileError.code === 'PGRST116') {
        console.log('Profile not found, creating new profile...');
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: targetEmail,
            role: 'admin',
            full_name: 'Admin User',
            username: 'admin'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError.message);
          return;
        }
        
        console.log('Created new profile with admin role:', newProfile);
        return;
      }
      
      return;
    }
    
    console.log('Current profile:', profile);
    
    // Update the role to admin if it's not already
    if (profile.role !== 'admin') {
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating profile:', updateError.message);
        return;
      }
      
      console.log('Updated profile with admin role:', updatedProfile);
    } else {
      console.log('User already has admin role');
    }
    
    // Double-check that the role is correctly set
    const { data: checkProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (checkError) {
      console.error('Error checking profile:', checkError.message);
      return;
    }
    
    console.log('Final profile state:', checkProfile);
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

checkAndUpdateRole(); 