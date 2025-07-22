import dotenv from 'dotenv'
dotenv.config({ path: '../../.env' })

export const handler = async (event, context) => {
  const industries = [
    { value: 'home_services', label: 'Home Services' },
    { value: 'legal', label: 'Legal' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'finance', label: 'Finance' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'automotive', label: 'Automotive' }
  ]

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify(industries)
  }
}
