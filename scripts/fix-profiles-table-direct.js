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

async function fixProfilesTable() {
  try {
    console.log('Checking profiles table structure...');
    
    // First, let's check if we can get profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError.message);
      
      // If the table doesn't exist, try to create it
      if (profilesError.message.includes('relation "profiles" does not exist')) {
        console.log('Profiles table does not exist. Creating it...');
        
        // Create the profiles table with all required columns
        const { error: createError } = await supabase.rpc('execute_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS public.profiles (
              id UUID PRIMARY KEY REFERENCES auth.users(id),
              email TEXT,
              role TEXT DEFAULT 'user',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              full_name TEXT,
              username TEXT,
              incentive_balance INTEGER DEFAULT 0
            );
            
            -- Add RLS policies
            ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view their own profile"
              ON public.profiles
              FOR SELECT
              USING (auth.uid() = id);
              
            CREATE POLICY "Users can update their own profile"
              ON public.profiles
              FOR UPDATE
              USING (auth.uid() = id);
          `
        });
        
        if (createError) {
          console.error('Error creating profiles table:', createError.message);
          
          // If RPC doesn't work, provide SQL to run manually
          console.log('\nPlease run the following SQL in the Supabase SQL Editor:');
          console.log(`
            CREATE TABLE IF NOT EXISTS public.profiles (
              id UUID PRIMARY KEY REFERENCES auth.users(id),
              email TEXT,
              role TEXT DEFAULT 'user',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
              full_name TEXT,
              username TEXT,
              incentive_balance INTEGER DEFAULT 0
            );
            
            -- Add RLS policies
            ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view their own profile"
              ON public.profiles
              FOR SELECT
              USING (auth.uid() = id);
              
            CREATE POLICY "Users can update their own profile"
              ON public.profiles
              FOR UPDATE
              USING (auth.uid() = id);
          `);
        } else {
          console.log('Profiles table created successfully!');
        }
        
        return;
      }
      
      return;
    }
    
    if (profiles.length === 0) {
      console.log('No profiles found in the table.');
      
      // Try to add a column directly using SQL
      console.log('Attempting to add username column directly...');
      
      try {
        // Try using direct SQL query
        const { error: alterError } = await supabase.rpc('execute_sql', {
          sql: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;'
        });
        
        if (alterError) {
          console.error('Error adding username column:', alterError.message);
          
          // If RPC doesn't work, provide SQL to run manually
          console.log('\nPlease run the following SQL in the Supabase SQL Editor:');
          console.log(`
            ALTER TABLE public.profiles 
            ADD COLUMN IF NOT EXISTS username TEXT;
          `);
        } else {
          console.log('Username column added successfully!');
        }
      } catch (sqlError) {
        console.error('Error executing SQL:', sqlError.message);
      }
    } else {
      console.log('Profiles table exists. Sample profile:');
      console.log(JSON.stringify(profiles[0], null, 2));
      
      // Check if the username column exists
      const hasUsername = Object.keys(profiles[0]).includes('username');
      
      if (!hasUsername) {
        console.log('Username column is missing. Adding it directly...');
        
        try {
          // Try using direct SQL query
          const { error: alterError } = await supabase.rpc('execute_sql', {
            sql: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;'
          });
          
          if (alterError) {
            console.error('Error adding username column:', alterError.message);
            
            // If RPC doesn't work, provide SQL to run manually
            console.log('\nPlease run the following SQL in the Supabase SQL Editor:');
            console.log(`
              ALTER TABLE public.profiles 
              ADD COLUMN IF NOT EXISTS username TEXT;
            `);
            
            console.log('\nAlternatively, you can use the Supabase dashboard to add the column manually:');
            console.log('1. Go to the Supabase dashboard');
            console.log('2. Navigate to the "Table Editor"');
            console.log('3. Select the "profiles" table');
            console.log('4. Click "Add column"');
            console.log('5. Set the name to "username" and type to "text"');
            console.log('6. Click "Save"');
          } else {
            console.log('Username column added successfully!');
          }
        } catch (sqlError) {
          console.error('Error executing SQL:', sqlError.message);
        }
      } else {
        console.log('Username column already exists.');
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
      .maybeSingle();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError.message);
      return;
    }
    
    if (!profile) {
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