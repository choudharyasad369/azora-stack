# Install Testing Dependencies

## Quick Setup

Run this command to install all required testing dependencies:

```bash
npm install --save-dev jest @types/jest ts-jest @testing-library/jest-dom jest-environment-node
```

## What Gets Installed

- **jest**: Testing framework
- **@types/jest**: TypeScript types for Jest
- **ts-jest**: TypeScript preprocessor for Jest
- **@testing-library/jest-dom**: Custom Jest matchers
- **jest-environment-node**: Node.js test environment

## Verify Installation

After installation, run:

```bash
npm test
```

Expected output:
```
PASS  tests/integration/auth.test.ts
PASS  tests/integration/projects.test.ts
PASS  tests/integration/purchase.test.ts
PASS  tests/integration/wallet.test.ts
PASS  tests/integration/admin.test.ts

Test Suites: 5 passed, 5 total
Tests:       71 passed, 71 total
```

## Alternative: Manual Installation

If you prefer to install one by one:

```bash
npm install --save-dev jest
npm install --save-dev @types/jest
npm install --save-dev ts-jest
npm install --save-dev @testing-library/jest-dom
npm install --save-dev jest-environment-node
```

## Troubleshooting

### Issue: "Cannot find module 'jest'"
**Solution**: Run `npm install --save-dev jest`

### Issue: TypeScript errors in tests
**Solution**: Run `npm install --save-dev @types/jest ts-jest`

### Issue: Tests timeout
**Solution**: Increase timeout in `jest.config.js` or individual tests

### Issue: Database connection errors
**Solution**: Verify `DATABASE_URL` in `.env` file

## Next Steps

After installation:

1. Run tests: `npm test`
2. Run with coverage: `npm run test:coverage`
3. Run in watch mode: `npm run test:watch`

---

**Note**: All test files are already created. You only need to install dependencies!
