# Test Email Delivery - Quick Guide

**Use this guide to test email delivery right now**

---

## 🎯 Quick Test Options

### Option 1: Test with Your Registered Email ✅

**Your Resend registered email**: `choudharyasad369@gmail.com`

**Steps**:
1. Go to: http://localhost:3000/register
2. Register with email: `choudharyasad369@gmail.com`
3. Check your Gmail inbox
4. You should receive the verification email!

**Why this works**: Resend allows sending to your own registered email in testing mode.

---

### Option 2: Use Test Email Endpoint 🧪

**Test with cURL**:
```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"choudharyasad369@gmail.com"}'
```

**Test with Postman**:
```
POST http://localhost:3000/api/test-email
Content-Type: application/json

{
  "email": "choudharyasad369@gmail.com"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Test email sent successfully!",
  "emailId": "abc123...",
  "dashboardUrl": "https://resend.com/emails/abc123...",
  "config": {
    "hasApiKey": true,
    "fromEmail": "onboarding@resend.dev",
    "to": "choudharyasad369@gmail.com"
  }
}
```

---

### Option 3: Test with Different Email (Will Show Error) ❌

**This will fail but shows proper error handling**:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com"}'
```

**Expected Response**:
```json
{
  "success": false,
  "message": "Failed to send test email",
  "error": {
    "statusCode": 403,
    "name": "validation_error",
    "message": "You can only send testing emails to your own email address..."
  }
}
```

---

## 📊 Check Server Logs

After testing, check your server console for detailed logs:

### Successful Email:
```
📧 Attempting to send verification email...
   To: choudharyasad369@gmail.com
   From: onboarding@resend.dev
   Name: Test User

📬 Resend API Response: {
  "data": {
    "id": "abc123..."
  },
  "error": null
}

✅ Verification email sent successfully!
   Email ID: abc123...
   Check Resend dashboard: https://resend.com/emails/abc123...
```

### Failed Email (Different Address):
```
📧 Attempting to send verification email...
   To: test@gmail.com
   From: onboarding@resend.dev

📬 Resend API Response: {
  "data": null,
  "error": {
    "statusCode": 403,
    "name": "validation_error",
    "message": "You can only send testing emails to your own email address..."
  }
}

🚨 RESEND DOMAIN VERIFICATION REQUIRED 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You can only send emails to your own email address in testing mode.
...
```

---

## 🎯 What to Expect

### ✅ Working Scenario:
- Email to: `choudharyasad369@gmail.com`
- Result: Email delivered to Gmail inbox
- Logs: Success with email ID
- Resend Dashboard: Shows email as "Delivered"

### ❌ Restricted Scenario:
- Email to: Any other email
- Result: 403 error, no email sent
- Logs: Error with domain verification message
- Resend Dashboard: No email record

---

## 🚀 To Enable All Emails

**Verify your domain**:
1. Go to: https://resend.com/domains
2. Add your domain
3. Add DNS records
4. Wait for verification
5. Update `.env`:
   ```env
   RESEND_FROM_EMAIL="noreply@yourdomain.com"
   ```

---

## 🔍 Check Resend Dashboard

**View all emails**:
- https://resend.com/emails

**Check specific email**:
- https://resend.com/emails/[EMAIL_ID]

**View domains**:
- https://resend.com/domains

---

## ✅ Quick Checklist

- [ ] Server running: `npm run dev`
- [ ] Test with registered email: `choudharyasad369@gmail.com`
- [ ] Check Gmail inbox
- [ ] Check server console logs
- [ ] Check Resend dashboard
- [ ] Try test endpoint with cURL/Postman

---

**Ready to test? Start with Option 1!** 🚀
