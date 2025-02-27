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

async function fixProfilesTable() {
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
      
      if (sampleError.message.includes('does not exist')) {
        console.log('The profiles table might not exist. Attempting to create it...');
        
        // Create the profiles table if it doesn't exist
        // This is a simplified schema - adjust as needed
        const { error: createError } = await supabase.rpc('create_profiles_table');
        
        if (createError) {
          console.error('Error creating profiles table:', createError.message);
          console.log('Trying alternative approach...');
          
          // Alternative: Try to create the table using SQL
          // Note: This requires appropriate permissions
          try {
            const { error: sqlError } = await supabase.rpc('execute_sql', {
              sql: `
                CREATE TABLE IF NOT EXISTS public.profiles (
                  id UUID PRIMARY KEY REFERENCES auth.users(id),
                  email TEXT,
                  full_name TEXT,
                  role TEXT DEFAULT 'user',
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                  incentive_balance INTEGER DEFAULT 0
                );
              `
            });
            
            if (sqlError) {
              console.error('Error creating profiles table via SQL:', sqlError.message);
              return;
            }
            
            console.log('Successfully created profiles table via SQL');
          } catch (sqlExecError) {
            console.error('Error executing SQL:', sqlExecError.message);
            return;
          }
        } else {
          console.log('Successfully created profiles table');
        }
      }
    } else {
      console.log('Profiles table exists. Sample profile:');
      console.log(JSON.stringify(sampleProfile, null, 2));
      
      // Check if the username column exists
      const hasUsername = Object.keys(sampleProfile).includes('username');
      
      if (!hasUsername) {
        console.log('Username column is missing. Attempting to add it...');
        
        try {
          const { error: alterError } = await supabase.rpc('execute_sql', {
            sql: `
              ALTER TABLE public.profiles 
              ADD COLUMN IF NOT EXISTS username TEXT;
            `
          });
          
          if (alterError) {
            console.error('Error adding username column:', alterError.message);
            return;
          }
          
          console.log('Successfully added username column');
        } catch (alterExecError) {
          console.error('Error executing ALTER TABLE:', alterExecError.message);
          return;
        }
      }
    }
    
    // Now let's check the admin user and make sure they have the right role
    const targetEmail = '5waycontractors@gmail.com';
    
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
    
    // Check if the user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      
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
      }
      
      return;
    }
    
    console.log('Current profile:', profile);
    
    // Update the profile to ensure it has the correct fields
    const updates = {
      email: targetEmail,
      role: 'admin'
    };
    
    // Add username if it doesn't exist
    if (!profile.username) {
      updates.username = 'admin';
    }
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating profile:', updateError.message);
      return;
    }
    
    console.log('Updated profile:', updatedProfile);
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

fixProfilesTable(); 