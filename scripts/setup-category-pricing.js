import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function setupCategoryPricing() {
  console.log('Setting up category_pricing table...')
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS category_pricing (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      category VARCHAR(100) UNIQUE NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_category_pricing_category ON category_pricing(category);
    
    ALTER TABLE category_pricing ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow all for service role" ON category_pricing FOR ALL USING (auth.role() = 'service_role');
  `
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    if (error) {
      console.log('RPC exec_sql not available, trying direct insert approach...')
      
      const defaultPricing = [
        { category: 'home_services', price: 25.00 },
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
    } else {
      console.log('✅ Table created successfully')
      
      const defaultPricing = [
        { category: 'home_services', price: 25.00 },
        { category: 'legal', price: 50.00 },
        { category: 'real_estate', price: 35.00 },
        { category: 'finance', price: 40.00 },
        { category: 'insurance', price: 30.00 },
        { category: 'healthcare', price: 45.00 },
        { category: 'automotive', price: 20.00 }
      ]
      
      const { data: insertData, error: insertError } = await supabase
        .from('category_pricing')
        .upsert(defaultPricing)
      
      if (insertError) {
        console.error('Error inserting default pricing:', insertError)
      } else {
        console.log('✅ Default pricing data inserted')
      }
    }
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('category_pricing')
      .select('*')
    
    if (verifyError) {
      console.error('❌ Table verification failed:', verifyError)
    } else {
      console.log('✅ Table verified with data:', verifyData)
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupCategoryPricing()
