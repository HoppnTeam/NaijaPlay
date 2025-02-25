import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_API = 'https://api.paystack.co'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const { amount, tokens, package_name, email } = await request.json()

    // Validate required fields
    if (!amount || !tokens || !package_name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate Paystack secret key
    if (!PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY is not configured')
      return NextResponse.json(
        { error: 'Payment service is not configured' },
        { status: 500 }
      )
    }

    try {
      // Create transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: tokens,
          status: 'pending',
          metadata: {
            package_name,
            payment_amount: amount / 100 // Convert back from kobo to Naira for record
          }
        })
        .select()
        .single()

      if (transactionError) {
        console.error('Error creating transaction:', transactionError)
        throw new Error('Failed to create transaction')
      }

      // Initialize Paystack transaction
      const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount, // Amount in kobo
          reference: transaction.id,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet/callback`,
          metadata: {
            user_id: user.id,
            transaction_id: transaction.id,
            tokens,
            package_name
          }
        })
      })

      if (!response.ok) {
        // If Paystack request fails, update transaction status and throw error
        await supabase
          .from('wallet_transactions')
          .update({ status: 'failed' })
          .eq('id', transaction.id)

        const errorData = await response.json()
        console.error('Paystack error:', errorData)
        throw new Error('Payment initialization failed')
      }

      const paystackData = await response.json()

      if (!paystackData.status || !paystackData.data?.authorization_url) {
        throw new Error('Invalid response from payment provider')
      }

      // Return the authorization URL and reference
      return NextResponse.json({
        authorization_url: paystackData.data.authorization_url,
        reference: transaction.id
      })

    } catch (error) {
      console.error('Error in payment process:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Payment initialization failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in topup route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')
    
    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Verify transaction with Paystack
    const response = await fetch(`${PAYSTACK_API}/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    })

    const verificationData = await response.json()

    if (!response.ok || !verificationData.status) {
      // Update transaction status to failed
      await supabase
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('id', reference)

      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 500 }
      )
    }

    // Get the transaction record
    const { data: transaction } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('id', reference)
      .single()

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Update user's balance
    const { error: balanceError } = await supabase.rpc('update_user_balance', {
      p_user_id: transaction.user_id,
      p_amount: transaction.amount
    })

    if (balanceError) {
      console.error('Error updating balance:', balanceError)
      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      )
    }

    // Update transaction status to completed
    const { error: updateError } = await supabase
      .from('wallet_transactions')
      .update({ 
        status: 'completed',
        reference: verificationData.data.reference
      })
      .eq('id', reference)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in verify route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 