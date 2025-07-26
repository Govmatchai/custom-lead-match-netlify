# Developer Notes

## Core Business Rules
- Contractors receive 3 free lead credits upon signup
- Leads are matched by zip code + sub-service
- Leads are exclusive (1 contractor per lead)
- Twilio sends SMS when lead matches contractor
- Credit is deducted only after successful SMS
- Stripe handles credit purchases beyond the free tier

## System Architecture
- Supabase used for contractors + leads
- Netlify used for frontend deployment
- GitHub branching:
  - `dev`: all development
  - `main`: production (protected)
- Twilio is triggered on lead creation
- Stripe purchase event updates contractor credit balance

## Known Edge Cases
- Duplicate contractor emails
- Zip code match issues with malformed input
- Lead delivery attempts when credits = 0
