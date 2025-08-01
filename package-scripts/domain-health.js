#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const SCRIPTS_DIR = path.join(__dirname, '..', 'scripts');

function runScript(scriptName, description) {
  console.log(`\n🔍 ${description}...`);
  try {
    const scriptPath = path.join(SCRIPTS_DIR, scriptName);
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed`);
    return false;
  }
}

async function runDomainHealthSuite() {
  console.log('=== Domain Health Suite ===');
  console.log(`Started at: ${new Date().toISOString()}`);
  
  const results = [];
  
  results.push(runScript('monitor-domain-health.js', 'Domain Health Check'));
  results.push(runScript('ssl-certificate-monitor.js', 'SSL Certificate Monitor'));
  
  const successCount = results.filter(r => r).length;
  const totalCount = results.length;
  
  console.log(`\n📊 Results: ${successCount}/${totalCount} checks passed`);
  
  if (successCount === totalCount) {
    console.log('✅ All domain health checks passed');
    process.exit(0);
  } else {
    console.log('❌ Some domain health checks failed');
    console.log('📖 See SSL_DOMAIN_ISSUE.md for troubleshooting steps');
    console.log('🔄 Workaround: Use https://customleadmatch.netlify.app/');
    process.exit(1);
  }
}

runDomainHealthSuite();
