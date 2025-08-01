import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function createTestSessions() {
  const testContractors = [
    '15f0808d-9c87-41a1-8a7e-a5e01e329cb1',
    '21ec7f9a-7983-4eb3-ace9-8955bd7b7a73',
    '9045dba2-e686-47c7-92d4-cc7a147855ce'
  ]

  for (const contractorId of testContractors) {
    const sessionToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const { error } = await supabase
      .from('contractor_sessions')
      .upsert({
        contractor_id: contractorId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      })

    if (error) {
      console.error(`Failed to create session for ${contractorId}:`, error)
    } else {
      console.log(`Created session for ${contractorId}: ${sessionToken}`)
    }
  }
}

createTestSessions().catch(console.error)
