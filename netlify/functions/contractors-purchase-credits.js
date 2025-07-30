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
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    }
  }

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
    const data = JSON.parse(event.body)
    const { contractor_id, amount, credits } = data

    if (!contractor_id) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Contractor ID is required' })
      }
    }

    let dollarAmount
    if (amount !== undefined) {
      dollarAmount = parseFloat(amount)
      if (dollarAmount < 10) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Minimum funding amount is $10' })
        }
      }
    } else {
      const creditCount = credits || 1
      dollarAmount = creditCount * 10
    }

    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', contractor_id)
      .single()

    if (contractorError || !contractor) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Contractor not found' })
      }
    }

    let customerId = contractor.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: contractor.email,
        name: contractor.contact_name,
        metadata: {
          contractor_id: contractor_id,
          business_name: contractor.business_name
        }
      })
      customerId = customer.id

      await supabase
        .from('contractors')
        .update({ stripe_customer_id: customerId })
        .eq('id', contractor_id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Wallet Deposit ($${dollarAmount.toFixed(2)})`,
              description: 'Custom Lead Match - Wallet Deposit'
            },
            unit_amount: Math.round(dollarAmount * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.URL || 'https://customleadmatch.netlify.app'}/contractor/${contractor_id}?payment=success`,
      cancel_url: `${process.env.URL || 'https://customleadmatch.netlify.app'}/contractor/${contractor_id}?payment=cancelled`,
      metadata: {
        contractor_id: contractor_id,
        credits: Math.ceil(dollarAmount / 10).toString(),
        amount: dollarAmount.toString()
      }
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        payment_url: session.url,
        session_id: session.id
      })
    }
  } catch (error) {
    console.error('Error:', error)
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
