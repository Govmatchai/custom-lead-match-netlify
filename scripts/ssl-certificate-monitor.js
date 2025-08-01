const { spawn } = require('child_process');

const DOMAIN = 'customleadmatch.com';
const WARNING_DAYS = 30;

function checkSSLExpiration() {
  return new Promise((resolve, reject) => {
    const openssl = spawn('openssl', ['s_client', '-connect', `${DOMAIN}:443`, '-servername', DOMAIN]);
    let output = '';
    
    openssl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    openssl.on('close', (code) => {
      if (code === 0) {
        try {
          const certMatch = output.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);
          if (certMatch) {
            const cert = certMatch[0];
            const x509 = spawn('openssl', ['x509', '-noout', '-enddate']);
            
            x509.stdin.write(cert);
            x509.stdin.end();
            
            let endDateOutput = '';
            x509.stdout.on('data', (data) => {
              endDateOutput += data.toString();
            });
            
            x509.on('close', () => {
              const endDateMatch = endDateOutput.match(/notAfter=(.+)/);
              if (endDateMatch) {
                const expiryDate = new Date(endDateMatch[1]);
                const now = new Date();
                const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                
                resolve({
                  success: true,
                  expiryDate,
                  daysUntilExpiry,
                  needsRenewal: daysUntilExpiry < WARNING_DAYS
                });
              } else {
                reject(new Error('Could not parse certificate expiry date'));
              }
            });
          } else {
            reject(new Error('No certificate found in SSL response'));
          }
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error('SSL connection failed'));
      }
    });
    
    openssl.on('error', (error) => {
      reject(error);
    });
    
    setTimeout(() => {
      openssl.kill();
      reject(new Error('SSL check timeout'));
    }, 15000);
    
    openssl.stdin.end();
  });
}

async function monitorSSLCertificate() {
  console.log(`\n=== SSL Certificate Monitor - ${new Date().toISOString()} ===`);
  console.log(`Checking SSL certificate for ${DOMAIN}...`);
  
  try {
    const result = await checkSSLExpiration();
    
    console.log(`✅ SSL Certificate Status:`);
    console.log(`   Domain: ${DOMAIN}`);
    console.log(`   Expires: ${result.expiryDate.toISOString()}`);
    console.log(`   Days until expiry: ${result.daysUntilExpiry}`);
    
    if (result.needsRenewal) {
      console.log(`⚠️  WARNING: Certificate expires in ${result.daysUntilExpiry} days`);
      console.log(`📋 Action Required: Renew SSL certificate in Netlify dashboard`);
      process.exit(1);
    } else {
      console.log(`✅ Certificate is valid for ${result.daysUntilExpiry} more days`);
    }
    
  } catch (error) {
    console.log(`❌ SSL Certificate Check Failed:`);
    console.log(`   Error: ${error.message}`);
    console.log(`📋 Action Required: Check SSL configuration in Netlify dashboard`);
    process.exit(1);
  }
}

monitorSSLCertificate();
