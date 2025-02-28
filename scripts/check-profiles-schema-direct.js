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

async function checkProfilesSchema() {
  try {
    console.log('Checking profiles table schema...');
    
    // Get a sample profile to infer schema
    const { data: sampleProfile, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleError) {
      console.error('Error fetching sample profile:', sampleError.message);
      return;
    }
    
    console.log('Sample profile (to infer schema):');
    console.log(JSON.stringify(sampleProfile, null, 2));
    
    // Check for specific columns
    const columns = Object.keys(sampleProfile);
    console.log('\nDetected columns:');
    columns.forEach(column => {
      console.log(`- ${column}: ${typeof sampleProfile[column]}`);
    });
    
    // Check for required columns
    const requiredColumns = ['id', 'email', 'role', 'created_at', 'updated_at', 'username'];
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\n⚠️ Missing required columns:');
      missingColumns.forEach(col => {
        console.log(`- ${col}`);
      });
      console.log('\nPlease add these columns to the profiles table.');
    } else {
      console.log('\n✅ All required columns are present.');
    }
    
    // Check admin user
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
    
    // Check if the user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching admin profile:', profileError.message);
      return;
    }
    
    console.log('\nAdmin profile:');
    console.log(JSON.stringify(profile, null, 2));
    
    if (profile.role !== 'admin') {
      console.log('⚠️ Admin user does not have admin role!');
    } else {
      console.log('✅ Admin user has correct role.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

checkProfilesSchema(); 