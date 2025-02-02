import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { PaystackClient } from '@/lib/paystack'
import { purchaseRateLimit, checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { validatePaymentAmount } from '@/lib/utils'

// Initialize Paystack client
const paystack = new PaystackClient(process.env.PAYSTACK_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      purchaseRateLimit,
      `purchase_${session.user.id}`
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          reset: new Date(rateLimitResult.reset).toISOString()
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      )
    }

    // Get request body
    const { packageId, teamId } = await req.json()
    if (!packageId || !teamId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch token package details
    const { data: tokenPackage, error: packageError } = await supabase
      .from('token_packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single()

    if (packageError || !tokenPackage) {
      return NextResponse.json(
        { error: 'Invalid or inactive package selected' },
        { status: 400 }
      )
    }

    // Validate payment amount
    if (!validatePaymentAmount(tokenPackage.price)) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Verify team ownership
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', teamId)
      .eq('user_id', session.user.id)
      .single()

    if (teamError || !team) {
      return NextResponse.json(
        { error: 'Team not found or unauthorized' },
        { status: 403 }
      )
    }

    // Check for existing pending purchase
    const { data: existingPurchase } = await supabase
      .from('token_purchases')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('team_id', teamId)
      .eq('payment_status', 'pending')
      .single()

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You have a pending purchase for this team' },
        { status: 400 }
      )
    }

    // Create token purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('token_purchases')
      .insert({
        user_id: session.user.id,
        team_id: teamId,
        package_id: packageId,
        amount_paid: tokenPackage.price,
        tokens_credited: tokenPackage.token_amount,
        payment_status: 'pending'
      })
      .select()
      .single()

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'Failed to create purchase record' },
        { status: 500 }
      )
    }

    // Initialize Paystack payment
    const payment = await paystack.transaction.initialize({
      email: session.user.email,
      amount: Math.round(tokenPackage.price * 100), // Convert to kobo
      reference: `TOKEN_${purchase.id}`,
      metadata: {
        purchase_id: purchase.id,
        team_id: teamId,
        package_id: packageId,
        token_amount: tokenPackage.token_amount
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tokens/verify`
    })

    // Update purchase record with payment reference
    await supabase
      .from('token_purchases')
      .update({ payment_reference: payment.reference })
      .eq('id', purchase.id)

    return NextResponse.json({
      success: true,
      payment_url: payment.authorization_url,
      reference: payment.reference
    }, {
      headers: getRateLimitHeaders(rateLimitResult)
    })

  } catch (error) {
    console.error('Token purchase error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 