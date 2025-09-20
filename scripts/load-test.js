const https = require('https')
const { performance } = require('perf_hooks')

const BASE_URL = 'https://customleadmatch.com'
const CONCURRENT_REQUESTS = 100
const TOTAL_REQUESTS = 500

const endpoints = [
  { path: '/.netlify/functions/leads-submit', method: 'POST', data: {
    customer_name: 'Load Test Customer',
    service_category: 'Home Services',
    sub_service: 'Plumbing',
    zip_code: '12345',
    phone: '555-123-4567',
    email: 'loadtest@example.com',
    description: 'Load testing lead submission',
    urgency: 'Standard'
  }},
  { path: '/.netlify/functions/contractor-login', method: 'POST', data: {
    username: 'loadtest',
    password: 'wrongpassword'
  }},
  { path: '/.netlify/functions/contractors-signup', method: 'POST', data: {
    business_name: 'Load Test Company',
    contact_name: 'Load Test User',
    email: 'loadtest@example.com',
    phone: '555-123-4567',
    username: 'loadtest',
    password: 'password123',
    industry: 'Home Services',
    sub_service: 'Plumbing',
    zip_codes: '12345'
  }}
]

const makeRequest = (endpoint, requestId) => {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      ...endpoint.data,
      email: `loadtest${requestId}@example.com`,
      username: `loadtest${requestId}`
    })
    
    const options = {
      hostname: 'customleadmatch.com',
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }
    
    const startTime = performance.now()
    
    const req = https.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        const endTime = performance.now()
        resolve({
          statusCode: res.statusCode,
          responseTime: endTime - startTime,
          endpoint: endpoint.path,
          requestId
        })
      })
    })
    
    req.on('error', (error) => {
      const endTime = performance.now()
      resolve({
        statusCode: 0,
        responseTime: endTime - startTime,
        endpoint: endpoint.path,
        requestId,
        error: error.message
      })
    })
    
    req.write(data)
    req.end()
  })
}

const runLoadTest = async () => {
  console.log(`Starting load test: ${TOTAL_REQUESTS} requests with ${CONCURRENT_REQUESTS} concurrent`)
  
  const results = []
  const batches = Math.ceil(TOTAL_REQUESTS / CONCURRENT_REQUESTS)
  
  for (let batch = 0; batch < batches; batch++) {
    const batchPromises = []
    const batchSize = Math.min(CONCURRENT_REQUESTS, TOTAL_REQUESTS - batch * CONCURRENT_REQUESTS)
    
    for (let i = 0; i < batchSize; i++) {
      const requestId = batch * CONCURRENT_REQUESTS + i
      const endpoint = endpoints[requestId % endpoints.length]
      batchPromises.push(makeRequest(endpoint, requestId))
    }
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    console.log(`Completed batch ${batch + 1}/${batches}`)
  }
  
  const successfulRequests = results.filter(r => r.statusCode >= 200 && r.statusCode < 300)
  const rateLimitedRequests = results.filter(r => r.statusCode === 429)
  const errorRequests = results.filter(r => r.statusCode >= 400 || r.statusCode === 0)
  
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
  const maxResponseTime = Math.max(...results.map(r => r.responseTime))
  const minResponseTime = Math.min(...results.map(r => r.responseTime))
  
  console.log('\n=== Load Test Results ===')
  console.log(`Total requests: ${results.length}`)
  console.log(`Successful: ${successfulRequests.length} (${(successfulRequests.length/results.length*100).toFixed(1)}%)`)
  console.log(`Rate limited: ${rateLimitedRequests.length} (${(rateLimitedRequests.length/results.length*100).toFixed(1)}%)`)
  console.log(`Errors: ${errorRequests.length} (${(errorRequests.length/results.length*100).toFixed(1)}%)`)
  console.log(`Avg response time: ${avgResponseTime.toFixed(2)}ms`)
  console.log(`Min response time: ${minResponseTime.toFixed(2)}ms`)
  console.log(`Max response time: ${maxResponseTime.toFixed(2)}ms`)
  
  if (rateLimitedRequests.length > 0) {
    console.log('\n✅ Rate limiting is working correctly')
  } else {
    console.log('\n⚠️  No rate limiting detected - check configuration')
  }
}

runLoadTest().catch(console.error)
