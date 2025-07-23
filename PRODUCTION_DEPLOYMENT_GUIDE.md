# Custom Lead Match - Production Deployment Guide

## Overview
This guide covers the complete deployment and configuration of the Custom Lead Match platform with all production-grade features including lead validation, multi-industry landing pages, and dynamic page generation.

## Features Implemented

### ✅ Lead Validation & Scrubbing System
- **Phone Validation**: Twilio Lookup API for phone number verification
- **Email Validation**: Format validation with optional external API integration
- **Duplicate Detection**: Prevents same phone/email submissions within 30 days
- **IP Rate Limiting**: Maximum 2 submissions per IP address per hour
- **Content Filtering**: Rejects spam keywords and insufficient content
- **Status Tracking**: Leads marked as 'valid', 'invalid', 'duplicate', or 'pending_review'

### ✅ Multi-Industry Landing Pages
- **Industry-Specific Pages**: HVAC, Legal, Real Estate, Finance, Insurance, Healthcare, Auto
- **Custom Messaging**: Each page tailored to industry with validation messaging
- **Shared Components**: Reusable LeadForm component with industry-specific defaults
- **SEO Optimized**: Individual routes for each industry (/hvac, /legal, etc.)

### ✅ Dynamic Landing Page Generator
- **Admin Interface**: Create custom landing pages through API
- **Database Storage**: Pages stored in Supabase with template data
- **Auto-Deployment**: Optional Netlify build hook integration
- **Contractor-Specific**: Pages can be tied to specific contractor IDs

### ✅ Enhanced Admin Dashboard
- **Lead Management**: Filter by status, industry, validation flags
- **Validation Monitoring**: View phone/email validation results
- **Contractor Management**: Reset credits, view performance
- **Archive System**: Automatic archiving of old/claimed leads

### ✅ Production-Grade Architecture
- **Database Schema**: Enhanced with validation fields, IP tracking, status management
- **Error Handling**: Comprehensive error responses with validation details
- **Security**: Row-level security policies, environment variable protection
- **Performance**: Indexed database queries, efficient validation logic

## Environment Variables Required

### Database Configuration
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here
```

### SMS & Phone Validation
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+13157844568
```

### Payment Processing
```env
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_public
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### Admin & Security
```env
ADMIN_PASSWORD=your_secure_password
```

### Optional Services
```env
SENDGRID_API_KEY=your_sendgrid_key
NETLIFY_BUILD_HOOK=your_build_hook_url
RECAPTCHA_SECRET_KEY=your_recaptcha_key
EMAIL_VALIDATION_API_KEY=your_validation_key
```

## Database Setup

1. Create new Supabase project at https://supabase.com/dashboard
2. Run the complete schema from `/database/complete-setup.sql`
3. Verify all tables created: contractors, leads, claim_tokens, industries, dynamic_pages
4. Check indexes and RLS policies are active

## Deployment Steps

### 1. Netlify Configuration
- Connect GitHub repository to Netlify
- Set build command: `npm run build`
- Set publish directory: `dist`
- Configure all environment variables in Netlify Dashboard

### 2. Database Migration
- Execute `/database/complete-setup.sql` in Supabase SQL Editor
- Verify sample data inserted correctly
- Test database connections from Netlify Functions

### 3. Function Testing
- Test lead validation: Submit various lead types
- Test SMS notifications: Verify only valid leads trigger SMS
- Test admin dashboard: Login and view validation data
- Test industry pages: Verify all routes load correctly

### 4. Production Verification
- Test lead submission with invalid phone numbers
- Test duplicate detection with same phone/email
- Test IP rate limiting with multiple submissions
- Test content filtering with spam keywords
- Verify SMS only sent for valid leads

## API Endpoints

### Lead Submission
- **POST** `/.netlify/functions/leads-submit`
- Validates lead before processing
- Returns validation summary and status

### Lead Validation
- **Function** `validateLead(leadData, clientIP)`
- Phone validation via Twilio
- Email format checking
- Duplicate and rate limit detection

### Dynamic Page Generation
- **POST** `/.netlify/functions/generate-landing-page`
- Creates custom landing pages
- Triggers Netlify rebuild if configured

### Lead Archive
- **POST** `/.netlify/functions/archive-leads`
- Archives claimed leads and leads >30 days old
- Maintains clean active lead pool

## Multi-Industry Routes

- `/` - Contractor signup (main page)
- `/hvac` - HVAC services landing page
- `/legal` - Legal services landing page
- `/real-estate` - Real estate services landing page
- `/finance` - Financial services landing page
- `/insurance` - Insurance services landing page
- `/healthcare` - Healthcare services landing page
- `/auto` - Auto services landing page
- `/admin` - Admin dashboard
- `/lead-intake` - General lead intake form

## Lead Validation Flow

1. **Input Validation**: Check required fields
2. **Phone Verification**: Twilio Lookup API call
3. **Email Validation**: Format and optional API check
4. **Duplicate Check**: Query last 30 days for same phone/email
5. **Rate Limiting**: Check IP submission count in last hour
6. **Content Filter**: Scan for spam keywords and minimum content
7. **Status Assignment**: Mark as valid/invalid/duplicate/pending
8. **SMS Notification**: Only sent for valid leads
9. **Database Storage**: Store with validation flags and IP

## Monitoring & Maintenance

### Lead Quality Metrics
- Monitor validation flag distribution
- Track SMS delivery success rates
- Review duplicate detection accuracy
- Analyze content filter effectiveness

### Performance Monitoring
- Database query performance
- Twilio API response times
- Lead processing throughput
- Admin dashboard load times

### Regular Maintenance
- Archive old leads (automated)
- Review validation rules effectiveness
- Update spam keyword filters
- Monitor contractor credit usage

## Troubleshooting

### Common Issues
1. **Supabase Connection**: Verify environment variables and RLS policies
2. **Twilio Validation**: Check account SID, auth token, and phone number format
3. **Lead Validation**: Review validation flags in admin dashboard
4. **SMS Delivery**: Check Twilio logs for delivery failures
5. **Dynamic Pages**: Verify build hook URL and permissions

### Debug Tools
- Admin dashboard lead management tab
- Netlify function logs
- Supabase dashboard query logs
- Twilio console delivery reports

## Security Considerations

- Environment variables secured in Netlify
- Row-level security enabled on all tables
- Admin password protection for dashboard
- IP tracking for rate limiting
- Validation flags prevent data manipulation

## Performance Optimizations

- Database indexes on frequently queried fields
- Efficient validation logic with early returns
- Cached industry/sub-service data
- Optimized SMS delivery with error handling
- Lazy loading of admin dashboard data

This deployment guide ensures the Custom Lead Match platform operates as a production-grade, fully automated lead generation system with comprehensive validation and quality controls.
