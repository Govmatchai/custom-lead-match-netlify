const https = require('https');
const fs = require('fs');

const domains = [
  'https://customleadmatch.com/',
  'https://customleadmatch.netlify.app/'
];

async function checkDomain(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const req = https.get(url, (res) => {
      const responseTime = Date.now() - startTime;
      resolve({
        url,
        status: res.statusCode,
        responseTime,
        success: true,
        error: null
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: null,
        responseTime: Date.now() - startTime,
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: null,
        responseTime: Date.now() - startTime,
        success: false,
        error: 'Timeout'
      });
    });
  });
}

async function checkSSLCertificate(domain) {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    const hostname = domain.replace('https://', '').replace('/', '');
    
    const openssl = spawn('openssl', ['s_client', '-connect', `${hostname}:443`, '-servername', hostname]);
    let output = '';
    
    openssl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    openssl.on('close', (code) => {
      if (code === 0 && output.includes('-----BEGIN CERTIFICATE-----')) {
        resolve({ success: true, error: null });
      } else {
        resolve({ success: false, error: 'SSL handshake failed' });
      }
    });
    
    openssl.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
    
    setTimeout(() => {
      openssl.kill();
      resolve({ success: false, error: 'SSL check timeout' });
    }, 10000);
    
    openssl.stdin.end();
  });
}

async function monitorDomains() {
  console.log(`\n=== Domain Health Check - ${new Date().toISOString()} ===`);
  
  let hasFailures = false;
  
  for (const domain of domains) {
    const result = await checkDomain(domain);
    const status = result.success ? '✅ HEALTHY' : '❌ FAILED';
    console.log(`${status} ${result.url} - ${result.responseTime}ms`);
    
    if (!result.success) {
      hasFailures = true;
      console.log(`   Error: ${result.error}`);
      
      if (domain === 'https://customleadmatch.com/') {
        console.log(`   🔍 Checking SSL certificate...`);
        const sslResult = await checkSSLCertificate(domain);
        if (!sslResult.success) {
          console.log(`   🔒 SSL Issue: ${sslResult.error}`);
          console.log(`   📋 Action Required: Check Netlify dashboard SSL settings`);
        }
      }
    }
  }
  
  if (hasFailures) {
    console.log(`\n⚠️  FAILURES DETECTED`);
    console.log(`📖 See SSL_DOMAIN_ISSUE.md for troubleshooting steps`);
    console.log(`🔄 Workaround: Use https://customleadmatch.netlify.app/`);
    process.exit(1);
  } else {
    console.log(`\n✅ All domains healthy`);
  }
}

monitorDomains();
