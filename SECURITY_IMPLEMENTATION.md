# Security Hardening Implementation

This document outlines the comprehensive security improvements implemented for the Custom Lead Match platform.

## 🔒 Security Features Implemented

### 1. Rate Limiting
- **Location**: `netlify/functions/lib/rate-limiter.js`
- **Coverage**: All public APIs (signup, login, lead submission, admin login)
- **Limits**:
  - Signup: 3 requests per hour
  - Login: 10 requests per 15 minutes
  - Lead submission: 5 requests per hour
  - Admin login: 5 requests per 15 minutes
  - Default: 100 requests per hour

### 2. Two-Factor Authentication (2FA)
- **Location**: `netlify/functions/lib/two-factor-auth.js`
- **Features**:
  - TOTP (Time-based One-Time Password) support
  - QR code generation for easy setup
  - Backup codes for recovery
  - Optional for contractors, can be made mandatory for admins

### 3. JWT-based Session Management
- **Location**: `netlify/functions/lib/jwt-auth.js`
- **Features**:
  - Secure JWT tokens with 1-hour expiration
  - Refresh tokens with 7-day expiration
  - Session tracking with IP and user agent
  - Automatic session cleanup

### 4. Database Security Enhancements
- **Location**: `database/security-hardening-migration.sql`
- **Improvements**:
  - Added constraints for phone number validation
  - Wallet balance non-negative constraint
  - Lead price validation
  - Proper indexing for performance
  - Row-level security policies

### 5. Enhanced Authentication Endpoints
- **Updated Files**:
  - `contractor-login.js` - Added rate limiting and 2FA support
  - `contractors-signup.js` - Added rate limiting
  - `leads-submit.js` - Enhanced rate limiting
  - `admin-auth.js` - Added rate limiting and improved security

## 🧪 Testing Infrastructure

### Unit Tests
- **Location**: `tests/security.spec.ts`
- **Coverage**:
  - Rate limiting validation
  - 2FA flow testing
  - JWT token validation
  - Authentication security

### Load Testing
- **Location**: `scripts/load-test.js`
- **Features**:
  - Simulates 100-500 concurrent requests
  - Tests multiple endpoints simultaneously
  - Validates rate limiting effectiveness
  - Performance metrics collection

## 🚀 Deployment Instructions

### 1. Database Migration
```bash
psql $DATABASE_URL -f database/security-hardening-migration.sql
```

### 2. Environment Variables
Add to your `.env` file:
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
RATE_LIMIT_ENABLED=true
TWO_FACTOR_ISSUER=Custom Lead Match
ADMIN_EMAIL=admin@customleadmatch.com
```

### 3. Testing
```bash
# Run unit tests
npm test

# Run load tests
node scripts/load-test.js

# Test rate limiting manually
for i in {1..5}; do
  curl -X POST https://customleadmatch.com/.netlify/functions/contractors-signup \
    -H "Content-Type: application/json" \
    -d '{"business_name":"Test","contact_name":"Test","email":"test'$i'@example.com","phone":"555-123-4567","username":"test'$i'","password":"password123","industry":"Home Services","sub_service":"Plumbing","zip_codes":"12345"}'
done
```

## 🔧 Configuration Options

### Rate Limiting
Modify limits in `netlify/functions/lib/rate-limiter.js`:
```javascript
const RATE_LIMITS = {
  signup: { requests: 3, window: 3600000 },    // 3 per hour
  login: { requests: 10, window: 900000 },     // 10 per 15 min
  submit: { requests: 5, window: 3600000 },    // 5 per hour
  admin_login: { requests: 5, window: 900000 }, // 5 per 15 min
  default: { requests: 100, window: 3600000 }   // 100 per hour
}
```

### JWT Configuration
Modify token expiration in `netlify/functions/lib/jwt-auth.js`:
```javascript
const JWT_EXPIRES_IN = '1h'              // Access token
const REFRESH_TOKEN_EXPIRES_IN = '7d'    // Refresh token
```

## 🛡️ Security Best Practices

1. **JWT Secret**: Use a strong, randomly generated secret in production
2. **Rate Limiting**: Monitor and adjust limits based on legitimate usage patterns
3. **2FA**: Encourage contractors to enable 2FA for enhanced security
4. **Session Management**: Regularly clean up expired sessions
5. **Database Constraints**: Ensure all critical fields have proper validation

## 📊 Monitoring

### Rate Limiting Logs
Monitor the `rate_limit_logs` table for abuse patterns:
```sql
SELECT identifier, endpoint, COUNT(*) as requests, 
       MIN(created_at) as first_request, MAX(created_at) as last_request
FROM rate_limit_logs 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY identifier, endpoint
ORDER BY requests DESC;
```

### Session Activity
Monitor active sessions:
```sql
SELECT COUNT(*) as active_sessions,
       COUNT(DISTINCT contractor_id) as unique_contractors
FROM contractor_sessions 
WHERE expires_at > NOW();
```

## 🔄 Backward Compatibility

All security enhancements maintain backward compatibility:
- Existing contractors can continue using the platform without 2FA
- Session tokens work alongside JWT tokens during transition
- Rate limiting fails open if service is unavailable
- Database constraints are added safely with existence checks

## 🚨 Emergency Procedures

### Disable Rate Limiting
Set environment variable: `RATE_LIMIT_ENABLED=false`

### Reset 2FA for User
```sql
UPDATE contractor_2fa SET enabled = false WHERE contractor_id = 'user-id';
```

### Emergency Admin Access
Use environment variables for admin authentication as fallback.
