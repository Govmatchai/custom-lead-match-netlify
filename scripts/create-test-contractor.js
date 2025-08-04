const { createClient } = require('@supabase/supabase-js')
const bcryptjs = require('bcryptjs')
const dotenv = require('dotenv')

dotenv.config({ path: '.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function createTestContractor() {
  console.log('Creating test contractor with known credentials...')
  
  const testData = {
    business_name: "Test Construction LLC",
    contact_name: "John Test",
    email: "test.contractor@example.com",
    phone: "555-123-4567",
    username: "testcontractor123",
    password: "password123",
    industry: "home_services",
    sub_service: "plumbing",
    zip_codes: ["12345", "12346"],
    sms_opt_in: true,
    lead_credits: 3
  }

  try {
    const saltRounds = 12
    const password_hash = await bcryptjs.hash(testData.password, saltRounds)
    
    console.log('Generated password hash:', password_hash)
    console.log('Hash length:', password_hash.length)
    
    const { data: contractor, error } = await supabase
      .from('contractors')
      .insert({
        business_name: testData.business_name,
        contact_name: testData.contact_name,
        email: testData.email,
        phone: testData.phone,
        username: testData.username,
        password_hash,
        industry: testData.industry,
        sub_service: testData.sub_service,
        zip_codes: testData.zip_codes,
        sms_opt_in: testData.sms_opt_in,
        lead_credits: testData.lead_credits
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating contractor:', error)
      if (error.code === '23505') {
        console.log('Contractor already exists, testing password verification...')
        
        const { data: existing } = await supabase
          .from('contractors')
          .select('username, password_hash')
          .eq('username', testData.username)
          .single()
        
        if (existing) {
          const match = await bcryptjs.compare(testData.password, existing.password_hash)
          console.log('Password verification test:', match)
        }
      }
      return
    }

    console.log('✅ Test contractor created successfully!')
    console.log('- ID:', contractor.id)
    console.log('- Username:', contractor.username)
    console.log('- Email:', contractor.email)
    console.log('- Password: password123')
    
    const passwordMatch = await bcryptjs.compare(testData.password, password_hash)
    console.log('- Password verification test:', passwordMatch)
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

createTestContractor()
