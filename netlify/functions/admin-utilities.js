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
      const migrationSQL = `
        DO $$ 
        BEGIN
            -- Add username column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'contractors' AND column_name = 'username') THEN
                ALTER TABLE contractors ADD COLUMN username VARCHAR(100) UNIQUE;
            END IF;
            
            -- Add password_hash column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'contractors' AND column_name = 'password_hash') THEN
                ALTER TABLE contractors ADD COLUMN password_hash VARCHAR(255);
            END IF;
            
            -- Add wallet_balance column if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'contractors' AND column_name = 'wallet_balance') THEN
                ALTER TABLE contractors ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 25.00;
            END IF;
            
            -- Add email column to leads table if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'leads' AND column_name = 'email') THEN
                ALTER TABLE leads ADD COLUMN email VARCHAR(255);
            END IF;
            
            -- Add status column to leads table if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'leads' AND column_name = 'status') THEN
                ALTER TABLE leads ADD COLUMN status VARCHAR(50) DEFAULT 'pending_review' 
                CHECK (status IN ('pending_review', 'valid', 'duplicate', 'invalid', 'claimed'));
            END IF;
            
            -- Add is_archived column to leads table if it doesn't exist
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                           WHERE table_name = 'leads' AND column_name = 'is_archived') THEN
                ALTER TABLE leads ADD COLUMN is_archived BOOLEAN DEFAULT false;
            END IF;
        END $$;

        -- Update existing contractors with default values for new columns
        UPDATE contractors 
        SET username = LOWER(REPLACE(SPLIT_PART(email, '@', 1), '.', ''))
        WHERE username IS NULL;

        UPDATE contractors 
        SET password_hash = '$2b$12$LQv3c1yqBwEHXLAw98HtQeOsYDdCcjqd8RfBzv3oeVhQBZtQpHyC2'  -- default: 'temppassword123'
        WHERE password_hash IS NULL;

        UPDATE contractors 
        SET wallet_balance = 25.00
        WHERE wallet_balance IS NULL;

        -- Set NOT NULL constraints after populating data
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'contractors' 
                AND column_name = 'username' 
                AND is_nullable = 'YES'
            ) THEN
                ALTER TABLE contractors ALTER COLUMN username SET NOT NULL;
            END IF;
            
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'contractors' 
                AND column_name = 'password_hash' 
                AND is_nullable = 'YES'
            ) THEN
                ALTER TABLE contractors ALTER COLUMN password_hash SET NOT NULL;
            END IF;
        END $$;

        -- Create indexes for new columns
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_contractors_username') THEN
                CREATE INDEX idx_contractors_username ON contractors(username);
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_status') THEN
                CREATE INDEX idx_leads_status ON leads(status);
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_is_archived') THEN
                CREATE INDEX idx_leads_is_archived ON leads(is_archived);
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_email') THEN
                CREATE INDEX idx_leads_email ON leads(email);
            END IF;
        END $$;
      `

      console.log('Applying database schema migration...')
      
      const { data, error } = await supabase.rpc('exec', {
        sql: migrationSQL
      })

      if (error) {
        console.error('Migration failed:', error)
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            detail: 'Migration failed', 
            error: error.message 
          })
        }
      }

      console.log('Migration completed successfully')
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          message: 'Database schema migration applied successfully',
          data 
        })
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
