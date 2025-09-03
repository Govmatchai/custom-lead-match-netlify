import { createClient } from '@supabase/supabase-js'
import { sendEmail } from './lib/sendgrid.js'
import { ProductionLogger } from './lib/logger.js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

const generateContractorWeeklyReport = async (contractorId, weekStart, weekEnd) => {
  try {
    const { data: purchasedLeads, error: leadsError } = await supabase
      .from('contractor_leads')
      .select('price_paid, created_at')
      .eq('contractor_id', contractorId)
      .eq('status', 'purchased')
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())

    if (leadsError) throw leadsError

    const { data: refunds, error: refundsError } = await supabase
      .from('refund_requests')
      .select('amount')
      .eq('contractor_id', contractorId)
      .eq('status', 'approved')
      .gte('requested_at', weekStart.toISOString())
      .lte('requested_at', weekEnd.toISOString())

    if (refundsError) throw refundsError

    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .select('wallet_balance')
      .eq('id', contractorId)
      .single()

    if (contractorError) throw contractorError

    const leadsCount = purchasedLeads?.length || 0
    const totalSpend = purchasedLeads?.reduce((sum, lead) => sum + (parseFloat(lead.price_paid) || 0), 0) || 0
    const totalRefunds = refunds?.reduce((sum, refund) => sum + parseFloat(refund.amount), 0) || 0
    const walletBalance = parseFloat(contractor.wallet_balance) || 0

    return {
      leads_purchased: leadsCount,
      spend: totalSpend,
      refunds: totalRefunds,
      wallet_balance: walletBalance
    }
  } catch (error) {
    console.error('Error generating weekly report:', error)
    throw error
  }
}

const saveWeeklyReport = async (contractorId, weekStart, weekEnd, reportData) => {
  try {
    const { error } = await supabase
      .from('weekly_reports')
      .upsert({
        contractor_id: contractorId,
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        ...reportData
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving weekly report:', error)
    throw error
  }
}

const sendWeeklyReportEmail = async (contractor, reportData, weekStart, weekEnd) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Weekly Performance Report</h2>
        <p>Hello ${contractor.business_name},</p>
        
        <p>Here's your weekly performance summary for ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Leads Purchased</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">${reportData.leads_purchased}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Total Spend</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">$${reportData.spend.toFixed(2)}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Refunds Received</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">$${reportData.refunds.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Current Wallet Balance</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;">$${reportData.wallet_balance.toFixed(2)}</td>
          </tr>
        </table>
        
        <p>
          <a href="https://customleadmatch.com/dashboard" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Dashboard
          </a>
        </p>
        
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          Custom Lead Match Team
        </p>
      </div>
    `

    await sendEmail(
      contractor.email,
      `Weekly Report - ${weekStart.toLocaleDateString()}`,
      emailHtml
    )

    await ProductionLogger.log('INFO', 'Weekly report email sent', {
      contractor_id: contractor.id,
      contractor_email: contractor.email,
      week_start: weekStart.toISOString(),
      report_data: reportData
    })
  } catch (error) {
    console.error('Error sending weekly report email:', error)
    await ProductionLogger.log('ERROR', 'Failed to send weekly report email', {
      contractor_id: contractor.id,
      error: error.message
    })
  }
}

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    }
  }

  try {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    console.log(`Generating weekly reports for ${weekStart.toISOString()} to ${weekEnd.toISOString()}`)

    const { data: contractors, error: contractorsError } = await supabase
      .from('contractors')
      .select('id, business_name, email, wallet_balance')
      .eq('active', true)

    if (contractorsError) throw contractorsError

    let successCount = 0
    let errorCount = 0

    for (const contractor of contractors) {
      try {
        const reportData = await generateContractorWeeklyReport(contractor.id, weekStart, weekEnd)
        await saveWeeklyReport(contractor.id, weekStart, weekEnd, reportData)
        await sendWeeklyReportEmail(contractor, reportData, weekStart, weekEnd)
        successCount++
      } catch (error) {
        console.error(`Error processing weekly report for contractor ${contractor.id}:`, error)
        errorCount++
      }
    }

    await ProductionLogger.log('INFO', 'Weekly reports generation completed', {
      total_contractors: contractors.length,
      success_count: successCount,
      error_count: errorCount,
      week_start: weekStart.toISOString(),
      week_end: weekEnd.toISOString()
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: `Weekly reports generated for ${successCount} contractors`,
        total_contractors: contractors.length,
        success_count: successCount,
        error_count: errorCount
      })
    }
  } catch (error) {
    console.error('Error in weekly reports generation:', error)
    await ProductionLogger.log('ERROR', 'Weekly reports generation failed', {
      error: error.message
    })

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message: 'Failed to generate weekly reports',
        error: error.message
      })
    }
  }
}
