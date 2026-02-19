# AzoraStack Integration Tests

Comprehensive integration test suite for validating core business flows before production launch.

## 📁 Test Structure

```
tests/
├── setup.ts                    # Jest configuration and global setup
├── helpers/
│   └── test-utils.ts          # Test utilities and helper functions
└── integration/
    ├── auth.test.ts           # Authentication tests
    ├── projects.test.ts       # Project management tests
    ├── purchase.test.ts       # Purchase flow tests
    ├── wallet.test.ts         # Wallet and transaction tests
    └── admin.test.ts          # Admin operations tests
```

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run with Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- auth.test.ts
npm test -- projects.test.ts
npm test -- purchase.test.ts
npm test -- wallet.test.ts
npm test -- admin.test.ts
```

## 📋 Test Coverage

### Authentication Tests (auth.test.ts)
- ✅ User registration with password hashing
- ✅ Duplicate email prevention
- ✅ User login and password verification
- ✅ JWT token generation and validation
- ✅ Token expiration handling
- ✅ Role-based user creation (BUYER, SELLER, ADMIN)
- ✅ User status management

**Total Tests**: 11

### Project Tests (projects.test.ts)
- ✅ Project creation by authenticated seller
- ✅ Unique slug generation
- ✅ Project storage in database
- ✅ Fetch all approved projects
- ✅ Fetch projects with seller information
- ✅ Filter projects by tech stack
- ✅ Order projects by creation date
- ✅ Fetch single project by slug
- ✅ Project status management (DRAFT, PENDING_REVIEW, APPROVED)
- ✅ Project pricing and commission rates
- ✅ File URL and size storage

**Total Tests**: 15

### Purchase Tests (purchase.test.ts)
- ✅ Order record creation
- ✅ Unique order number generation
- ✅ Platform commission calculation (15%)
- ✅ Payment gateway information storage
- ✅ Order status updates (CREATED → COMPLETED)
- ✅ Seller wallet credit after payment
- ✅ Wallet transaction record creation
- ✅ Project sales count increment
- ✅ Order verification and ownership
- ✅ Multiple purchases by same buyer
- ✅ Seller earnings accumulation
- ✅ Order status transitions
- ✅ Payment failure handling

**Total Tests**: 16

### Wallet Tests (wallet.test.ts)
- ✅ Wallet balance initialization
- ✅ Get current wallet balance
- ✅ Update wallet balance
- ✅ Decimal balance handling
- ✅ Credit transaction creation
- ✅ Debit transaction creation
- ✅ Transaction history fetching
- ✅ Balance tracking (before/after)
- ✅ Withdrawal request creation
- ✅ Bank details snapshot storage
- ✅ Wallet deduction on withdrawal
- ✅ Fetch pending withdrawals
- ✅ Withdrawal status updates (COMPLETED, REJECTED)
- ✅ Sufficient balance verification
- ✅ Bank details validation

**Total Tests**: 15

### Admin Tests (admin.test.ts)
- ✅ Fetch all users
- ✅ Filter users by role
- ✅ Filter users by status
- ✅ User statistics calculation
- ✅ User with project count
- ✅ Search users by name/email
- ✅ Fetch all withdrawal requests
- ✅ Filter withdrawals by status
- ✅ Approve withdrawal request
- ✅ Reject withdrawal request
- ✅ Complete withdrawal with transaction ID
- ✅ Fetch withdrawal with seller details
- ✅ Withdrawal statistics
- ✅ Admin role verification

**Total Tests**: 14

## 📊 Total Test Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Authentication | 11 | ✅ |
| Projects | 15 | ✅ |
| Purchase Flow | 16 | ✅ |
| Wallet | 15 | ✅ |
| Admin | 14 | ✅ |
| **TOTAL** | **71** | **✅** |

## 🛠️ Test Utilities

### Helper Functions

#### User Creation
```typescript
createTestUser(role, overrides)      // Create test user
createTestSeller(overrides)          // Create test seller with bank details
createTestAdmin(overrides)           // Create test admin
```

#### Project Creation
```typescript
createTestProject(sellerId, overrides)  // Create test project
```

#### Order Creation
```typescript
createTestOrder(buyerId, projectId, overrides)  // Create test order
```

#### Authentication
```typescript
generateAuthToken(userId, email, role)  // Generate JWT token
createAuthHeaders(token)                // Create auth headers
```

#### Utilities
```typescript
generateTestEmail()      // Generate unique test email
generateTestSlug()       // Generate unique test slug
cleanupTestData()        // Clean up test data after tests
```

## 🔧 Configuration

### Environment Variables
Tests use the following environment variables:
```env
NODE_ENV=test
JWT_SECRET=test-jwt-secret-key-for-testing-only
DATABASE_URL=your_test_database_url
TEST_DATABASE_URL=your_test_database_url  # Optional override
```

### Jest Configuration
- **Test Environment**: Node.js
- **Test Timeout**: 30 seconds
- **Setup File**: `tests/setup.ts`
- **Test Pattern**: `tests/**/*.test.ts`

## ✅ Test Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: Test data is cleaned up after each test using `afterEach`
3. **Real Data**: Tests use actual database operations, not mocks
4. **Descriptive Names**: Test names clearly describe what is being tested
5. **Assertions**: Multiple assertions verify expected behavior
6. **Edge Cases**: Tests cover both success and failure scenarios

## 🚨 Important Notes

### Database
- Tests run against a real database (use a separate test database)
- All test data uses `@test.com` email domain for easy cleanup
- Foreign key constraints are respected during cleanup

### No Mocks
- Tests use real Prisma client
- Tests use real JWT token generation
- Tests use real bcrypt password hashing
- This ensures tests validate actual business logic

### Test Data
- All test users have `@test.com` in their email
- All test projects have `test-project-` prefix in slug
- All test orders have `TEST-` prefix in order number
- This makes cleanup safe and reliable

## 📝 Adding New Tests

### 1. Create Test File
```typescript
// tests/integration/feature.test.ts
import { prisma } from '@/lib/db';
import { createTestUser, cleanupTestData } from '../helpers/test-utils';

describe('Feature Tests', () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  it('should test feature', async () => {
    // Test implementation
  });
});
```

### 2. Add Test Utilities (if needed)
```typescript
// tests/helpers/test-utils.ts
export async function createTestFeature() {
  // Implementation
}
```

### 3. Run Tests
```bash
npm test -- feature.test.ts
```

## 🎯 Success Criteria

✅ All 71 tests pass  
✅ No modifications to production code  
✅ Tests validate real business logic  
✅ Database operations work correctly  
✅ Authentication flows validated  
✅ Payment calculations accurate  
✅ Wallet transactions correct  
✅ Admin operations functional  

## 📞 Support

For questions or issues with tests:
1. Check test output for specific error messages
2. Verify database connection
3. Ensure all environment variables are set
4. Review test utilities for proper usage

---

**Last Updated**: February 18, 2026  
**Test Suite Version**: 1.0.0  
**Status**: ✅ Production Ready
