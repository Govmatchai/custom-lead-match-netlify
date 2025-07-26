exports.handler = async (event, context) => {
  const { industry } = event.queryStringParameters || {}

  const subServices = {
    home_services: [
      { value: 'plumbing', label: 'Plumbing' },
      { value: 'electrical', label: 'Electrical' },
      { value: 'hvac', label: 'HVAC' },
      { value: 'roofing', label: 'Roofing' },
      { value: 'flooring', label: 'Flooring' },
      { value: 'painting', label: 'Painting' },
      { value: 'landscaping', label: 'Landscaping' },
      { value: 'cleaning', label: 'Cleaning' }
    ],
    legal: [
      { value: 'personal_injury', label: 'Personal Injury' },
      { value: 'family_law', label: 'Family Law' },
      { value: 'criminal_defense', label: 'Criminal Defense' },
      { value: 'business_law', label: 'Business Law' },
      { value: 'estate_planning', label: 'Estate Planning' }
    ],
    real_estate: [
      { value: 'buying', label: 'Buying' },
      { value: 'selling', label: 'Selling' },
      { value: 'renting', label: 'Renting' },
      { value: 'property_management', label: 'Property Management' }
    ],
    finance: [
      { value: 'loans', label: 'Loans' },
      { value: 'mortgages', label: 'Mortgages' },
      { value: 'financial_planning', label: 'Financial Planning' },
      { value: 'tax_services', label: 'Tax Services' }
    ],
    insurance: [
      { value: 'auto_insurance', label: 'Auto Insurance' },
      { value: 'home_insurance', label: 'Home Insurance' },
      { value: 'life_insurance', label: 'Life Insurance' },
      { value: 'business_insurance', label: 'Business Insurance' }
    ],
    healthcare: [
      { value: 'general_practice', label: 'General Practice' },
      { value: 'dental', label: 'Dental' },
      { value: 'mental_health', label: 'Mental Health' },
      { value: 'specialist', label: 'Specialist' }
    ],
    automotive: [
      { value: 'repair', label: 'Repair' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'body_work', label: 'Body Work' },
      { value: 'towing', label: 'Towing' }
    ]
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify(subServices[industry] || [])
  }
}
