const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

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
        claimed: false,
        is_archived: false,
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
        claimed: false,
        is_archived: false,
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
        claimed: false,
        is_archived: false,
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
        claimed: false,
        is_archived: false,
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
        claimed: false,
        is_archived: false,
        validation_flags: {
          phone_valid: true,
          email_format_valid: true,
          is_duplicate: false
        }
      }
    ]
    
    const insertedLeads = []
    for (const lead of demoLeads) {
      const { data, error } = await supabase
        .from('leads')
        .insert([lead])
        .select()
      
      if (error) {
        console.error(`Error inserting lead ${lead.customer_name}:`, error)
      } else {
        console.log(`✅ Inserted: ${lead.customer_name}`)
        insertedLeads.push(data[0])
      }
    }
    
    console.log(`✅ Successfully inserted ${insertedLeads.length} demo leads`)
    return insertedLeads
    
  } catch (error) {
    console.error('Demo leads insertion failed:', error)
    return false
  }
}

async function scoreDemoLeads(leads) {
  console.log('Scoring demo leads...')
  
  for (const lead of leads) {
    try {
      const response = await fetch('http://localhost:8888/.netlify/functions/score-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Scored ${lead.customer_name}: ${result.score} (${result.band})`)
      } else {
        console.error(`❌ Failed to score ${lead.customer_name}`)
      }
    } catch (error) {
      console.error(`Error scoring ${lead.customer_name}:`, error)
    }
  }
}

async function main() {
  const leads = await insertDemoLeads()
  
  if (leads && leads.length > 0) {
    await scoreDemoLeads(leads)
    console.log('🎉 Demo data setup complete!')
  }
}

main()
