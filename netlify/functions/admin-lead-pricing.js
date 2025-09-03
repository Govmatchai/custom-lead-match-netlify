import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers }
  }

  try {
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('lead_pricing')
        .select('*')
        .order('category', { ascending: true })
        .order('lead_type', { ascending: true })

      if (error) {
        console.error('Error fetching lead pricing:', error)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ detail: 'Failed to fetch lead pricing' })
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      }
    }

    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body)
      const { category, lead_type, price } = data

      if (!category || !lead_type || price === undefined) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ detail: 'Category, lead_type, and price are required' })
        }
      }

      const { data: oldPricing } = await supabase
        .from('lead_pricing')
        .select('price')
        .eq('category', category)
        .eq('lead_type', lead_type)
        .single()

      const { error } = await supabase
        .from('lead_pricing')
        .upsert({
          category,
          lead_type,
          price: parseFloat(price),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Database update error:', error)
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ detail: 'Failed to update pricing' })
        }
      }

      try {
        await supabase
          .from('pricing_history')
          .insert({
            admin_id: 'admin',
            category,
            lead_type,
            old_price: oldPricing?.price || null,
            new_price: parseFloat(price),
            timestamp: new Date().toISOString()
          })
      } catch (auditError) {
        console.error('Failed to log pricing change:', auditError)
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Pricing updated successfully' })
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Error in admin-lead-pricing:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ detail: 'Internal server error' })
    }
  }
}
