# 📡 Azora Stack - API Documentation

Complete API reference for Azora Stack marketplace platform.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require authentication via JWT token stored in HTTP-only cookie.

### Headers

```
Content-Type: application/json
Cookie: auth_token=<jwt_token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| VALIDATION_ERROR | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| SERVER_ERROR | 500 | Internal server error |

---

## Authentication Endpoints

### Register

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "BUYER" // or "SELLER"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "BUYER"
    },
    "message": "Please check your email to verify your account"
  },
  "message": "Registration successful"
}
```

### Login

Authenticate and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "BUYER",
      "avatar": "https://..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### Logout

Clear authentication cookie.

**Endpoint:** `POST /api/auth/logout`

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Logged out successfully"
}
```

### Verify Email

Verify user email address.

**Endpoint:** `GET /api/auth/verify-email?token=xxxxx`

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com"
  },
  "message": "Email verified successfully"
}
```

### Forgot Password

Request password reset.

**Endpoint:** `POST /api/auth/forgot-password`

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Password reset link sent to your email"
}
```

### Reset Password

Reset password with token.

**Endpoint:** `POST /api/auth/reset-password`

**Body:**
```json
{
  "token": "xxxxx",
  "password": "NewSecurePass123!"
}
```

---

## Project Endpoints

### List Projects

Get paginated list of projects with filters.

**Endpoint:** `GET /api/projects`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 12)
- `search` (string): Search in title/description
- `techStack` (array): Filter by technologies
- `difficulty` (enum): BEGINNER, INTERMEDIATE, ADVANCED
- `minPrice` (number)
- `maxPrice` (number)

**Example:**
```
GET /api/projects?page=1&limit=12&techStack=React&difficulty=BEGINNER
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "clx...",
        "title": "E-commerce Starter",
        "slug": "e-commerce-starter",
        "shortDescription": "Complete e-commerce solution",
        "description": "Full description...",
        "price": "4999.00",
        "thumbnailUrl": "https://...",
        "techStack": ["React", "Node.js", "MongoDB"],
        "difficulty": "INTERMEDIATE",
        "salesCount": 45,
        "seller": {
          "id": "clx...",
          "name": "John Seller",
          "avatar": "https://..."
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 120,
    "totalPages": 10
  }
}
```

### Get Project Details

Get single project with full details.

**Endpoint:** `GET /api/projects/[id]`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "title": "E-commerce Starter",
    "description": "Complete description...",
    "price": "4999.00",
    "thumbnailUrl": "https://...",
    "techStack": ["React", "Node.js"],
    "difficulty": "INTERMEDIATE",
    "demoUrl": "https://demo.example.com",
    "documentationUrl": "https://docs.example.com",
    "salesCount": 45,
    "viewCount": 1250,
    "seller": {
      "id": "clx...",
      "name": "John Seller",
      "bio": "Full-stack developer...",
      "avatar": "https://..."
    }
  }
}
```

### Create Project (Seller)

Upload a new project.

**Endpoint:** `POST /api/projects`

**Auth:** Required (SELLER role)

**Body:**
```json
{
  "title": "My Awesome Project",
  "shortDescription": "Brief description",
  "description": "Full detailed description",
  "price": 2999,
  "techStack": ["React", "TypeScript"],
  "difficulty": "INTERMEDIATE",
  "demoUrl": "https://demo.example.com",
  "documentationUrl": "https://docs.example.com",
  "fileUrl": "s3://path/to/file.zip",
  "thumbnailUrl": "https://cloudinary.com/..."
}
```

### Update Project (Seller)

Update existing project.

**Endpoint:** `PUT /api/projects/[id]`

**Auth:** Required (SELLER role, own project only)

**Body:** Same as Create (all fields optional)

### Delete Project (Seller)

Delete a project.

**Endpoint:** `DELETE /api/projects/[id]`

**Auth:** Required (SELLER role, own project only)

---

## Payment Endpoints

### Create Order

Create a Razorpay order for project purchase.

**Endpoint:** `POST /api/payments/create-order`

**Auth:** Required

**Body:**
```json
{
  "projectId": "clx..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "clx...",
    "amount": 299900, // in paise
    "currency": "INR",
    "orderNumber": "AZR-12345678-1234",
    "keyId": "rzp_test_xxxxx"
  }
}
```

### Verify Payment

Verify Razorpay payment signature.

**Endpoint:** `POST /api/payments/verify`

**Auth:** Required

**Body:**
```json
{
  "orderId": "clx...",
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "clx...",
    "paymentId": "pay_xxxxx"
  },
  "message": "Payment verified successfully"
}
```

### Payment Webhook

