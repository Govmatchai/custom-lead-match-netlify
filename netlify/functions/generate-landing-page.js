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
    const { title, industry, subIndustry, promoText, contractorId, logoUrl, heroImages } = JSON.parse(event.body)
    
    if (!title || !industry || !subIndustry) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Missing required fields: title, industry, subIndustry' })
      }
    }

    const slug = `${industry.toLowerCase().replace(/\s+/g, '-')}-${subIndustry.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    
    const { data: page, error } = await supabase
      .from('dynamic_pages')
      .insert([{
        slug,
        title,
        industry,
        sub_industry: subIndustry,
        contractor_id: contractorId || null,
        template_data: { 
          title, 
          promoText: promoText || `Get connected with qualified ${industry} professionals in your area`,
          logoUrl: logoUrl || null,
          heroImages: heroImages || []
        },
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: error.message })
      }
    }

    if (process.env.NETLIFY_BUILD_HOOK) {
      try {
        await fetch(process.env.NETLIFY_BUILD_HOOK, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trigger_title: `Dynamic page: ${title}` })
        })
      } catch (buildError) {
        console.error('Build hook error:', buildError)
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        slug,
        url: `https://customleadmatch.netlify.app/${slug}`,
        page_id: page.id,
        message: 'Dynamic landing page created successfully'
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
