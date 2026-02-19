/**
 * Jest Test Setup
 * Runs before all tests
 */

import { prisma } from '@/lib/db';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// Global test timeout
jest.setTimeout(30000);

// Only disconnect database after all tests
// No cleanup needed - tests use unique data with timestamps
afterAll(async () => {
  await prisma.$disconnect();
});

// Export for use in tests
export { prisma };
