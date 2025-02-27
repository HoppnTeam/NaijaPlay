#!/usr/bin/env node

/**
 * This script populates the wallets table with existing users.
 * It should be run after the wallet tables migration.
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Log environment variables for debugging
console.log('Environment variables:')
console.log('SUPABASE_ENV:', process.env.SUPABASE_ENV)
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_URL_PROD:', process.env.NEXT_PUBLIC_SUPABASE_URL_PROD)

// Determine which environment to use
const isProduction = process.env.SUPABASE_ENV === 'production'
const supabaseUrl = isProduction 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD 
  : process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = isProduction 
  ? process.env.SUPABASE_SERVICE_ROLE_KEY_PROD 
  : process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Using Supabase URL:', supabaseUrl)

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey)

async function populateWallets() {
  try {
    console.log('Starting wallet population...')
    
    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`)
    }
    
    console.log(`Found ${users.users.length} users`)
    
    // Check which users already have wallets
    const { data: existingWallets, error: walletsError } = await supabase
      .from('wallets')
      .select('user_id')
    
    if (walletsError) {
      throw new Error(`Error fetching existing wallets: ${walletsError.message}`)
    }
    
    const existingWalletUserIds = new Set(existingWallets.map(wallet => wallet.user_id))
    console.log(`Found ${existingWalletUserIds.size} existing wallets`)
    
    // Create wallets for users who don't have one
    const usersWithoutWallets = users.users.filter(user => !existingWalletUserIds.has(user.id))
    console.log(`Creating wallets for ${usersWithoutWallets.length} users`)
    
    if (usersWithoutWallets.length === 0) {
      console.log('All users already have wallets. Nothing to do.')
      return
    }
    
    // Prepare wallet data for insertion
    const walletsToInsert = usersWithoutWallets.map(user => ({
      user_id: user.id,
      balance: 0,
      created_at: new Date(),
      updated_at: new Date()
    }))
    
    // Insert wallets in batches of 100
    const batchSize = 100
    for (let i = 0; i < walletsToInsert.length; i += batchSize) {
      const batch = walletsToInsert.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from('wallets')
        .insert(batch)
      
      if (insertError) {
        throw new Error(`Error inserting wallets (batch ${i / batchSize + 1}): ${insertError.message}`)
      }
      
      console.log(`Inserted ${batch.length} wallets (batch ${i / batchSize + 1})`)
    }
    
    console.log('Wallet population completed successfully!')
  } catch (error) {
    console.error('Error populating wallets:', error)
    process.exit(1)
  }
}

// Run the script
populateWallets()

 