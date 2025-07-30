import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })
dotenv.config({ path: '.env' })

const requiredEnvVars = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
}

console.log('Environment variables check:', {
  SUPABASE_URL: requiredEnvVars.SUPABASE_URL ? 'SET' : 'MISSING',
  SUPABASE_SERVICE_KEY: requiredEnvVars.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING',
  STRIPE_SECRET_KEY: requiredEnvVars.STRIPE_SECRET_KEY ? 'SET' : 'MISSING',
  STRIPE_WEBHOOK_SECRET: requiredEnvVars.STRIPE_WEBHOOK_SECRET ? 'SET' : 'MISSING'
})

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars)
}

const supabase = createClient(
  requiredEnvVars.SUPABASE_URL,
  requiredEnvVars.SUPABASE_SERVICE_KEY
)

const stripe = new Stripe(requiredEnvVars.STRIPE_SECRET_KEY)

async function transactionExists(stripeEventId, contractorId) {
  try {
    console.log(`Checking transaction existence for event ${stripeEventId} and contractor ${contractorId}`)
    
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .eq('contractor_id', contractorId)
      .eq('source', 'stripe')
      .ilike('notes', `%${stripeEventId}%`)
      .limit(1)

    if (error) {
      console.error('Error checking transaction existence:', {
        error,
        stripeEventId,
        contractorId,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details
      })
      return false
    }

    const exists = data && data.length > 0
    console.log(`Transaction existence check result: ${exists}`)
    return exists
  } catch (error) {
    console.error('Exception in transactionExists:', {
      error: error.message,
      stack: error.stack,
      stripeEventId,
      contractorId
    })
    return false
  }
}

