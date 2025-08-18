import { createClient } from '@supabase/supabase-js';
import { notifyContractorsForLead } from './notify-contractors.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { data: contractors } = await supabase
      .from('contractors')
      .select('*')
      .limit(1);

    if (!contractors?.length) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No contractors found for testing' })
      };
    }

    const mockLead = {
      id: 'test-lead-123',
      service_category: 'Home Services',
      sub_service: 'Plumbing',
      zip_code: '12345'
    };

    const results = await notifyContractorsForLead(mockLead, contractors);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        message: 'Test notifications sent',
        results,
        contractors_tested: contractors.length
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
