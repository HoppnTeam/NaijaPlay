import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Parse request body
    const { amount, bankName, accountNumber, accountName, note } = await request.json()
    
    // Validate request data
    if (!amount || amount < 1000 || amount > 500000) {
      return NextResponse.json(
        { message: 'Invalid withdrawal amount. Amount must be between ₦1,000 and ₦500,000' },
        { status: 400 }
      )
    }
    
    if (!bankName || !accountNumber || !accountName) {
      return NextResponse.json(
        { message: 'Bank details are required' },
        { status: 400 }
      )
    }
    
    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance, id')
      .eq('user_id', user.id)
      .single()
    
    if (walletError || !wallet) {
      return NextResponse.json(
        { message: 'Wallet not found' },
        { status: 404 }
      )
    }
    
    // Check if user has sufficient balance
    if (wallet.balance < amount) {
      return NextResponse.json(
        { message: 'Insufficient balance' },
        { status: 400 }
      )
    }
    
    // Start a transaction
    const { data: transaction, error: transactionError } = await supabase.rpc(
      'create_withdrawal_request',
      {
        p_user_id: user.id,
        p_wallet_id: wallet.id,
        p_amount: amount,
        p_bank_name: bankName,
        p_account_number: accountNumber,
        p_account_name: accountName,
        p_note: note || null
      }
    )
    
    if (transactionError) {
      console.error('Withdrawal transaction error:', transactionError)
      return NextResponse.json(
        { message: 'Failed to process withdrawal request' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      transactionId: transaction.transaction_id
    })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Function to validate the request
export async function OPTIONS(request: Request) {
  return NextResponse.json(
    { message: 'OK' },
    {
      headers: {
        'Allow': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      }
    }
  )
} 