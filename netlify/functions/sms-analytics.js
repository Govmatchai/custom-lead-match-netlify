import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

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
    const { searchParams } = new URL(event.rawUrl || `https://example.com${event.path}?${event.rawQuery || ''}`)
    const period = searchParams.get('period') || 'month' // month, week, day
    const export_csv = searchParams.get('export') === 'true'

    let startDate
    const endDate = new Date()
    
    switch (period) {
      case 'day':
        startDate = new Date()
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
      default:
        startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 1)
        break
    }

    const { data: smsLogs, error: smsError } = await supabase
      .from('sms_send_log')
      .select(`
        *,
        contractors(business_name, contact_name),
        leads(customer_name, service_category, sub_service)
      `)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false })

    if (smsError) {
      console.error('Error fetching SMS logs:', smsError)
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Failed to fetch SMS analytics' })
      }
    }

    const totalMessages = smsLogs.length
    const totalCostCents = smsLogs.reduce((sum, log) => sum + (log.cost_cents || 79), 0)
    const totalCostDollars = totalCostCents / 100

    const byCategory = {}
    smsLogs.forEach(log => {
      const category = log.category || 'Unknown'
      if (!byCategory[category]) {
        byCategory[category] = { count: 0, cost: 0 }
      }
      byCategory[category].count++
      byCategory[category].cost += (log.cost_cents || 79)
    })

    const byLocation = {}
    smsLogs.forEach(log => {
      const location = log.location || 'Unknown'
      if (!byLocation[location]) {
        byLocation[location] = { count: 0, cost: 0 }
      }
      byLocation[location].count++
      byLocation[location].cost += (log.cost_cents || 79)
    })

    const byContractor = {}
    smsLogs.forEach(log => {
      const contractorName = log.contractors?.business_name || 'Unknown'
      if (!byContractor[contractorName]) {
        byContractor[contractorName] = { count: 0, cost: 0 }
      }
      byContractor[contractorName].count++
      byContractor[contractorName].cost += (log.cost_cents || 79)
    })

    const byStatus = {}
    smsLogs.forEach(log => {
      const status = log.status || 'unknown'
      if (!byStatus[status]) {
        byStatus[status] = { count: 0, cost: 0 }
      }
      byStatus[status].count++
      byStatus[status].cost += (log.cost_cents || 79)
    })

    const dailyBreakdown = {}
    smsLogs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0]
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = { count: 0, cost: 0 }
      }
      dailyBreakdown[date].count++
      dailyBreakdown[date].cost += (log.cost_cents || 79)
    })

    const analytics = {
      period,
      date_range: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      summary: {
        total_messages: totalMessages,
        total_cost_cents: totalCostCents,
        total_cost_dollars: totalCostDollars,
        average_cost_per_message: totalMessages > 0 ? totalCostCents / totalMessages : 0
      },
      breakdowns: {
        by_category: Object.entries(byCategory).map(([category, data]) => ({
          category,
          count: data.count,
          cost_cents: data.cost,
          cost_dollars: data.cost / 100
        })),
        by_location: Object.entries(byLocation).map(([location, data]) => ({
          location,
          count: data.count,
          cost_cents: data.cost,
          cost_dollars: data.cost / 100
        })),
        by_contractor: Object.entries(byContractor).map(([contractor, data]) => ({
          contractor,
          count: data.count,
          cost_cents: data.cost,
          cost_dollars: data.cost / 100
        })),
        by_status: Object.entries(byStatus).map(([status, data]) => ({
          status,
          count: data.count,
          cost_cents: data.cost,
          cost_dollars: data.cost / 100
        })),
        daily: Object.entries(dailyBreakdown).map(([date, data]) => ({
          date,
          count: data.count,
          cost_cents: data.cost,
          cost_dollars: data.cost / 100
        })).sort((a, b) => a.date.localeCompare(b.date))
      }
    }

    if (export_csv) {
      const csvHeaders = [
        'Timestamp',
        'Contractor',
        'Lead Customer',
        'Category',
        'Sub Category',
        'Location',
        'Phone Number',
        'Status',
        'Cost (Cents)',
        'Cost (Dollars)',
        'Twilio SID',
        'Delivery Status'
      ]

      const csvRows = smsLogs.map(log => [
        log.timestamp,
        log.contractors?.business_name || 'Unknown',
        log.leads?.customer_name || 'Unknown',
        log.category || '',
        log.sub_category || '',
        log.location || '',
        log.phone_number || '',
        log.status || '',
        log.cost_cents || 79,
        ((log.cost_cents || 79) / 100).toFixed(2),
        log.twilio_sid || '',
        log.delivery_status || ''
      ])

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Access-Control-Allow-Origin': '*',
          'Content-Disposition': `attachment; filename="sms-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv"`
        },
        body: csvContent
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(analytics)
    }
  } catch (error) {
    console.error('Error in SMS analytics handler:', error)
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
