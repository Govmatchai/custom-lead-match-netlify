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
    const testResults = {
      timestamp: new Date().toISOString(),
      scenarios: {},
      summary: {
        total_tests: 0,
        passed: 0,
        failed: 0
      }
    };

    console.log('🧪 Testing Scenario 1: Wallet-funded contractor');
    const walletFundedResult = await testWalletFundedScenario();
    testResults.scenarios.wallet_funded = walletFundedResult;
    testResults.summary.total_tests++;
    if (walletFundedResult.success) testResults.summary.passed++;
    else testResults.summary.failed++;

    console.log('🧪 Testing Scenario 2: No wallet funds contractor');
    const noFundsResult = await testNoFundsScenario();
    testResults.scenarios.no_funds = noFundsResult;
    testResults.summary.total_tests++;
    if (noFundsResult.success) testResults.summary.passed++;
    else testResults.summary.failed++;

    console.log('🧪 Testing Scenario 3: Inactive contractor');
    const inactiveResult = await testInactiveScenario();
    testResults.scenarios.inactive = inactiveResult;
    testResults.summary.total_tests++;
    if (inactiveResult.success) testResults.summary.passed++;
    else testResults.summary.failed++;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(testResults, null, 2)
    };
  } catch (error) {
    console.error('❌ Test execution error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

async function testWalletFundedScenario() {
  try {
    const testContractor = {
      id: 'test-wallet-funded-001',
      contact_name: 'John Wallet',
      email: 'test-wallet@example.com',
      phone: '+15551234567',
      industry: 'Home Services',
      sub_service: 'Plumbing'
    };

    await supabase.from('transactions').upsert([
      {
        contractor_id: testContractor.id,
        amount: 50.00,
        transaction_type: 'credit',
        description: 'Test wallet funding',
        created_at: new Date().toISOString()
      }
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('purchased_leads').upsert([
      {
        contractor_id: testContractor.id,
        lead_id: 'test-lead-001',
        purchased_at: thirtyDaysAgo,
        amount: 25.00
      }
    ]);

    const mockLead = {
      id: 'test-lead-wallet-001',
      service_category: 'Home Services',
      sub_service: 'Plumbing',
      zip_code: '12345'
    };

    const results = await notifyContractorsForLead(mockLead, [testContractor]);

    return {
      success: results.sms_sent === 1 && results.emails_sent === 1 && results.errors.length === 0,
      expected: { sms_sent: 1, emails_sent: 1, errors: 0 },
      actual: results,
      test_data: {
        contractor: testContractor,
        wallet_balance: 50.00,
        recent_purchase: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      scenario: 'wallet_funded'
    };
  }
}

async function testNoFundsScenario() {
  try {
    const testContractor = {
      id: 'test-no-funds-001',
      contact_name: 'Jane NoFunds',
      email: 'test-nofunds@example.com',
      phone: '+15551234568',
      industry: 'Home Services',
      sub_service: 'Plumbing'
    };

    await supabase.from('transactions').delete().eq('contractor_id', testContractor.id);

    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('purchased_leads').upsert([
      {
        contractor_id: testContractor.id,
        lead_id: 'test-lead-002',
        purchased_at: twentyDaysAgo,
        amount: 25.00
      }
    ]);

    const mockLead = {
      id: 'test-lead-nofunds-001',
      service_category: 'Home Services',
      sub_service: 'Plumbing',
      zip_code: '12345'
    };

    const results = await notifyContractorsForLead(mockLead, [testContractor]);

    return {
      success: results.sms_sent === 0 && results.emails_sent === 1 && results.errors.length === 0,
      expected: { sms_sent: 0, emails_sent: 1, errors: 0 },
      actual: results,
      test_data: {
        contractor: testContractor,
        wallet_balance: 0.00,
        recent_purchase: true
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      scenario: 'no_funds'
    };
  }
}

async function testInactiveScenario() {
  try {
    const testContractor = {
      id: 'test-inactive-001',
      contact_name: 'Bob Inactive',
      email: 'test-inactive@example.com',
      phone: '+15551234569',
      industry: 'Home Services',
      sub_service: 'Plumbing'
    };

    await supabase.from('purchased_leads').delete().eq('contractor_id', testContractor.id);

    const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('purchased_leads').upsert([
      {
        contractor_id: testContractor.id,
        lead_id: 'test-lead-003',
        purchased_at: fortyDaysAgo,
        amount: 25.00
      }
    ]);

    const mockLead = {
      id: 'test-lead-inactive-001',
      service_category: 'Home Services',
      sub_service: 'Plumbing',
      zip_code: '12345'
    };

    const results = await notifyContractorsForLead(mockLead, [testContractor]);

    return {
      success: results.sms_sent === 0 && results.emails_sent === 1 && results.errors.length === 0,
      expected: { sms_sent: 0, emails_sent: 1, errors: 0 },
      actual: results,
      test_data: {
        contractor: testContractor,
        wallet_balance: 0.00,
        recent_purchase: false,
        last_purchase: fortyDaysAgo
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      scenario: 'inactive'
    };
  }
}
