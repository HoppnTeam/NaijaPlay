import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PaystackClient } from '@/lib/paystack'

const paystack = new PaystackClient(process.env.PAYSTACK_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the payment reference from the request
    const { reference } = await req.json()
    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    // Verify the payment with Paystack
    const verification = await paystack.transaction.verify(reference)
    
    if (verification.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    // Update the purchase record
    const { error: updateError } = await supabase
      .from('token_purchases')
      .update({
        payment_status: 'completed',
        payment_method: 'paystack',
        updated_at: new Date().toISOString()
      })
      .eq('payment_reference', reference)

    if (updateError) {
      console.error('Failed to update purchase record:', updateError)
      return NextResponse.json(
        { error: 'Failed to update purchase record' },
        { status: 500 }
      )
    }

    // The trigger we created earlier will automatically:
    // 1. Update the team's budget
    // 2. Update token purchase stats
    // 3. Set the last purchase timestamp

    return NextResponse.json({
      success: true,
      message: 'Payment verified and tokens credited'
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests for the callback URL
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')
    
    if (!reference) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tokens?error=missing_reference`
      )
    }

    // Verify the payment
    const verification = await paystack.transaction.verify(reference)
    
    if (verification.status === 'success') {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tokens?success=true`
      )
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tokens?error=payment_failed`
      )
    }

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tokens?error=verification_failed`
    )
  }
} 