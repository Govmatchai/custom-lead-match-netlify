import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const generateCSV = (data, headers) => {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header] || ''
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    }).join(',')
  )
  return [csvHeaders, ...csvRows].join('\n')
}

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    }
  }

  if (event.httpMethod !== 'GET') {
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
    const { start_date, end_date, export_type = 'activity' } = event.queryStringParameters || {}

    if (!start_date || !end_date) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'start_date and end_date are required' })
      }
    }

    let csvData = ''
    let filename = ''

    if (export_type === 'activity') {
      const { data: contractorActivity, error } = await supabase
        .from('contractor_leads')
        .select(`
          id,
          contractor_id,
          lead_id,
          status,
          price_paid,
          created_at,
          contractors (
            business_name,
            email,
            phone
          ),
          leads (
            customer_name,
            service_category,
            zip_code,
            urgency
          )
        `)
        .gte('created_at', start_date)
        .lte('created_at', end_date)
        .order('created_at', { ascending: false })

      if (error) throw error

      const flattenedData = contractorActivity.map(item => ({
        contractor_business_name: item.contractors?.business_name || '',
        contractor_email: item.contractors?.email || '',
        contractor_phone: item.contractors?.phone || '',
        lead_customer_name: item.leads?.customer_name || '',
        lead_service_category: item.leads?.service_category || '',
        lead_zip_code: item.leads?.zip_code || '',
        lead_urgency: item.leads?.urgency || '',
        status: item.status,
        price_paid: item.price_paid || 0,
        created_at: item.created_at
      }))

      const headers = [
        'contractor_business_name',
        'contractor_email', 
        'contractor_phone',
        'lead_customer_name',
        'lead_service_category',
        'lead_zip_code',
        'lead_urgency',
        'status',
        'price_paid',
        'created_at'
      ]

      csvData = generateCSV(flattenedData, headers)
      filename = `contractor_activity_${start_date}_to_${end_date}.csv`

    } else if (export_type === 'weekly_reports') {
      const { data: weeklyReports, error } = await supabase
        .from('weekly_reports')
        .select(`
          *,
          contractors (
            business_name,
            email
          )
        `)
        .gte('week_start', start_date)
        .lte('week_end', end_date)
        .order('week_start', { ascending: false })

      if (error) throw error

      const flattenedData = weeklyReports.map(report => ({
        contractor_business_name: report.contractors?.business_name || '',
        contractor_email: report.contractors?.email || '',
        week_start: report.week_start,
        week_end: report.week_end,
        leads_purchased: report.leads_purchased,
        spend: report.spend,
        refunds: report.refunds,
        wallet_balance: report.wallet_balance,
        created_at: report.created_at
      }))

      const headers = [
        'contractor_business_name',
        'contractor_email',
        'week_start',
        'week_end',
        'leads_purchased',
        'spend',
        'refunds',
        'wallet_balance',
        'created_at'
      ]

      csvData = generateCSV(flattenedData, headers)
      filename = `weekly_reports_${start_date}_to_${end_date}.csv`
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': `attachment; filename="${filename}"`
      },
      body: csvData
    }
  } catch (error) {
    console.error('Error generating CSV export:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        detail: 'Failed to generate CSV export',
        error: error.message 
      })
    }
  }
}
