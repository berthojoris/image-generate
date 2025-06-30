# Admin Session Timeout Feature

## Overview
This feature implements a 2-hour session timeout specifically for admin users. After 2 hours of inactivity or continuous session, admin users will be automatically logged out and redirected to the login page.

## Implementation Details

### 1. Session Configuration
- **File**: `src/lib/auth.ts`
- **Max Age**: 2 hours (7200 seconds)
- **Strategy**: JWT-based session management

### 2. JWT Token Tracking
- Login time is stored in JWT token (`loginTime` field)
- Session expiry is checked in the JWT callback
- Expired sessions return `null`, forcing logout

### 3. Client-Side Monitoring
- **Component**: `src/components/auth/session-timeout.tsx`
- **Check Interval**: Every 2 minutes
- **Scope**: Only active for admin users
- **Action**: Automatic logout with redirect to login page

### 4. Middleware Protection
- **File**: `middleware.ts` and `src/middleware/auth-middleware.ts`
- **Routes**: All `/admin/*` routes
- **Validation**: Server-side session expiry check
- **Redirect**: Automatic redirect to login with expiry message

### 5. User Experience
- **Login Page**: Shows session expiry messages
- **Toast Notifications**: Informs users about session expiration
- **Graceful Logout**: Preserves user data and provides clear messaging

## Security Benefits

1. **Reduced Attack Window**: Limits exposure time for compromised admin sessions
2. **Automatic Cleanup**: Ensures admin sessions don't persist indefinitely
3. **Multi-Layer Protection**: Both client-side and server-side validation
4. **Role-Specific**: Only affects admin users, regular users have normal session behavior

## Configuration

### Environment Variables
Ensure `NEXTAUTH_SECRET` is properly configured for JWT token security.

### Customization
To modify the timeout duration:
1. Update `maxAge` in `authOptions.session`
2. Update `twoHours` constant in JWT callback
3. Update `twoHours` constant in middleware
4. Update check interval in `SessionTimeout` component if needed

## Testing

1. **Login as Admin**: Verify normal login functionality
2. **Wait 2+ Hours**: Confirm automatic logout occurs
3. **Admin Route Access**: Test middleware protection
4. **Session Refresh**: Verify client-side monitoring works
5. **Error Handling**: Test network failures and edge cases

## Files Modified/Created

- `src/lib/auth.ts` - Session configuration and JWT handling
- `src/components/auth/session-timeout.tsx` - Client-side monitoring
- `src/providers/providers.tsx` - Global session timeout integration
- `src/app/auth/login/page.tsx` - Session expiry message handling
- `middleware.ts` - Main middleware entry point
- `src/middleware/auth-middleware.ts` - Admin route protection
- `docs/admin-session-timeout.md` - This documentation

## Notes

- Regular users (USER, EDITOR roles) are not affected by this timeout
- The feature is designed to be transparent to non-admin users
- Session checks are optimized to minimize server load
- All session expiry events are logged for security monitoring