# Custom Lead Match - Netlify Platform

A full-stack contractor lead generation platform built with React, Tailwind CSS, Netlify Functions, and Supabase.

## Features

- **Contractor Sign-Up**: Professional registration form with industry and service area selection
- **Lead Intake System**: Customer form for submitting service requests
- **SMS Notifications**: Real-time SMS alerts via Twilio when new leads match contractor criteria
- **Lead Claiming**: First-come, first-serve system with tokenized claim links
- **Payment Processing**: Stripe integration for lead credit purchases ($10/lead, 3 free leads)
- **Contractor Dashboard**: View claimed leads, credit balance, and purchase more credits
- **Admin Dashboard**: Manage contractors, view all leads, reset credits
- **Email Notifications**: SendGrid integration for signup confirmations

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Netlify Functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **SMS**: Twilio
- **Email**: SendGrid
- **Deployment**: Netlify with CI/CD from GitHub

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Twilio account
- Stripe account
- SendGrid account
- Netlify account

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd custom-lead-match-netlify
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd netlify/functions && npm install && cd ../..
   ```

3. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql` in the Supabase SQL editor
   - Get your project URL and anon key from Settings > API

4. **Configure environment variables**
   
   Create `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

   Configure Netlify environment variables (for production):
   ```env
   # Supabase
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   
   # Twilio
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # SendGrid
   SENDGRID_API_KEY=your_sendgrid_api_key
   
   # Admin
   ADMIN_PASSWORD=your_secure_admin_password
   
   # Site URL
   URL=https://your-netlify-site.netlify.app
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Deployment

#### Automatic Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add all environment variables listed above

3. **Configure Stripe Webhooks**
   - In Stripe Dashboard, go to Webhooks
   - Add endpoint: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
   - Select events: `checkout.session.completed`
   - Copy webhook secret to `STRIPE_WEBHOOK_SECRET` environment variable

#### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Netlify (requires Netlify CLI)
netlify deploy --prod --dir=dist
```

## API Endpoints

### Public Endpoints
- `GET /.netlify/functions/healthz` - Health check
- `GET /.netlify/functions/industries` - Get available industries
- `GET /.netlify/functions/sub-services?industry=<industry>` - Get sub-services for industry
- `POST /.netlify/functions/contractors-signup` - Register new contractor
- `POST /.netlify/functions/leads-submit` - Submit new lead
- `GET /.netlify/functions/leads-claim-get?token=<token>` - Check lead availability
- `POST /.netlify/functions/leads-claim-post` - Claim a lead
- `GET /.netlify/functions/contractors-dashboard?contractor_id=<id>` - Get contractor dashboard
- `POST /.netlify/functions/contractors-purchase-credits` - Purchase lead credits
- `POST /.netlify/functions/stripe-webhook` - Stripe webhook handler

### Admin Endpoints
- `POST /.netlify/functions/admin-auth` - Admin authentication
- `GET /.netlify/functions/admin-stats` - Get platform statistics
- `GET /.netlify/functions/admin-contractors` - Get all contractors
- `GET /.netlify/functions/admin-leads` - Get all leads
- `POST /.netlify/functions/admin-reset-credits` - Reset contractor credits

## Database Schema

The platform uses Supabase (PostgreSQL) with the following tables:

- **contractors**: Business information, service areas, lead credits
- **leads**: Customer service requests and claim status
- **claim_tokens**: Temporary tokens for lead claiming

See `database/schema.sql` for the complete schema.

## Key Features

### Lead Matching Algorithm
1. Customer submits service request
2. System finds contractors matching:
   - Same industry and sub-service
   - Service area includes customer's ZIP code
   - Has available lead credits
   - Opted in for SMS notifications
3. SMS sent to all matching contractors with claim link
4. First contractor to claim gets the lead

### Payment System
- 3 free leads for new contractors
- $10 per additional lead
- Stripe Checkout integration
- Automatic credit updates via webhooks

### Admin Dashboard
- Simple password authentication
- View platform statistics
- Manage contractors and leads
- Reset contractor credits

## Development

### Project Structure
```
custom-lead-match-netlify/
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── lib/               # Utilities and Supabase client
│   └── ...
├── netlify/functions/     # Serverless backend functions
├── database/              # Database schema and migrations
├── public/               # Static assets
└── ...
```

### Adding New Features

1. **Frontend**: Add components in `src/components/`
2. **Backend**: Add functions in `netlify/functions/`
3. **Database**: Update schema in `database/schema.sql`

### Testing

```bash
# Run frontend tests
npm test

# Local Development

For local development with Netlify functions access, use:
```bash
netlify dev
```

This serves both the frontend and Netlify functions together on localhost:8888.

**Important:** Do NOT use `npm run dev` for testing signup forms or other features that require Netlify functions, as it only serves the frontend via Vite and cannot access the functions. This will cause dropdown menus and form submissions to fail.

## Test Netlify Functions locally
netlify dev
```

## Development Safeguards Protocol

This project implements comprehensive safeguards to prevent regressions and ensure code quality.

### Automated Testing

Run the full UI test suite:
```bash
npm run test
```

Run tests with UI (interactive mode):
```bash
npm run test:ui
```

Run tests in headed mode (see browser):
```bash
npm run test:headed
```

### Pre-Commit QA Checklist

Before committing any changes, follow the [QA Checklist](./QA_CHECKLIST.md):

1. **Code Quality**: Run `npm run build` and `npm run lint`
2. **Functionality**: Test locally with `netlify dev`
3. **Automated Tests**: Run `npx playwright test`
4. **Component Isolation**: Verify reusable components work correctly
5. **Documentation**: Update docs if workflow changes

### Rollback Procedures

If issues arise after deployment, follow the [Rollback Procedures](./ROLLBACK_PROCEDURES.md):

- **Emergency**: Use Netlify dashboard for immediate rollback
- **Planned**: Follow systematic rollback process
- **Component-specific**: Target specific functionality rollbacks

### Reusable Components

The project uses isolated, reusable components to prevent code duplication:

- **IndustryDropdown**: Shared dropdown component for industry/sub-service selection
- **useIndustryDropdowns**: Custom hook for dropdown data management

### Commit Message Format

Use the provided [commit message template](./.gitmessage):

```
feat: Add new feature

- Detailed description of changes
- Why the changes were made
- Any breaking changes or migration notes

Closes #issue-number
```

### Testing Strategy

- **Unit Tests**: Component-level testing with isolated functionality
- **Integration Tests**: Full user flow testing (signup, authentication, etc.)
- **Mobile Testing**: Responsive design verification across viewports
- **Regression Testing**: Automated prevention of functionality breaks

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure all Netlify Functions include proper CORS headers
2. **Database Connection**: Verify Supabase URL and keys are correct
3. **SMS Not Sending**: Check Twilio credentials and phone number format
4. **Payments Failing**: Verify Stripe keys and webhook configuration

### Environment Variables

Make sure all required environment variables are set in both local `.env` file and Netlify dashboard.

### Database Issues

If you need to reset the database:
1. Go to Supabase Dashboard > SQL Editor
2. Run the schema from `database/schema.sql`

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Netlify Function logs in Netlify Dashboard
3. Check Supabase logs for database issues
4. Verify all environment variables are set correctly

## License

This project is proprietary software for Custom Lead Match.