async function createTransaction(contractorId, amount, eventType, eventId, customerEmail) {
  try {
    console.log(`Creating transaction:`, {
      contractorId,
      amount,
      eventType,
      eventId,
      customerEmail
    })

    const exists = await transactionExists(eventId, contractorId)
    if (exists) {
      console.log(`Transaction already exists for ${eventType} ${eventId}, skipping`)
      return { success: true, duplicate: true }
    }

    const transactionData = {
      contractor_id: contractorId,
      amount: parseFloat(amount),
      source: 'stripe',
      notes: `${eventType} - $${amount.toFixed(2)} from ${customerEmail || 'unknown'} (${eventId})`
    }

    console.log('Inserting transaction data:', transactionData)

    const { data, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()

    if (transactionError) {
      console.error('Failed to insert transaction:', {
        error: transactionError,
        errorCode: transactionError.code,
        errorMessage: transactionError.message,
        errorDetails: transactionError.details,
        transactionData
      })
      return { success: false, error: transactionError }
    } else {
      console.log(`Successfully added $${amount.toFixed(2)} to contractor ${contractorId} wallet via ${eventType}`)
      console.log('Inserted transaction:', data)
      return { success: true, duplicate: false, data }
    }
  } catch (error) {
    console.error('Exception in createTransaction:', {
      error: error.message,
      stack: error.stack,
      contractorId,
      amount,
      eventType,
      eventId
    })
    return { success: false, error: error.message }
  }
}

export const handler = async (event, context) => {
  console.log('Webhook handler started:', {
    httpMethod: event.httpMethod,
    headers: Object.keys(event.headers || {}),
    hasBody: !!event.body,
    bodyLength: event.body ? event.body.length : 0
  })

  if (event.httpMethod !== 'POST') {
    console.log('Non-POST request received:', event.httpMethod)
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
    if (missingVars.length > 0) {
      console.error('Cannot process webhook due to missing environment variables:', missingVars)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          detail: 'Server configuration error',
          missingVars: missingVars
        })
      }
    }

    const sig = event.headers['stripe-signature']
    const endpointSecret = requiredEnvVars.STRIPE_WEBHOOK_SECRET

    console.log('Webhook signature verification:', {
      hasSignature: !!sig,
      hasSecret: !!endpointSecret,
      secretLength: endpointSecret ? endpointSecret.length : 0
    })

    let stripeEvent
    try {
      stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret)
      console.log('Webhook signature verified successfully for event:', stripeEvent.type)
    } catch (err) {
      console.error('Webhook signature verification failed:', {
        error: err.message,
        hasSignature: !!sig,
        hasSecret: !!endpointSecret,
        bodyLength: event.body ? event.body.length : 0
      })
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
      console.log('Processing payment_intent.succeeded event')
      try {
        const paymentIntent = stripeEvent.data.object
        const amount = paymentIntent.amount / 100 // Convert from cents to dollars
        const customerEmail = paymentIntent.receipt_email
        const timestamp = new Date(paymentIntent.created * 1000).toISOString()
        
        console.log(`Payment Intent Succeeded:`, {
          amount: `$${amount.toFixed(2)}`,
          customerEmail,
          timestamp,
          paymentIntentId: paymentIntent.id,
          metadata: paymentIntent.metadata
        })

        const contractorId = paymentIntent.metadata?.contractor_id
        if (contractorId) {
          const result = await createTransaction(contractorId, amount, 'Payment Intent', paymentIntent.id, customerEmail)
          console.log('Payment Intent transaction result:', result)
        } else {
          console.log('No contractor_id found in payment intent metadata')
        }
      } catch (error) {
        console.error('Error processing payment_intent.succeeded:', {
          error: error.message,
          stack: error.stack
        })
      }
    }

    if (stripeEvent.type === 'charge.succeeded') {
      console.log('Processing charge.succeeded event')
      try {
        const charge = stripeEvent.data.object
        const amount = charge.amount / 100 // Convert from cents to dollars
        const customerEmail = charge.receipt_email || charge.billing_details?.email
        const timestamp = new Date(charge.created * 1000).toISOString()
        
        console.log(`Charge Succeeded:`, {
          amount: `$${amount.toFixed(2)}`,
          customerEmail,
          timestamp,
          chargeId: charge.id,
          metadata: charge.metadata
        })

        const contractorId = charge.metadata?.contractor_id
        if (contractorId) {
          const result = await createTransaction(contractorId, amount, 'Charge', charge.id, customerEmail)
          console.log('Charge transaction result:', result)
        } else {
          console.log('No contractor_id found in charge metadata')
        }
      } catch (error) {
        console.error('Error processing charge.succeeded:', {
          error: error.message,
          stack: error.stack
        })
      }
    }

    if (stripeEvent.type === 'checkout.session.completed') {
      console.log('Processing checkout.session.completed event')
      try {
        const session = stripeEvent.data.object
        const { contractor_id, credits } = session.metadata || {}

        console.log('Checkout session data:', {
          sessionId: session.id,
          metadata: session.metadata,
          contractor_id,
          credits
        })

        if (contractor_id && credits) {
          const depositAmount = parseFloat(credits) * 10.00

          const exists = await transactionExists(session.id, contractor_id)
          if (!exists) {
            const transactionData = {
              contractor_id,
              amount: depositAmount,
              source: 'stripe',
              notes: `Checkout Session - ${credits} credit${credits > 1 ? 's' : ''} purchased ($${depositAmount.toFixed(2)}) (${session.id})`
            }

            console.log('Inserting checkout session transaction:', transactionData)

            const { data, error: transactionError } = await supabase
              .from('transactions')
              .insert(transactionData)
              .select()

            if (transactionError) {
              console.error('Failed to insert checkout session transaction:', {
                error: transactionError,
                errorCode: transactionError.code,
                errorMessage: transactionError.message,
                errorDetails: transactionError.details,
                transactionData
              })
            } else {
              console.log(`Successfully added $${depositAmount} to contractor ${contractor_id} wallet via Checkout Session`)
              console.log('Inserted checkout session transaction:', data)
            }
          } else {
            console.log(`Transaction already exists for checkout session ${session.id}, skipping`)
          }
        } else {
          console.log('Missing contractor_id or credits in checkout session metadata')
        }
      } catch (error) {
        console.error('Error processing checkout.session.completed:', {
          error: error.message,
          stack: error.stack
        })
      }
    }

    console.log('Webhook processing completed successfully')
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ received: true, eventType: stripeEvent.type })
    }
  } catch (error) {
    console.error('Webhook error:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    })
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        detail: 'Internal server error',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  }
}
