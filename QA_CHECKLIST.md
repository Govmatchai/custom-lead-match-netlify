# QA Checklist - Pre-Commit Verification

## Code Quality Checks
- [ ] Run `npm run build` - TypeScript compilation passes
- [ ] Run `npm run lint` - No linting errors
- [ ] All imports are used and properly organized
- [ ] No console.log statements in production code
- [ ] No hardcoded values that should be environment variables

## Environment Setup Verification
- [ ] Real Supabase credentials configured (not dummy values)
- [ ] All required environment variables present in .env
- [ ] Netlify functions can connect to external services
- [ ] Test with `netlify dev` (not `npm run dev`) for full stack testing
- [ ] Database connections work in local development

## Functionality Testing
- [ ] Test locally using `netlify dev` (not `npm run dev`)
- [ ] Signup form dropdowns populate correctly
- [ ] Complete signup flow works end-to-end (requires real DB credentials)
- [ ] Authentication and session management works
- [ ] Mobile viewport renders correctly
- [ ] All form validations work as expected

## Automated Testing
- [ ] Run `npx playwright test` - All UI tests pass
- [ ] Test coverage includes new functionality
- [ ] No flaky tests or intermittent failures
- [ ] Tests account for environment limitations (dummy credentials)

## Component Isolation
- [ ] Reusable components are properly abstracted
- [ ] No code duplication in dropdown logic
- [ ] Shared hooks are used consistently
- [ ] UI components follow established patterns

## Documentation
- [ ] README.md updated if workflow changes
- [ ] Commit message follows changelog format
- [ ] Breaking changes are documented
- [ ] Environment variable changes noted
- [ ] Environment setup issues documented

## Deployment Readiness
- [ ] Environment variables are properly configured
- [ ] Netlify functions work in local development
- [ ] No secrets or keys committed to repository
- [ ] Build artifacts are properly ignored
- [ ] Real credentials configured for production deployment

## Deployment Verification
- [ ] Verify Netlify functions are accessible after deployment
- [ ] Test `curl https://customleadmatch.netlify.app/.netlify/functions/industries`
- [ ] Test `curl https://customleadmatch.netlify.app/.netlify/functions/sub-services?industry=home_services`
- [ ] Confirm dropdowns populate on live site (not just local)
- [ ] Run live site Playwright tests: `npx playwright test tests/dropdown-functionality.spec.ts`
- [ ] Verify GitHub Actions deployment includes function verification step
- [ ] Check Netlify dashboard shows functions are deployed
- [ ] Test signup flow end-to-end on live site
- [ ] Verify mobile viewport dropdown functionality on live site

## Rollback Preparation
- [ ] Current deployment state documented
- [ ] Rollback procedure tested if major changes
- [ ] Database migration rollback plan (if applicable)
- [ ] Environment variable rollback plan documented

## Security Checks
- [ ] No sensitive data exposed in client-side code
- [ ] Authentication tokens properly secured
- [ ] Input validation implemented for all forms
- [ ] CORS settings configured correctly

## Performance Verification
- [ ] No unnecessary re-renders in React components
- [ ] Lazy loading implemented where appropriate
- [ ] Bundle size hasn't increased significantly
- [ ] API calls are optimized and cached when possible

## Cross-Browser Testing
- [ ] Tested in Chrome (latest)
- [ ] Tested in Firefox (latest)
- [ ] Tested in Safari (if available)
- [ ] Mobile browsers tested via device emulation

## Accessibility
- [ ] Form labels properly associated with inputs
- [ ] Keyboard navigation works correctly
- [ ] Screen reader compatibility verified
- [ ] Color contrast meets WCAG guidelines
