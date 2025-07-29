import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  try {
    const sig = event.headers['stripe-signature']
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

    let stripeEvent
    try {
      stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Webhook signature verification failed' })
      }
    }

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object
      const { contractor_id, credits } = session.metadata

      if (contractor_id && credits) {
        const depositAmount = parseFloat(credits) * 10.00

        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            contractor_id,
            amount: depositAmount,
            source: 'stripe',
            notes: `Deposit via Stripe - ${credits} credit${credits > 1 ? 's' : ''} purchased`
          })

        if (transactionError) {
          console.error('Failed to insert transaction:', transactionError)
        } else {
          console.log(`Successfully added $${depositAmount} to contractor ${contractor_id} wallet`)
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ received: true })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ detail: 'Internal server error' })
    }
  }
}
