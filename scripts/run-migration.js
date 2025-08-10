const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function runMigration() {
  try {
    console.log('Running predictive scoring migration...')
    
    console.log('Checking existing schema...')
    const { data: existingLeads, error: checkError } = await supabase
      .from('leads')
      .select('lead_score, lead_score_band, lead_score_reason, lead_score_updated_at')
      .limit(1)
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('❌ Scoring columns do not exist yet - migration needed')
      console.log('⚠️  Database schema migration required')
      console.log('Please run the following SQL manually in your Supabase SQL editor:')
      console.log('---')
      console.log(`
-- Add predictive scoring columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score_band TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score_reason TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score_updated_at TIMESTAMP WITH TIME ZONE;

-- Create index for sorting by score
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);

-- Create lead_score_events table for audit trail
CREATE TABLE IF NOT EXISTS lead_score_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  score SMALLINT NOT NULL,
  band TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_score_events_lead_id ON lead_score_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_score_events_created_at ON lead_score_events(created_at);

-- Enable RLS on lead_score_events
ALTER TABLE lead_score_events ENABLE ROW LEVEL SECURITY;

-- Create policies for lead_score_events
CREATE POLICY "Allow all for service role" ON lead_score_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow anonymous read" ON lead_score_events FOR SELECT USING (true);

-- Backfill existing leads with default bands
UPDATE leads SET 
  lead_score_band = CASE 
    WHEN lead_score >= 80 THEN 'A'
    WHEN lead_score >= 60 THEN 'B'
    ELSE 'C'
  END
WHERE lead_score_band IS NULL;
      `)
      console.log('---')
      console.log('After running the SQL, re-run this script to verify the migration.')
      return false
    } else if (!checkError) {
      console.log('✅ Scoring columns already exist')
      
      const { data: events, error: eventsError } = await supabase
        .from('lead_score_events')
        .select('id')
        .limit(1)
      
      if (eventsError && eventsError.code === 'PGRST106') {
        console.log('❌ lead_score_events table does not exist - please run the SQL above')
        return false
      } else {
        console.log('✅ lead_score_events table exists')
      }
      
      console.log('✅ Database schema is ready for predictive scoring!')
      return true
    } else {
      console.error('Error checking schema:', checkError)
      return false
    }
    
  } catch (error) {
    console.error('Migration check failed:', error)
    return false
  }
}

async function insertDemoLeads() {
  try {
    console.log('Inserting demo leads with scoring variance...')
    
    const demoLeads = [
      {
        customer_name: 'High Score Lead',
        service_category: 'Home Services',
        sub_service: 'Plumbing',
        zip_code: '12345',
        phone: '555-0301',
        email: 'high@example.com',
        description: 'Emergency pipe burst, need immediate help!',
        status: 'valid',
        validation_flags: {
          phone_valid: true,
          email_format_valid: true,
          is_duplicate: false
        }
      },
      {
        customer_name: 'Medium Score Lead',
        service_category: 'Home Services',
        sub_service: 'HVAC',
        zip_code: '12346',
        phone: '555-0302',
        email: 'medium@example.com',
        description: 'AC not working, need repair soon',
        status: 'valid',
        validation_flags: {
          phone_valid: true,
          email_format_valid: true,
          is_duplicate: false
        }
      },
      {
        customer_name: 'Low Score Lead',
        service_category: 'Auto',
        sub_service: 'Auto Repair',
        zip_code: '12347',
        phone: '555-0303',
        email: 'low@badexample.com',
        description: 'Car needs fixing',
        status: 'valid',
        validation_flags: {
          phone_valid: false,
          email_format_valid: true,
          is_duplicate: true
        }
      },
      {
        customer_name: 'Another High Lead',
        service_category: 'Legal',
        sub_service: 'Personal Injury',
        zip_code: '12345',
        phone: '555-0304',
        email: 'legal@example.com',
        description: 'Car accident case, need representation urgently',
        status: 'valid',
        validation_flags: {
          phone_valid: true,
          email_format_valid: true,
          is_duplicate: false
        }
      },
      {
        customer_name: 'Weekend Lead',
        service_category: 'Home Services',
        sub_service: 'Electrical',
        zip_code: '12346',
        phone: '555-0305',
        email: 'weekend@example.com',
        description: 'Power outage issue',
        status: 'valid',
        validation_flags: {
          phone_valid: true,
          email_format_valid: true,
          is_duplicate: false
        }
      }
    ]
    
    const { data, error } = await supabase
      .from('leads')
      .insert(demoLeads)
      .select()
    
    if (error) {
      console.error('Error inserting demo leads:', error)
      return false
    }
    
    console.log(`✅ Inserted ${data.length} demo leads`)
    return data
    
  } catch (error) {
    console.error('Demo leads insertion failed:', error)
    return false
  }
}

async function main() {
  const migrationReady = await runMigration()
  
  if (migrationReady) {
    const demoLeads = await insertDemoLeads()
    if (demoLeads) {
      console.log('🎉 Migration and demo data setup complete!')
      console.log('You can now test the predictive scoring system.')
    }
  }
}

main()
