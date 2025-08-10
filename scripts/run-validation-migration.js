const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function runMigration() {
  try {
    console.log('Running validation metrics migration...')
    
    console.log('Checking if validation_metrics table exists...')
    const { data: existingTable, error: checkError } = await supabase
      .from('validation_metrics')
      .select('id')
      .limit(1)
    
    if (checkError && checkError.code === 'PGRST106') {
      console.log('❌ validation_metrics table does not exist - migration needed')
      console.log('⚠️  Database schema migration required')
      console.log('Please run the following SQL manually in your Supabase SQL editor:')
      console.log('---')
      
      const sqlFilePath = path.join(__dirname, '..', 'database', 'validation-metrics-table.sql')
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
      console.log(sqlContent)
      
      console.log('---')
      console.log('After running the SQL, re-run this script to verify the migration.')
      return false
    } else if (!checkError) {
      console.log('✅ validation_metrics table already exists')
      console.log('✅ Database schema is ready for validation metrics logging!')
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

async function main() {
  const migrationReady = await runMigration()
  
  if (migrationReady) {
    console.log('🎉 Validation metrics system is ready!')
    console.log('You can now test the enhanced validation system.')
  }
}

main()
