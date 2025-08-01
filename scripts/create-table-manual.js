import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function createTableManually() {
  console.log('Creating category_pricing table manually...')
  
  const testRecord = {
    id: '550e8400-e29b-41d4-a716-446655440000', // Fixed UUID
    category: 'home_services',
    price: 25.00,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  try {
    const { data, error } = await supabase
      .from('category_pricing')
      .insert(testRecord)
      .select()
    
    if (error) {
      console.error('Insert error:', error)
      
      console.log('Trying to create table with raw SQL...')
      
      const { data: sqlData, error: sqlError } = await supabase
        .from('category_pricing')
        .select('*')
        .limit(1)
      
      console.log('SQL result:', { sqlData, sqlError })
      
    } else {
      console.log('✅ Successfully inserted test record:', data)
      
      const defaultPricing = [
        { category: 'legal', price: 50.00 },
        { category: 'real_estate', price: 35.00 },
        { category: 'finance', price: 40.00 },
        { category: 'insurance', price: 30.00 },
        { category: 'healthcare', price: 45.00 },
        { category: 'automotive', price: 20.00 }
      ]
      
      for (const pricing of defaultPricing) {
        const { data: insertData, error: insertError } = await supabase
          .from('category_pricing')
          .upsert(pricing)
        
        if (insertError) {
          console.error(`Error inserting ${pricing.category}:`, insertError)
        } else {
          console.log(`✅ Inserted pricing for ${pricing.category}: $${pricing.price}`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Manual creation failed:', error)
  }
}

createTableManually()
