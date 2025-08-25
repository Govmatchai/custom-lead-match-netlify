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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    }
  }

  try {
    if (event.httpMethod === 'GET') {
      const { searchParams } = new URL(event.rawUrl || `https://example.com${event.path}?${event.rawQuery || ''}`)
      const contractor_id = searchParams.get('contractor_id')

      if (!contractor_id) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'contractor_id is required' })
        }
      }

      const { data: contractor, error } = await supabase
        .from('contractors')
        .select('id, is_sms_enabled, last_active, wallet_balance, sms_notifications_sent')
        .eq('id', contractor_id)
        .single()

      if (error || !contractor) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Contractor not found' })
        }
      }

      const { data: configs } = await supabase
        .from('sms_config')
        .select('config_key, config_value')
        .in('config_key', ['eligibility_rules'])

      const eligibilityRules = configs?.find(c => c.config_key === 'eligibility_rules')?.config_value || {
        auto_disable_inactive: true,
        inactivity_threshold_days: 14,
        minimum_wallet_balance: 1.00
      }

      const lastActiveDate = new Date(contractor.last_active)
      const daysSinceActive = (Date.now() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
      const isInactive = daysSinceActive > eligibilityRules.inactivity_threshold_days
      const hasInsufficientFunds = contractor.wallet_balance < eligibilityRules.minimum_wallet_balance

      const eligibility = {
        contractor_id: contractor.id,
        is_sms_enabled: contractor.is_sms_enabled,
        is_eligible: contractor.is_sms_enabled && !isInactive && !hasInsufficientFunds,
        reasons: {
          sms_disabled: !contractor.is_sms_enabled,
          inactive: isInactive,
          insufficient_funds: hasInsufficientFunds
        },
        metrics: {
          days_since_active: Math.round(daysSinceActive),
          wallet_balance: contractor.wallet_balance,
          sms_notifications_sent: contractor.sms_notifications_sent || 0
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(eligibility)
      }
    }

    if (event.httpMethod === 'POST') {
      const { action, contractor_id, enable_sms } = JSON.parse(event.body)

      if (action === 'update_sms_status') {
        if (!contractor_id || enable_sms === undefined) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ detail: 'contractor_id and enable_sms are required' })
          }
        }

        const { data, error } = await supabase
          .from('contractors')
          .update({ 
            is_sms_enabled: enable_sms,
            last_active: enable_sms ? new Date().toISOString() : undefined
          })
          .eq('id', contractor_id)
          .select()

        if (error) {
          return {
            statusCode: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ detail: 'Failed to update contractor SMS status' })
          }
        }

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            message: `Contractor SMS ${enable_sms ? 'enabled' : 'disabled'} successfully`,
            data 
          })
        }
      }

      if (action === 'auto_disable_check') {
        const { data: configs } = await supabase
          .from('sms_config')
          .select('config_key, config_value')
          .eq('config_key', 'eligibility_rules')

        const eligibilityRules = configs?.[0]?.config_value || {
          auto_disable_inactive: true,
          inactivity_threshold_days: 14,
          minimum_wallet_balance: 1.00
        }

        if (!eligibilityRules.auto_disable_inactive) {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ message: 'Auto-disable is not enabled' })
          }
        }

        const thresholdDate = new Date()
        thresholdDate.setDate(thresholdDate.getDate() - eligibilityRules.inactivity_threshold_days)

        const { data: contractorsToDisable, error: queryError } = await supabase
          .from('contractors')
          .select('id, business_name, email, last_active')
          .eq('is_sms_enabled', true)
          .lt('last_active', thresholdDate.toISOString())

        if (queryError) {
          return {
            statusCode: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ detail: 'Failed to query inactive contractors' })
          }
        }

        let disabledCount = 0
        const results = []

        for (const contractor of contractorsToDisable || []) {
          try {
            const { error: updateError } = await supabase
              .from('contractors')
              .update({ is_sms_enabled: false })
              .eq('id', contractor.id)

            if (!updateError) {
              disabledCount++
              results.push({
                contractor_id: contractor.id,
                business_name: contractor.business_name,
                disabled: true
              })

              await supabase
                .from('contractor_activity_log')
                .insert({
                  contractor_id: contractor.id,
                  event_type: 'auto_disabled_sms',
                  event_data: {
                    reason: 'inactivity',
                    days_inactive: Math.round((Date.now() - new Date(contractor.last_active).getTime()) / (1000 * 60 * 60 * 24))
                  }
                })
            } else {
              results.push({
                contractor_id: contractor.id,
                business_name: contractor.business_name,
                disabled: false,
                error: updateError.message
              })
            }
          } catch (error) {
            results.push({
              contractor_id: contractor.id,
              business_name: contractor.business_name,
              disabled: false,
              error: error.message
            })
          }
        }

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            message: `Auto-disable check completed`,
            contractors_checked: contractorsToDisable?.length || 0,
            contractors_disabled: disabledCount,
            results
          })
        }
      }

      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ detail: 'Invalid action' })
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
    console.error('Error in contractor eligibility handler:', error)
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
