# 🚀 Custom Lead Match - Complete Setup Guide

## 📋 Current Status

✅ **COMPLETED:**
- Frontend deployed live: https://contractor-lead-generator-ljxlx5jg.devinapps.com
- All 13 Netlify Functions created and deployed
- Complete database schema prepared
- Git repository with 51 committed files
- CI/CD workflow configured

⚠️ **REQUIRES SETUP:**
- GitHub repository creation
- Supabase database configuration
- Environment variables in Netlify
- Service integrations (Twilio, Stripe, SendGrid)

## 🎯 Quick Setup (30 minutes)

### Step 1: Create GitHub Repository
```bash
# Go to: https://github.com/new
# Repository name: custom-lead-match-netlify
# Description: Production-ready contractor lead generation platform
# Public repository
# Don't initialize with README (we have existing code)

# Then push existing code:
cd /path/to/custom-lead-match-netlify
git remote add origin https://github.com/Govmatchai/custom-lead-match-netlify.git
git push -u origin main
```

### Step 2: Set Up Supabase Database
1. **Create Project:**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Choose organization and name: "custom-lead-match"
   - Set strong database password
   - Choose region closest to users

2. **Run Database Schema:**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the entire contents of `database/schema.sql`
   - Click "Run" to create all tables and data

3. **Get Credentials:**
   - Go to Settings → API
   - Copy Project URL
   - Copy anon/public key
   - Copy service_role/secret key

### Step 3: Configure Netlify Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables, add:

```env
# Database (REQUIRED)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# SMS Notifications (REQUIRED)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+13157844568

# Payment Processing (REQUIRED)
STRIPE_SECRET_KEY=sk_test_51xxxxx_or_sk_live_51xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx_or_pk_live_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# Admin Authentication (REQUIRED)
ADMIN_PASSWORD=your_secure_admin_password_here

# Email Notifications (OPTIONAL)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Connect GitHub to Netlify
1. In Netlify Dashboard → Site Settings → Build & Deploy
2. Click "Link to Git repository"
3. Choose GitHub and select your repository
4. Build settings should auto-populate:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

### Step 5: Configure Service Integrations

#### Twilio SMS Setup
1. Go to https://console.twilio.com
2. Get Account SID and Auth Token from dashboard
3. Phone number should be: +1 (315) 784-4568
4. Add credentials to Netlify environment variables

#### Stripe Payment Setup
1. Go to https://dashboard.stripe.com
2. Get API keys from Developers → API keys
3. Set up webhook endpoint:
   - URL: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
   - Events: `checkout.session.completed`
   - Copy webhook secret
4. Add all credentials to Netlify environment variables

#### SendGrid Email Setup (Optional)
1. Go to https://app.sendgrid.com
2. Create API key with Mail Send permissions
3. Add to Netlify environment variables

## 🧪 Testing Your Deployment

### 1. Test API Endpoints
```bash
# Health check (should return JSON)
curl https://your-site.netlify.app/.netlify/functions/healthz

# Industries list (should return array)
curl https://your-site.netlify.app/.netlify/functions/industries

# Admin authentication
curl -X POST https://your-site.netlify.app/.netlify/functions/admin-auth \
  -H "Content-Type: application/json" \
  -d '{"password":"your_admin_password"}'
```

### 2. Test Frontend Forms
1. **Contractor Signup:**
   - Fill out signup form
   - Should create database record
   - Should send confirmation email/SMS

2. **Lead Submission:**
   - Submit test lead via intake form
   - Should send SMS to matching contractors
   - Should create database record

3. **Admin Dashboard:**
   - Go to `/admin` route
   - Login with admin password
   - Should show contractors and leads

### 3. Test Payment Flow
1. Go to contractor dashboard
2. Click "Purchase Credits"
3. Complete Stripe checkout (use test card: 4242 4242 4242 4242)
4. Verify credits are added to account

## 🔧 Troubleshooting

### Functions Returning HTML Instead of JSON
- **Cause:** Missing environment variables
- **Fix:** Ensure all required environment variables are set in Netlify
- **Test:** Check Netlify Functions logs for specific errors

### Database Connection Errors
- **Cause:** Incorrect Supabase credentials
- **Fix:** Verify URL and keys in Netlify environment variables
- **Test:** Check Supabase logs in dashboard

### SMS Not Sending
- **Cause:** Twilio credentials or phone number format
- **Fix:** Verify Account SID, Auth Token, and phone number format (+1XXXXXXXXXX)
- **Test:** Check Twilio console for delivery logs

### Payment Processing Fails
- **Cause:** Stripe keys or webhook configuration
- **Fix:** Verify API keys and webhook endpoint URL
- **Test:** Check Stripe dashboard for webhook delivery

## 📊 Database Schema Overview

The platform uses 4 main tables:

### `contractors`
- Business information and contact details
- Service areas (ZIP codes) and industry
- Lead credit balance and Stripe customer ID
- SMS opt-in preferences

### `leads`
- Customer service requests
- Industry, service type, and location
- Claim status and contractor assignment
- Timestamps for tracking

### `claim_tokens`
- Secure tokens for lead claiming
- Expiration times and usage tracking
- Links leads to claim URLs

### `industries`
- Predefined industry categories
- Sub-service options for each industry
- Used for contractor matching

## 🎯 Success Criteria Checklist

- [ ] GitHub repository created and connected
- [ ] Supabase database configured with schema
- [ ] All environment variables set in Netlify
- [ ] API endpoints return JSON (not HTML)
- [ ] Contractor signup creates database records
- [ ] Lead submission sends SMS notifications
- [ ] Lead claiming works with credit deduction
- [ ] Payment processing adds credits to accounts
- [ ] Admin dashboard shows data and allows management
- [ ] All forms work in production environment
- [ ] CORS configured properly for all endpoints

## 🚀 Go Live Checklist

### Pre-Launch
- [ ] Test all user flows end-to-end
- [ ] Verify SMS delivery with real phone numbers
- [ ] Test payment processing with real cards
- [ ] Check admin dashboard functionality
- [ ] Verify all error handling works

### Launch
- [ ] Switch Stripe to live mode (if ready)
- [ ] Update any placeholder content
- [ ] Monitor error logs for first 24 hours
- [ ] Test with real customers

### Post-Launch
- [ ] Monitor Netlify function logs
- [ ] Check Supabase database performance
- [ ] Review Twilio SMS delivery rates
- [ ] Monitor Stripe payment success rates

## 📞 Support Resources

- **Netlify Functions Logs:** Netlify Dashboard → Functions
- **Database Logs:** Supabase Dashboard → Logs
- **SMS Delivery:** Twilio Console → Messaging
- **Payment Logs:** Stripe Dashboard → Events
- **Email Delivery:** SendGrid Dashboard → Activity

## 🔗 Important URLs

- **Live Frontend:** https://contractor-lead-generator-ljxlx5jg.devinapps.com
- **GitHub Repository:** https://github.com/Govmatchai/custom-lead-match-netlify (to be created)
- **Netlify Dashboard:** [Your Netlify site dashboard]
- **Supabase Dashboard:** [Your Supabase project dashboard]

---
**Setup Time:** ~30 minutes with all credentials ready  
**Technical Support:** Check function logs and database logs for specific errors  
**Devin Session:** https://app.devin.ai/sessions/34bb59d445f544a39164c3ce2361cff1