Handle Razorpay webhooks.

**Endpoint:** `POST /api/payments/webhook`

**Headers:**
```
X-Razorpay-Signature: signature
```

---

## Wallet Endpoints

### Get Balance

Get current wallet balance.

**Endpoint:** `GET /api/wallet/balance`

**Auth:** Required (SELLER role)

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 15750.50,
    "currency": "INR"
  }
}
```

### Get Transactions

Get wallet transaction history.

**Endpoint:** `GET /api/wallet/transactions`

**Auth:** Required (SELLER role)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "clx...",
        "type": "CREDIT",
        "source": "SALE",
        "amount": "1499.50",
        "balanceBefore": "14251.00",
        "balanceAfter": "15750.50",
        "description": "Sale of E-commerce Starter",
        "createdAt": "2024-01-20T14:30:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## Withdrawal Endpoints

### Create Withdrawal Request

Request withdrawal of wallet balance.

**Endpoint:** `POST /api/withdrawals`

**Auth:** Required (SELLER role)

**Body:**
```json
{
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "withdrawalNumber": "WD-12345678-123"
  },
  "message": "Withdrawal request submitted"
}
```

### Get Withdrawals

List all withdrawal requests.

**Endpoint:** `GET /api/withdrawals`

**Auth:** Required (SELLER role)

**Query Parameters:**
- `page` (number)
- `limit` (number)

**Response:**
```json
{
  "success": true,
  "data": {
    "withdrawals": [
      {
        "id": "clx...",
        "withdrawalNumber": "WD-12345678-123",
        "amount": "5000.00",
        "status": "PENDING",
        "requestedAt": "2024-01-20T10:00:00Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

## Admin Endpoints

All admin endpoints require ADMIN role.

### Get Analytics

Get dashboard analytics.

**Endpoint:** `GET /api/admin/analytics`

**Auth:** Required (ADMIN role)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalProjects": 450,
    "totalOrders": 3400,
    "platformRevenue": 245000.50,
    "pendingWithdrawals": 15,
    "topSellers": [
      {
        "id": "clx...",
        "name": "Top Seller",
        "totalSales": 125000,
        "projectCount": 25
      }
    ],
    "revenueChart": [
      { "date": "2024-01-01", "revenue": 12500 }
    ]
  }
}
```

### Approve/Reject Project

Review project submission.

**Endpoint:** `PUT /api/admin/projects/[id]/approve`
**Endpoint:** `PUT /api/admin/projects/[id]/reject`

**Auth:** Required (ADMIN role)

**Body (for reject):**
```json
{
  "rejectionReason": "Description not detailed enough"
}
```

### Suspend User

Suspend user account.

**Endpoint:** `PUT /api/admin/users/[id]/suspend`

**Auth:** Required (ADMIN role)

**Body:**
```json
{
  "reason": "Violation of terms of service"
}
```

### Review Withdrawal

Approve/reject withdrawal request.

**Endpoint:** `PUT /api/admin/withdrawals/[id]/review`

**Auth:** Required (ADMIN role)

**Body:**
```json
{
  "status": "APPROVED", // or "REJECTED"
  "reviewNotes": "Optional notes"
}
```

### Complete Withdrawal

Mark withdrawal as completed.

**Endpoint:** `PUT /api/admin/withdrawals/[id]/complete`

**Auth:** Required (ADMIN role)

**Body:**
```json
{
  "transactionId": "TXN123456",
  "paymentProof": "https://..."
}
```

### Update Platform Settings

Modify platform configuration.

**Endpoint:** `PUT /api/admin/settings`

**Auth:** Required (ADMIN role)

**Body:**
```json
{
  "key": "commission_percentage",
  "value": "45"
}
```

---

## Rate Limiting

- Auth endpoints: 5 requests per minute
- API endpoints: 100 requests per minute
- Admin endpoints: 200 requests per minute

## Webhooks

### Razorpay Webhook

**URL:** `/api/payments/webhook`

**Events Handled:**
- `payment.captured`: Payment successful
- `payment.failed`: Payment failed
- `payment.refunded`: Refund processed

---

## Best Practices

1. **Always handle errors**: Check `success` field in response
2. **Use pagination**: Don't fetch all data at once
3. **Implement retries**: For network failures
4. **Cache responses**: When appropriate
5. **Validate input**: Before sending requests
6. **Handle webhooks**: Implement idempotency
7. **Secure API keys**: Never expose in client code

## SDKs & Libraries

For Razorpay integration:
```bash
npm install razorpay
```

For file uploads:
```bash
npm install @aws-sdk/client-s3
```

---

For questions or issues, contact support@azorastack.com
