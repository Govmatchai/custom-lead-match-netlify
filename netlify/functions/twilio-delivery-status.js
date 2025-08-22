exports.handler = async (event, context) => {
  console.log('Twilio Delivery Status Callback received:', {
    httpMethod: event.httpMethod,
    headers: event.headers,
    timestamp: new Date().toISOString()
  })

  if (event.httpMethod !== 'POST') {
    console.log('Invalid HTTP method:', event.httpMethod)
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const body = event.body
    console.log('Raw webhook body:', body)

    const params = new URLSearchParams(body)
    const webhookData = {
      MessageSid: params.get('MessageSid'),
      MessageStatus: params.get('MessageStatus'),
      To: params.get('To'),
      From: params.get('From'),
      Timestamp: params.get('Timestamp')
    }

    console.log('Parsed Twilio delivery status data:', webhookData)

    console.log('Twilio Delivery Status Details:', {
      MessageSid: webhookData.MessageSid,
      MessageStatus: webhookData.MessageStatus,
      To: webhookData.To,
      From: webhookData.From,
      Timestamp: webhookData.Timestamp,
      receivedAt: new Date().toISOString()
    })

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Delivery status received',
        messageSid: webhookData.MessageSid,
        status: webhookData.MessageStatus
      })
    }

  } catch (error) {
    console.error('Error processing Twilio delivery status webhook:', {
      error: error.message,
      stack: error.stack,
      body: event.body
    })

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error processing delivery status',
        details: error.message
      })
    }
  }
}
