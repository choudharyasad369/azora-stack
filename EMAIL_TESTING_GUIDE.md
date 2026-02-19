# Email Verification Testing Guide

**Quick guide to test the improved email verification system**

---

## Prerequisites

✅ Dev server running: `npm run dev`  
✅ Database connected  
✅ Resend API key configured in `.env`

---

## Test Scenarios

### ✅ Test 1: Complete Registration Flow

**Steps**:
1. Open http://localhost:3000/register
2. Fill in:
   - Name: Test User
   - Email: your-email@example.com
   - Password: Test@123456
   - Confirm Password: Test@123456
   - Role: Buyer or Seller
3. Click "Create Account"

**Expected Result**:
- Success message appears
- Console shows:
  ```
  📧 Attempting to send verification email to: your-email@example.com
  📧 Sending verification email to: your-email@example.com
  ✅ Verification email sent successfully to: your-email@example.com
  📬 Resend response: { id: '...', ... }
  ```
- Email received in inbox
- Email contains verification link

---

### ✅ Test 2: Email Verification

**Steps**:
1. Check your email inbox
2. Open "Welcome to Azora Stack" email
3. Click "Verify Email Address" button
4. Or copy/paste the verification link

**Expected Result**:
- Redirected to verification page
- Console shows:
  ```
  🔍 Email verification attempt with token: abc123def4...
  ✅ Email verified successfully for: your-email@example.com
  ```
- Success message: "Email verified successfully!"
- Auto-redirect to login page after 3 seconds

---

### ✅ Test 3: Login After Verification

**Steps**:
1. Go to http://localhost:3000/login
2. Enter verified email and password
3. Click "Sign In"

**Expected Result**:
- Successfully logged in
- Redirected to dashboard
- No "verify email" warnings

---

### ✅ Test 4: Validation Errors

**Test 4a: Invalid Email**
- Email: `test@invalid`
- Expected: "Please enter a valid email address"

**Test 4b: Short Password**
- Password: `Test123`
- Expected: "Password must be at least 8 characters"

**Test 4c: No Uppercase**
- Password: `test@123456`
- Expected: "Password must contain at least one uppercase letter"

**Test 4d: No Number**
- Password: `Test@abcdef`
- Expected: "Password must contain at least one number"

**Test 4e: Password Mismatch**
- Password: `Test@123456`
- Confirm: `Test@123457`
- Expected: "Passwords do not match"

---

### ✅ Test 5: Duplicate Email

**Steps**:
1. Register with email: test@example.com
2. Try to register again with same email

**Expected Result**:
- Error: "An account with this email already exists"

---

### ✅ Test 6: Invalid Verification Token

**Steps**:
1. Go to: http://localhost:3000/verify-email?token=invalid123
2. Wait for verification

**Expected Result**:
- Console shows:
  ```
  🔍 Email verification attempt with token: invalid123...
  ❌ Verification failed: Invalid or expired token
  ```
- Error message: "Invalid or expired verification token"
- Options to login or create new account

---

### ✅ Test 7: Missing Token

**Steps**:
1. Go to: http://localhost:3000/verify-email
2. No token in URL

**Expected Result**:
- Console shows:
  ```
  ❌ Verification failed: No token provided
  ```
- Error: "Invalid verification link"

---

### ✅ Test 8: Already Verified

**Steps**:
1. Verify an email successfully
2. Try to use the same verification link again

**Expected Result**:
- Console shows:
  ```
  ℹ️ User test@example.com is already verified
  ```
- Message: "Email is already verified. You can now login."

---

## Console Logs to Watch

### Successful Flow:
```
📧 Attempting to send verification email to: user@example.com
📧 Sending verification email to: user@example.com
✅ Verification email sent successfully to: user@example.com
📬 Resend response: { id: 'xxx', from: 'xxx', to: 'xxx' }
🔍 Email verification attempt with token: abc123def4...
✅ Email verified successfully for: user@example.com
```

### Failed Email (Registration Still Works):
```
📧 Attempting to send verification email to: user@example.com
📧 Sending verification email to: user@example.com
❌ Failed to send verification email to user@example.com: API key invalid
⚠️ Email sending failed but registration succeeded: API key invalid
```

---

## Troubleshooting

### Email Not Received?

1. **Check spam folder**
2. **Check Resend dashboard**: https://resend.com/emails
3. **Verify API key**: Check `.env` file
4. **Check console logs**: Look for error messages
5. **Check email address**: Must be valid format

### Verification Link Not Working?

1. **Check URL**: Should contain `?token=...`
2. **Check console logs**: Look for error messages
3. **Check database**: Verify token exists
4. **Check expiry**: Tokens expire after 24 hours

### Registration Fails?

1. **Check validation errors**: Read error message
2. **Check database connection**: Ensure PostgreSQL running
3. **Check console logs**: Look for error details

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Check database
psql -U postgres -d azora_stack

# View users
SELECT email, "emailVerified", status FROM "User";

# View verification tokens
SELECT email, "emailVerifyToken" FROM "User" WHERE "emailVerifyToken" IS NOT NULL;

# Manually verify user (for testing)
UPDATE "User" SET "emailVerified" = true, status = 'ACTIVE', "emailVerifyToken" = NULL WHERE email = 'test@example.com';
```

---

## Success Criteria

✅ Registration form validates input correctly  
✅ User created in database  
✅ Verification email sent successfully  
✅ Email received in inbox  
✅ Verification link works  
✅ User status updated to ACTIVE  
✅ Login works after verification  
✅ Error messages are clear and helpful  
✅ Console logs show detailed information  
✅ Registration succeeds even if email fails  

---

## Production Testing

Before deploying to production:

1. ✅ Test with production Resend API key
2. ✅ Test with production domain email
3. ✅ Test verification links with production URL
4. ✅ Check email deliverability
5. ✅ Monitor Resend dashboard for delivery status
6. ✅ Test from multiple email providers (Gmail, Outlook, etc.)
7. ✅ Check spam folder placement
8. ✅ Verify all error scenarios work

---

## Need Help?

- Check `EMAIL_VERIFICATION_SYSTEM_FIXED.md` for detailed documentation
- Check `REGISTER_ERROR_HANDLING_IMPROVED.md` for error handling details
- Check server console logs for debugging information
- Check Resend dashboard for email delivery status

---

**Happy Testing! 🎉**
