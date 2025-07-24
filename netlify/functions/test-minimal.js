export const handler = async (event, context) => {
  console.log('=== MINIMAL TEST FUNCTION ===')
  console.log('Event:', event.httpMethod)
  
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ 
      success: true, 
      message: 'Minimal test function working',
      method: event.httpMethod,
      hasBody: !!event.body
    })
  }
}
