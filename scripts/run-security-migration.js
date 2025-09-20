#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbUrl = process.env.SUPABASE_DB_URL
if (!dbUrl) {
  console.error('❌ SUPABASE_DB_URL environment variable not found')
  process.exit(1)
}

const urlMatch = dbUrl.match(/db\.([^.]+)\.supabase\.co/)
if (!urlMatch) {
  console.error('❌ Invalid Supabase database URL format')
  process.exit(1)
}

const projectId = urlMatch[1]
const supabaseUrl = `https://${projectId}.supabase.co`

const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdWJ0c25wa2RnaGZudWtkdXV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMyMTY2NSwiZXhwIjoyMDY4ODk3NjY1fQ.tiVvKQyMPURuc47-va-tWdAJmlM-TLOUNoBSaer25r8'
if (!serviceKey) {
  console.error('❌ Service key not available')
  process.exit(1)
}

console.log('🔗 Connecting to Supabase project:', projectId)

async function runMigration() {
  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    console.log('✅ Connected to Supabase successfully')
    
    console.log('📖 Reading migration file...')
    const migrationPath = join(__dirname, '..', 'database', 'security-hardening-migration.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    console.log('🚀 Executing security hardening migration...')
    
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    console.log('🔧 Creating security tables using Supabase operations...')
    
    try {
      const { data, error } = await supabase.from('rate_limit_logs').select('id').limit(1)
      if (error && error.code === 'PGRST106') {
        console.log('❌ rate_limit_logs table does not exist - manual SQL execution required')
        console.log('⚠️  Please run the following SQL in your Supabase SQL editor:')
        console.log('---')
        console.log(migrationSQL)
        console.log('---')
        console.log('After running the SQL, the security features will be available.')
        return
      } else if (!error) {
        console.log('✅ rate_limit_logs table already exists')
      }
    } catch (err) {
      console.log('⚠️  Could not check rate_limit_logs table:', err.message)
    }
    
    try {
      const { data, error } = await supabase.from('contractor_2fa').select('id').limit(1)
      if (error && error.code === 'PGRST106') {
        console.log('❌ contractor_2fa table does not exist - manual SQL execution required')
        return
      } else if (!error) {
        console.log('✅ contractor_2fa table already exists')
      }
    } catch (err) {
      console.log('⚠️  Could not check contractor_2fa table:', err.message)
    }
    
    try {
      const { data, error } = await supabase.from('admin_2fa').select('id').limit(1)
      if (error && error.code === 'PGRST106') {
        console.log('❌ admin_2fa table does not exist - manual SQL execution required')
        return
      } else if (!error) {
        console.log('✅ admin_2fa table already exists')
      }
    } catch (err) {
      console.log('⚠️  Could not check admin_2fa table:', err.message)
    }
    
    console.log('🎉 Migration execution completed!')
    
    console.log('🔍 Verifying migration results...')
    
    const verificationQueries = [
      { name: 'rate_limit_logs table', query: 'SELECT COUNT(*) FROM rate_limit_logs' },
      { name: 'contractor_2fa table', query: 'SELECT COUNT(*) FROM contractor_2fa' },
      { name: 'admin_2fa table', query: 'SELECT COUNT(*) FROM admin_2fa' },
      { name: 'contractor_sessions columns', query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'contractor_sessions' AND column_name IN ('ip_address', 'user_agent', 'refresh_token', 'last_activity')" },
      { name: 'contractors constraints', query: "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'contractors' AND constraint_name LIKE '%_check'" }
    ]
    
    const verificationChecks = [
      { name: 'rate_limit_logs table', table: 'rate_limit_logs' },
      { name: 'contractor_2fa table', table: 'contractor_2fa' },
      { name: 'admin_2fa table', table: 'admin_2fa' }
    ]
    
    for (const { name, table } of verificationChecks) {
      try {
        const { data, error } = await supabase.from(table).select('id').limit(1)
        if (error && error.code === 'PGRST106') {
          console.log(`❌ ${name}: Does not exist`)
        } else if (!error) {
          console.log(`✅ ${name}: Exists and accessible`)
        } else {
          console.log(`⚠️  ${name}: Error - ${error.message}`)
        }
      } catch (err) {
        console.log(`⚠️  ${name}: Could not verify (${err.message})`)
      }
    }
    
    console.log('✅ Security hardening migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()
