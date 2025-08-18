import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function subDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export const handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ detail: 'Method not allowed' })
    };
  }

  try {
    const dateRange = parseInt(event.queryStringParameters?.dateRange || '30');
    const startDate = subDays(new Date(), dateRange).toISOString();
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

    const { data: activeContractorIds } = await supabase
      .from('purchased_leads')
      .select('contractor_id')
      .gte('purchased_at', startDate);

    const activeContractors = new Set(activeContractorIds?.map(p => p.contractor_id)).size;

    const { data: allContractors } = await supabase.from('contractors').select('id');
    const { data: recentPurchases } = await supabase
      .from('purchased_leads')
      .select('contractor_id')
      .gte('purchased_at', thirtyDaysAgo);

    const recentContractorIds = new Set(recentPurchases?.map(p => p.contractor_id));
    const inactiveContractors = allContractors?.filter(c => !recentContractorIds.has(c.id)).length || 0;

    const { data: transactions } = await supabase.from('transactions').select('contractor_id, amount');
    const walletBalances = {};
    transactions?.forEach(t => {
      walletBalances[t.contractor_id] = (walletBalances[t.contractor_id] || 0) + parseFloat(t.amount);
    });

    const walletDistribution = [
      { name: 'Funded ($20+)', value: Object.values(walletBalances).filter(b => b >= 20).length },
      { name: 'Low Balance ($1-19)', value: Object.values(walletBalances).filter(b => b > 0 && b < 20).length },
      { name: 'Empty ($0)', value: Object.values(walletBalances).filter(b => b <= 0).length }
    ];

    const lowWalletBalances = Object.values(walletBalances).filter(b => b < 20 && b > 0).length;

    const { data: revenueData } = await supabase
      .from('lead_sales')
      .select('amount, purchased_at')
      .gte('purchased_at', startDate)
      .order('purchased_at');

    const totalRevenue = revenueData?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;

    const { data: topContractorsData } = await supabase
      .from('lead_sales')
      .select('contractor_id, amount, contractors(business_name)')
      .gte('purchased_at', startDate);

    const contractorSpend = {};
    topContractorsData?.forEach(sale => {
      const id = sale.contractor_id;
      contractorSpend[id] = {
        name: sale.contractors?.business_name || 'Unknown',
        spent: (contractorSpend[id]?.spent || 0) + parseFloat(sale.amount)
      };
    });

    const topContractors = Object.values(contractorSpend)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);

    const { data: leadsByService } = await supabase
      .from('leads')
      .select('service_category')
      .gte('created_at', startDate);

    const serviceCount = {};
    leadsByService?.forEach(lead => {
      serviceCount[lead.service_category] = (serviceCount[lead.service_category] || 0) + 1;
    });

    const leadsByServiceChart = Object.entries(serviceCount).map(([service, count]) => ({
      service,
      count
    }));

    const { data: unclaimedOldLeads } = await supabase
      .from('leads')
      .select('id')
      .eq('claimed', false)
      .lt('created_at', subDays(new Date(), 1).toISOString());

    const unclaimedLeads = unclaimedOldLeads?.length || 0;

    const revenueByDay = {};
    revenueData?.forEach(r => {
      const date = r.purchased_at.split('T')[0];
      revenueByDay[date] = (revenueByDay[date] || 0) + parseFloat(r.amount);
    });

    const revenueChart = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue
    }));

    const { data: claimTimes } = await supabase
      .from('leads')
      .select('created_at, claimed_at')
      .not('claimed_at', 'is', null)
      .gte('created_at', startDate);

    let avgTimeToClaimHours = 0;
    if (claimTimes?.length > 0) {
      const totalHours = claimTimes.reduce((sum, lead) => {
        const created = new Date(lead.created_at);
        const claimed = new Date(lead.claimed_at);
        const hours = (claimed - created) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgTimeToClaimHours = Math.round(totalHours / claimTimes.length);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        activeContractors,
        inactiveContractors,
        lowWalletBalances,
        unclaimedLeads,
        walletDistribution,
        topContractors,
        leadsByService: leadsByServiceChart,
        revenueData: revenueChart,
        totalRevenue: totalRevenue.toFixed(2),
        avgTimeToClaimHours,
        emailDeliveryRate: 95,
        contractorGrowth: 12,
        revenueGrowth: 8,
        claimTimeImprovement: -15,
        deliveryRateChange: 2
      })
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
