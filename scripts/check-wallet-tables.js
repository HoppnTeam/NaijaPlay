#!/usr/bin/env node

/**
 * This script checks if the wallet tables were created correctly.
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Determine which environment to use
const isProduction = process.env.SUPABASE_ENV === 'production'
const supabaseUrl = isProduction 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL_PROD 
  : process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = isProduction 
  ? process.env.SUPABASE_SERVICE_ROLE_KEY_PROD 
  : process.env.SUPABASE_SERVICE_ROLE_KEY

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkWalletTables() {
  try {
    console.log('Checking wallet tables...')
    
    // Check if the wallets table exists
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('*')
      .limit(5)
    
    if (walletsError) {
      console.error('Error fetching wallets:', walletsError.message)
    } else {
      console.log('✅ Wallets table exists')
      console.log(`Found ${wallets.length} wallets:`)
      console.table(wallets)
    }
    
    // Check if the transactions table exists
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .limit(5)
    
    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError.message)
    } else {
      console.log('✅ Transactions table exists')
      console.log(`Found ${transactions.length} transactions:`)
      console.table(transactions)
    }
    
    // Check if the user_balances view exists
    const { data: userBalances, error: userBalancesError } = await supabase
      .from('user_balances')
      .select('*')
      .limit(5)
    
    if (userBalancesError) {
      console.error('Error fetching user_balances:', userBalancesError.message)
    } else {
      console.log('✅ user_balances view exists')
      console.log(`Found ${userBalances.length} user balances:`)
      console.table(userBalances)
    }
    
    // Check if the wallet_transactions view exists
    const { data: walletTransactions, error: walletTransactionsError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .limit(5)
    
    if (walletTransactionsError) {
      console.error('Error fetching wallet_transactions:', walletTransactionsError.message)
    } else {
      console.log('✅ wallet_transactions view exists')
      console.log(`Found ${walletTransactions.length} wallet transactions:`)
      console.table(walletTransactions)
    }
    
    // Test the add_to_wallet function
    console.log('Testing add_to_wallet function...')
    const { data: user } = await supabase.auth.admin.listUsers()
    const testUserId = user.users[0].id
    
    const { error: addToWalletError } = await supabase.rpc('add_to_wallet', {
      p_user_id: testUserId,
      p_amount: 1000,
      p_description: 'Test deposit'
    })
    
    if (addToWalletError) {
      console.error('Error testing add_to_wallet:', addToWalletError.message)
    } else {
      console.log('✅ add_to_wallet function works')
      
      // Check the updated balance
      const { data: updatedWallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', testUserId)
        .single()
      
      console.log(`Updated balance: ${updatedWallet.balance}`)
    }
    
    console.log('Wallet tables check completed!')
  } catch (error) {
    console.error('Error checking wallet tables:', error)
    process.exit(1)
  }
}

// Run the script
checkWalletTables() 