# Rollback Procedures

## Quick Rollback (Emergency)

### 1. Netlify Dashboard Rollback
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Navigate to the site deployment history
3. Find the last known good deployment
4. Click "Publish deploy" on that version
5. Verify the rollback worked by testing key functionality

### 2. GitHub Branch Rollback
```bash
# Revert to last known good commit
git log --oneline  # Find the commit hash
git revert <commit-hash>
git push origin <branch-name>
```

## Systematic Rollback (Planned)

### 1. Document Current State
- [ ] Note current commit hash: `git rev-parse HEAD`
- [ ] Document current environment variables
- [ ] Screenshot current functionality
- [ ] Note any database schema changes

### 2. Identify Rollback Target
- [ ] Determine target commit or deployment
- [ ] Verify target state is stable
- [ ] Check for database compatibility

### 3. Execute Rollback
- [ ] Create rollback branch: `git checkout -b rollback-<date>`
- [ ] Revert changes: `git revert <commit-range>`
- [ ] Test locally: `netlify dev`
- [ ] Run QA checklist
- [ ] Deploy and verify

### 4. Post-Rollback Actions
- [ ] Update team on rollback status
- [ ] Document issues that caused rollback
- [ ] Plan fix for rolled-back changes
- [ ] Monitor system stability

## Component-Specific Rollback

### Dropdown Components
If dropdown functionality breaks:
1. Check Netlify functions are deployed
2. Verify environment variables
3. Test with `netlify dev` not `npm run dev`
4. Rollback to previous component version if needed

### Authentication Flow
If login/signup breaks:
1. Check session token generation
2. Verify localStorage storage
3. Test redirect functionality
4. Rollback authentication changes if needed

### Shared Components
If reusable components break:
1. Check import paths are correct
2. Verify component props interface
3. Test component isolation
4. Rollback to individual component implementations if needed

## Database Rollback

### Schema Changes
```sql
-- Example rollback for contractor_sessions table
DROP TABLE IF EXISTS contractor_sessions;
-- Restore previous schema if needed
```

### Data Migration Rollback
1. Backup current data state
2. Restore from previous backup
3. Verify data integrity
4. Update application to match data schema

## Environment Variable Rollback

### Local Development
```bash
# Restore previous .env file
git checkout HEAD~1 -- .env
# Or restore from backup
cp .env.backup .env
```

### Production (Netlify)
1. Access Netlify dashboard
2. Go to Site settings > Environment variables
3. Restore previous variable values
4. Trigger new deployment

## Testing Rollback Success

### Automated Verification
```bash
# Run full test suite
npm run build
npm run lint
npx playwright test

# Test key functionality
netlify dev
# Manual testing of signup flow
# Verify dropdown functionality
# Check authentication flow
```

### Manual Verification Checklist
- [ ] Signup form loads correctly
- [ ] Dropdowns populate with data
- [ ] Form submission works
- [ ] Authentication flow completes
- [ ] Dashboard loads after signup
- [ ] Mobile viewport works correctly

## Prevention Strategies

### Pre-Deployment
- Always run QA checklist before deployment
- Use feature flags for major changes
- Deploy during low-traffic periods
- Have monitoring alerts set up

### Monitoring
- Set up alerts for 4xx/5xx errors
- Monitor signup completion rates
- Track dropdown API response times
- Alert on authentication failures

### Documentation
- Keep deployment logs
- Document all environment changes
- Maintain rollback decision tree
- Update procedures after each incident

## Emergency Contacts

### Technical Issues
- Primary: Development Team Lead
- Secondary: DevOps Engineer
- Escalation: CTO

### Business Impact
- Primary: Product Manager
- Secondary: Customer Success
- Escalation: CEO

## Recovery Time Objectives

- **Critical Issues**: 15 minutes
- **Major Issues**: 1 hour
- **Minor Issues**: 4 hours
- **Enhancement Rollbacks**: Next business day

## Post-Incident Review

After any rollback:
1. Document root cause
2. Update prevention measures
3. Improve monitoring
4. Update rollback procedures
5. Conduct team retrospective
