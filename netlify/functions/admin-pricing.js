import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

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

  try {
    if (event.httpMethod === 'GET') {
      const { data: categoryPricing, error } = await supabase
        .from('category_pricing')
        .select('*')
        .order('category')

      if (error) {
        console.error('Error fetching category pricing:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to fetch pricing' })
        }
      }

      const pricingByCategory = {}
      categoryPricing.forEach(item => {
        pricingByCategory[item.category] = parseFloat(item.price)
      })

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          category_pricing: pricingByCategory,
          categories: categoryPricing.map(item => item.category)
        })
      }
    }

    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body)
      const { category, price } = data

      if (!category || !price || isNaN(price) || price < 0) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Valid category and price are required' })
        }
      }

      const { data: oldPricing } = await supabase
        .from('category_pricing')
        .select('price')
        .eq('category', category)
        .single()

      const { error } = await supabase
        .from('category_pricing')
        .upsert({
          category: category,
          price: parseFloat(price),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'category'
        })

      if (error) {
        console.error('Pricing update error:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to update pricing' })
        }
      }

      try {
        await supabase
          .from('pricing_history')
          .insert({
            admin_id: 'admin',
            category,
            old_price: oldPricing?.price || null,
            new_price: parseFloat(price),
            notes: `Price updated from admin dashboard`
          })
      } catch (auditError) {
        console.error('Failed to log pricing change:', auditError)
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Pricing updated successfully', category, price })
      }
    }

    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ detail: 'Method not allowed' })
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
