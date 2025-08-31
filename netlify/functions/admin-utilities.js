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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    const { action } = data

    if (action === 'create_lead') {
      const { customer_name, phone, email, service_category, sub_service, zip_code, description } = data

      if (!customer_name || !phone || !service_category || !sub_service || !zip_code || !description) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'All required fields must be provided' })
        }
      }

      const { data: lead, error } = await supabase
        .from('leads')
        .insert({
          customer_name,
          phone,
          email,
          service_category,
          sub_service,
          zip_code,
          description,
          status: 'valid',
          claimed: false,
          is_archived: false
        })
        .select()
        .single()

      if (error) {
        console.error('Lead creation error:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to create lead' })
        }
      }

      try {
        console.log(`🚀 Triggering lead distribution for lead ${lead.id}`)
        const distributionResponse = await fetch(`${process.env.URL || 'http://localhost:8888'}/.netlify/functions/distribute-leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lead_id: lead.id,
            force_distribute: true
          })
        })

        if (distributionResponse.ok) {
          const distributionResult = await distributionResponse.json()
          console.log(`✅ Lead distribution triggered successfully:`, distributionResult)
        } else {
          console.error(`❌ Lead distribution failed with status ${distributionResponse.status}`)
        }
      } catch (distributionError) {
        console.error('❌ Error triggering lead distribution:', distributionError)
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Lead created successfully', lead })
      }
    }

    if (action === 'seed_test_leads') {
      const testLeads = [
        {
          customer_name: 'Test Customer 1',
          phone: '(555) 123-4567',
          email: 'test1@example.com',
          service_category: 'Home Services',
          sub_service: 'Plumbing',
          zip_code: '12345',
          description: 'Test plumbing lead for QA purposes - kitchen sink repair needed',
          status: 'valid'
        },
        {
          customer_name: 'Test Customer 2',
          phone: '(555) 234-5678',
          email: 'test2@example.com',
          service_category: 'Home Services',
          sub_service: 'HVAC',
          zip_code: '12346',
          description: 'Test HVAC lead for QA purposes - air conditioning repair needed',
          status: 'valid'
        },
        {
          customer_name: 'Test Customer 3',
          phone: '(555) 345-6789',
          email: 'test3@example.com',
          service_category: 'Legal',
          sub_service: 'Personal Injury',
          zip_code: '12345',
          description: 'Test legal lead for QA purposes - car accident case consultation',
          status: 'valid'
        }
      ]

      const { data: leads, error } = await supabase
        .from('leads')
        .insert(testLeads)
        .select()

      if (error) {
        console.error('Test leads creation error:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to create test leads' })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: `${leads.length} test leads created successfully`, leads })
      }
    }

    if (action === 'apply_schema_migration') {
      try {
        console.log('Testing database schema by attempting to create a test contractor...')
        
        const testContractor = {
          business_name: 'Schema Test Company',
          contact_name: 'Test User',
          email: 'schema-test@example.com',
          phone: '(555) 000-0000',
          industry: 'home_services',
          sub_service: 'plumbing',
          zip_codes: ['12345'],
          username: 'schema-test',
          password_hash: '$2b$12$LQv3c1yqBwEHXLAw98HtQeOsYDdCcjqd8RfBzv3oeVhQBZtQpHyC2',
          wallet_balance: 25.00,
          sms_opt_in: true
        }

        const { data: testResult, error: testError } = await supabase
          .from('contractors')
          .insert([testContractor])
          .select()

        if (testError) {
          console.error('Schema test failed:', testError)
          
          if (testError.code === 'PGRST204' || testError.message?.includes('column') || testError.message?.includes('does not exist')) {
            return {
              statusCode: 500,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              },
              body: JSON.stringify({ 
                detail: 'Database schema is missing required columns. Manual migration needed.',
                error: testError.message,
                required_columns: ['username', 'password_hash', 'wallet_balance'],
                migration_sql_file: '/home/ubuntu/custom-lead-match-netlify/database/fix-schema-migration.sql',
                suggestion: 'Please run the SQL migration script manually in your Supabase SQL editor or database admin panel'
              })
            }
          }
          
          return {
            statusCode: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
              detail: 'Schema test failed', 
              error: testError.message 
            })
          }
        }

        if (testResult && testResult.length > 0) {
          await supabase
            .from('contractors')
            .delete()
            .eq('id', testResult[0].id)
        }

        console.log('Schema test passed - all required columns exist')
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            message: 'Database schema is up to date - all required columns exist'
          })
        }
      } catch (error) {
        console.error('Error during schema test:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Internal server error during schema test', 
            error: error.message 
          })
        }
      }
    }

    if (action === 'seed_test_contractors') {
      const testContractors = [
        {
          business_name: 'Test Construction LLC',
          contact_name: 'Test Contractor',
          email: 'testcontractor@example.com',
          phone: '(555) 123-4567',
          industry: 'home_services',
          sub_service: 'plumbing',
          zip_codes: ['12345', '67890'],
          username: 'testcontractor@example.com',
          password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          sms_opt_in: true,
          wallet_balance: 100.00
        },
        {
          business_name: 'ABC Plumbing Services',
          contact_name: 'John Smith',
          email: 'john@abcplumbing.com',
          phone: '(555) 234-5678',
          industry: 'home_services',
          sub_service: 'plumbing',
          zip_codes: ['12345', '67890'],
          username: 'john@abcplumbing.com',
          password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          sms_opt_in: true,
          wallet_balance: 75.00
        },
        {
          business_name: 'Quick HVAC Repair',
          contact_name: 'Jane Doe',
          email: 'jane@quickhvac.com',
          phone: '(555) 345-6789',
          industry: 'home_services',
          sub_service: 'hvac',
          zip_codes: ['12346', '67891'],
          username: 'jane@quickhvac.com',
          password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          sms_opt_in: true,
          wallet_balance: 50.00
        },
        {
          business_name: 'Elite Legal Services',
          contact_name: 'Bob Johnson',
          email: 'bob@elitelegal.com',
          phone: '(555) 456-7890',
          industry: 'legal',
          sub_service: 'personal_injury',
          zip_codes: ['12347', '67892'],
          username: 'bob@elitelegal.com',
          password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          sms_opt_in: true,
          wallet_balance: 125.00
        },
        {
          business_name: 'Premier Auto Repair',
          contact_name: 'Sarah Wilson',
          email: 'sarah@premierauto.com',
          phone: '(555) 567-8901',
          industry: 'automotive',
          sub_service: 'general_repair',
          zip_codes: ['12348', '67893'],
          username: 'sarah@premierauto.com',
          password_hash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          sms_opt_in: true,
          wallet_balance: 200.00
        }
      ]

      const { data: contractors, error } = await supabase
        .from('contractors')
        .upsert(testContractors, { onConflict: 'username' })
        .select()

      if (error) {
        console.error('Test contractors creation error:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ detail: 'Failed to create test contractors' })
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: `${contractors.length} test contractors created successfully`, contractors })
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
