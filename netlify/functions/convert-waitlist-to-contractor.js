import { createClient } from '@supabase/supabase-js'
import bcryptjs from 'bcryptjs'
import { randomBytes } from 'crypto'
import dotenv from 'dotenv'

dotenv.config({ path: '../../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    }
  }

  try {
    const { waitlist_id, username, password, zip_codes } = JSON.parse(event.body)

    if (!waitlist_id || !username || !password || !zip_codes) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Missing required fields' })
      }
    }

    const { data: waitlistEntry, error: waitlistError } = await supabase
      .from('contractors_waitlist')
      .select('*')
      .eq('id', waitlist_id)
      .single()

    if (waitlistError || !waitlistEntry) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Waitlist entry not found' })
      }
    }

    const saltRounds = 12
    const password_hash = await bcryptjs.hash(password, saltRounds)
    const zipCodesArray = zip_codes.split(',').map(zip => zip.trim()).filter(zip => zip.length > 0)

    const { data: contractor, error: contractorError } = await supabase
      .from('contractors')
      .insert({
        business_name: waitlistEntry.company,
        contact_name: `${waitlistEntry.first_name} ${waitlistEntry.last_name}`,
        email: waitlistEntry.email,
        phone: waitlistEntry.phone,
        username,
        password_hash,
        industry: waitlistEntry.trade === 'Home Services' ? 'Home Services' : waitlistEntry.trade,
        sub_service: 'General',
        zip_codes: zipCodesArray,
        sms_opt_in: true,
        lead_credits: 3,
        wallet_balance: 25.00
      })
      .select()
      .single()

    if (contractorError) {
      console.error('Error creating contractor:', contractorError)
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: false, message: 'Failed to create contractor account' })
      }
    }

    const sessionToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const { error: sessionError } = await supabase
      .from('contractor_sessions')
      .insert({
        contractor_id: contractor.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      })

    if (sessionError) {
      console.error('Error creating session:', sessionError)
    }

    try {
      await fetch(`${process.env.URL || 'https://customleadmatch.netlify.app'}/.netlify/functions/email-welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contractor.email,
          first_name: waitlistEntry.first_name,
          email: contractor.email,
          company: contractor.business_name
        })
      })
    } catch (emailError) {
      console.error('Welcome email error:', emailError)
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        message: 'Contractor account created successfully',
        contractor_id: contractor.id,
        session_token: sessionToken
      })
    }
  } catch (error) {
    console.error('Error in waitlist conversion:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: false, message: 'Failed to convert waitlist entry' })
    }
  }
}
