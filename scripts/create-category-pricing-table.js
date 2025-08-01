import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function createCategoryPricingTable() {
  console.log('Creating category_pricing table...')
  
  try {
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.log('Could not query existing tables:', tablesError)
    } else {
      console.log('Existing tables:', tables.map(t => t.table_name))
    }
    
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
    
    const { data: createResult, error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    })
    
    if (createError) {
      console.log('exec_sql failed, trying alternative approach...')
      
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
          .insert(pricing)
          .select()
        
        if (insertError) {
          console.error(`Error inserting ${pricing.category}:`, insertError.message)
        } else {
          console.log(`✅ Successfully inserted ${pricing.category}: $${pricing.price}`)
        }
      }
    } else {
      console.log('✅ Table created successfully with SQL')
      
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
        .insert(defaultPricing)
        .select()
      
      if (insertError) {
        console.error('Error inserting default pricing:', insertError.message)
      } else {
        console.log('✅ Default pricing data inserted successfully')
      }
    }
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('category_pricing')
      .select('*')
    
    if (verifyError) {
      console.error('❌ Table verification failed:', verifyError.message)
    } else {
      console.log('✅ Table verified successfully with data:')
      verifyData.forEach(row => {
        console.log(`  ${row.category}: $${row.price}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

createCategoryPricingTable()
