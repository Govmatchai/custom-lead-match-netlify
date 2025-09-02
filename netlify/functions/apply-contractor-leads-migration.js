import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export const handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ detail: 'Method not allowed' })
    }
  }

  try {
    console.log('🔧 Starting contractor_leads schema migration...')
    
    const schemaSql = `
      -- New contractor_leads join table for multi-contractor lead distribution
      CREATE TABLE IF NOT EXISTS contractor_leads (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
          lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'purchased', 'expired')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          purchased_at TIMESTAMP WITH TIME ZONE,
          UNIQUE(contractor_id, lead_id)
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_contractor_leads_contractor_id ON contractor_leads(contractor_id);
      CREATE INDEX IF NOT EXISTS idx_contractor_leads_lead_id ON contractor_leads(lead_id);
      CREATE INDEX IF NOT EXISTS idx_contractor_leads_status ON contractor_leads(status);
      CREATE INDEX IF NOT EXISTS idx_contractor_leads_created_at ON contractor_leads(created_at);
      CREATE INDEX IF NOT EXISTS idx_contractor_leads_purchased_at ON contractor_leads(purchased_at);

      -- Row Level Security
      ALTER TABLE contractor_leads ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow all for service role" ON contractor_leads;
      CREATE POLICY "Allow all for service role" ON contractor_leads FOR ALL USING (auth.role() = 'service_role');
      
      DROP POLICY IF EXISTS "Allow anonymous read" ON contractor_leads;
      CREATE POLICY "Allow anonymous read" ON contractor_leads FOR SELECT USING (true);

      -- Update leads table to support new status values
      ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
      ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (status IN ('pending_review', 'valid', 'duplicate', 'invalid', 'claimed', 'purchased', 'available', 'expired'));

      -- Add distributed flag to track if lead has been distributed to contractors
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS distributed BOOLEAN DEFAULT false;
      ALTER TABLE leads ADD COLUMN IF NOT EXISTS distributed_at TIMESTAMP WITH TIME ZONE;

      -- Update contractors table to match user requirements
      ALTER TABLE contractors ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
      ALTER TABLE contractors ADD COLUMN IF NOT EXISTS service_zips TEXT[];

      -- Update company_name from business_name if not set
      UPDATE contractors SET company_name = business_name WHERE company_name IS NULL AND business_name IS NOT NULL;
      -- Update service_zips from zip_codes if not set  
      UPDATE contractors SET service_zips = zip_codes WHERE service_zips IS NULL AND zip_codes IS NOT NULL;

      -- Add indexes for new fields
      CREATE INDEX IF NOT EXISTS idx_contractors_service_zips ON contractors USING GIN(service_zips);
      CREATE INDEX IF NOT EXISTS idx_leads_distributed ON leads(distributed);
      CREATE INDEX IF NOT EXISTS idx_leads_distributed_at ON leads(distributed_at);

      -- Grant permissions
      GRANT ALL ON contractor_leads TO service_role;
      GRANT USAGE, SELECT ON SEQUENCE contractor_leads_id_seq TO service_role;
    `

    const { error } = await supabase.rpc('exec_sql', { sql: schemaSql })

    if (error) {
      console.error('❌ Migration error:', error)
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ 
          detail: 'Migration failed', 
          error: error.message,
          success: false
        })
      }
    }

    console.log('✅ Contractor leads schema migration completed successfully')
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        message: 'Contractor leads schema migration completed successfully',
        success: true,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('❌ Migration error:', error)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        detail: 'Migration failed', 
        error: error.message,
        success: false
      })
    }
  }
}
