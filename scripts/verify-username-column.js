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

async function verifyUsernameColumn() {
  try {
    console.log('Verifying if username column exists in profiles table...');
    
    // First, check if we can connect to the database
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('Error connecting to database:', profilesError.message);
      return;
    }
    
    if (profiles.length === 0) {
      console.log('No profiles found in the table. Cannot verify column existence.');
      return;
    }
    
    console.log('Successfully connected to database.');
    console.log(`Found ${profiles.length} profiles.`);
    
    // Check if the username column exists in the returned data
    const hasUsername = 'username' in profiles[0];
    
    if (hasUsername) {
      console.log('✅ SUCCESS: Username column exists in the profiles table!');
      
      // Check if any profiles have username values
      const profilesWithUsername = profiles.filter(p => p.username);
      console.log(`${profilesWithUsername.length} out of ${profiles.length} profiles have username values.`);
      
      // Display sample profiles
      console.log('\nSample profiles:');
      profiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`);
        console.log(`  ID: ${profile.id}`);
        console.log(`  Email: ${profile.email}`);
        console.log(`  Role: ${profile.role}`);
        console.log(`  Username: ${profile.username || '(not set)'}`);
        console.log(`  Full Name: ${profile.full_name || '(not set)'}`);
        console.log('---');
      });
    } else {
      console.log('❌ ERROR: Username column does not exist in the profiles table.');
      console.log('Please add the column using the Supabase SQL Editor or Table Editor.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

verifyUsernameColumn(); 