import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables
config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanup() {
  try {
    console.log('Starting cleanup...')
    
    // Read and execute the SQL script
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'cleanup-teams.sql'),
      'utf8'
    )
    
    const { error } = await supabase.rpc('exec_sql', {
      sql_string: sqlScript
    })

    if (error) throw error
    
    console.log('Cleanup completed successfully')
  } catch (error) {
    console.error('Error during cleanup:', error)
    process.exit(1)
  }
}

cleanup() 