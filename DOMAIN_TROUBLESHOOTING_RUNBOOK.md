# Domain Troubleshooting Runbook

## When Custom Domain Fails

### Quick Diagnosis
```bash
# Test custom domain
curl -I https://customleadmatch.com/

# Test Netlify subdomain
curl -I https://customleadmatch.netlify.app/

# Check SSL certificate
openssl s_client -connect customleadmatch.com:443 -servername customleadmatch.com < /dev/null
```

### If Custom Domain Fails But Netlify Subdomain Works
This indicates a Netlify custom domain configuration issue:

1. **Immediate Workaround**: Direct users to https://customleadmatch.netlify.app/
2. **Fix**: Follow steps in SSL_DOMAIN_ISSUE.md
3. **Monitor**: Use scripts/monitor-domain-health.js

### If Both Domains Fail
This indicates a deployment or code issue:

1. Check recent commits for breaking changes
2. Review Netlify build logs
3. Check Netlify function logs
4. Consider rolling back to last working deployment

### Prevention
- Run domain health checks after each deployment
- Monitor SSL certificate expiration dates
- Document any DNS or domain configuration changes
- Set up alerts for domain failures

## Monitoring Commands

### Test Domain Health
```bash
node scripts/monitor-domain-health.js
```

### Check SSL Certificate Details
```bash
openssl s_client -connect customleadmatch.com:443 -servername customleadmatch.com < /dev/null 2>/dev/null | openssl x509 -noout -text | grep -A 5 "Validity"
```

### Monitor SSL Certificate Expiration
```bash
node scripts/ssl-certificate-monitor.js
```

### Check DNS Resolution
```bash
dig customleadmatch.com A
dig customleadmatch.netlify.app A
```

## Automated Monitoring

### GitHub Actions Workflows
- **Deploy Workflow**: Includes domain health checks after each deployment
- **Domain Health Monitor**: Runs every 15 minutes to detect issues early
- **SSL Certificate Monitor**: Alerts when certificate needs renewal

### Local Monitoring Scripts
- `scripts/monitor-domain-health.js`: Comprehensive domain health check
- `scripts/ssl-certificate-monitor.js`: SSL certificate expiration monitoring

## Emergency Response

### Immediate Actions
1. **Verify Issue**: Run `node scripts/monitor-domain-health.js`
2. **Communicate Workaround**: Direct users to https://customleadmatch.netlify.app/
3. **Check Netlify Dashboard**: Follow SSL_DOMAIN_ISSUE.md troubleshooting steps
4. **Monitor Resolution**: Use automated scripts to verify fix

### Escalation Path
1. **Level 1**: Automated monitoring detects issue
2. **Level 2**: GitHub Actions alerts on deployment failures
3. **Level 3**: Manual intervention required in Netlify dashboard
4. **Level 4**: Contact Netlify support if dashboard fixes don't work

## Emergency Contacts
- Netlify Dashboard: https://app.netlify.com/
- DNS Provider: Check domain registrar settings
- SSL Certificate: Let's Encrypt (auto-renewed by Netlify)
- Backup Domain: https://customleadmatch.netlify.app/

## Historical Issues
- **Aug 1, 2025**: Intermittent SSL handshake failures on custom domain
  - Root Cause: Netlify custom domain SSL configuration
  - Resolution: Netlify dashboard SSL certificate renewal
  - Prevention: Automated monitoring implemented

## Monitoring Commands

### Test Domain Health
```bash
node scripts/monitor-domain-health.js
```

### Check SSL Certificate Details
```bash
openssl s_client -connect customleadmatch.com:443 -servername customleadmatch.com < /dev/null 2>/dev/null | openssl x509 -noout -text | grep -A 5 "Validity"
```

### Check DNS Resolution
```bash
dig customleadmatch.com A
dig customleadmatch.netlify.app A
```

## Emergency Contacts
- Netlify Dashboard: https://app.netlify.com/
- DNS Provider: Check domain registrar settings
- SSL Certificate: Let's Encrypt (auto-renewed by Netlify)
