import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function transactionExists(stripeEventId, contractorId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('id')
    .eq('contractor_id', contractorId)
    .eq('source', 'stripe')
    .ilike('notes', `%${stripeEventId}%`)
    .limit(1)

  if (error) {
    console.error('Error checking transaction existence:', error)
    return false
  }

  return data && data.length > 0
}

async function createTransaction(contractorId, amount, eventType, eventId, customerEmail) {
  const exists = await transactionExists(eventId, contractorId)
  if (exists) {
    console.log(`Transaction already exists for ${eventType} ${eventId}, skipping`)
    return { success: true, duplicate: true }
  }

  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      contractor_id: contractorId,
      amount: amount,
      source: 'stripe',
      notes: `${eventType} - $${amount.toFixed(2)} from ${customerEmail || 'unknown'} (${eventId})`
    })

  if (transactionError) {
    console.error('Failed to insert transaction:', transactionError)
    return { success: false, error: transactionError }
  } else {
    console.log(`Successfully added $${amount.toFixed(2)} to contractor ${contractorId} wallet via ${eventType}`)
    return { success: true, duplicate: false }
  }
}

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

    if (stripeEvent.type === 'payment_intent.succeeded') {
      const paymentIntent = stripeEvent.data.object
      const amount = paymentIntent.amount / 100 // Convert from cents to dollars
      const customerEmail = paymentIntent.receipt_email
      const timestamp = new Date(paymentIntent.created * 1000).toISOString()
      
      console.log(`Payment Intent Succeeded:`, {
        amount: `$${amount.toFixed(2)}`,
        customerEmail,
        timestamp,
        paymentIntentId: paymentIntent.id
      })

      const contractorId = paymentIntent.metadata?.contractor_id
      if (contractorId) {
        await createTransaction(contractorId, amount, 'Payment Intent', paymentIntent.id, customerEmail)
      }
    }

    if (stripeEvent.type === 'charge.succeeded') {
      const charge = stripeEvent.data.object
      const amount = charge.amount / 100 // Convert from cents to dollars
      const customerEmail = charge.receipt_email || charge.billing_details?.email
      const timestamp = new Date(charge.created * 1000).toISOString()
      
      console.log(`Charge Succeeded:`, {
        amount: `$${amount.toFixed(2)}`,
        customerEmail,
        timestamp,
        chargeId: charge.id
      })

      const contractorId = charge.metadata?.contractor_id
      if (contractorId) {
        await createTransaction(contractorId, amount, 'Charge', charge.id, customerEmail)
      }
    }

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object
      const { contractor_id, credits } = session.metadata

      if (contractor_id && credits) {
        const depositAmount = parseFloat(credits) * 10.00

        const exists = await transactionExists(session.id, contractor_id)
        if (!exists) {
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
              contractor_id,
              amount: depositAmount,
              source: 'stripe',
              notes: `Checkout Session - ${credits} credit${credits > 1 ? 's' : ''} purchased ($${depositAmount.toFixed(2)}) (${session.id})`
            })

          if (transactionError) {
            console.error('Failed to insert transaction:', transactionError)
          } else {
            console.log(`Successfully added $${depositAmount} to contractor ${contractor_id} wallet via Checkout Session`)
          }
        } else {
          console.log(`Transaction already exists for checkout session ${session.id}, skipping`)
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
