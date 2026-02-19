/**
 * Authentication Integration Tests
 * Tests user registration, login, and JWT token generation
 */

import { prisma } from '@/lib/db';
import { createToken, verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import {
  createTestUser,
  generateTestEmail,
} from '../helpers/test-utils';

describe('Authentication Integration Tests', () => {
  describe('User Registration', () => {
    it('should create a new user with hashed password', async () => {
      const email = generateTestEmail();
      const password = 'SecurePass123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Test User',
          role: 'BUYER',
          status: 'PENDING_VERIFICATION',
          emailVerified: false,
        },
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.role).toBe('BUYER');
      expect(user.status).toBe('PENDING_VERIFICATION');
      expect(user.emailVerified).toBe(false);

      // Verify password is hashed
      expect(user.password).not.toBe(password);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should not allow duplicate email registration', async () => {
      const email = generateTestEmail();
      const password = 'SecurePass123!';
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create first user
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Test User 1',
          role: 'BUYER',
        },
      });

      // Try to create duplicate
      await expect(
        prisma.user.create({
          data: {
            email, // Same email
            password: hashedPassword,
            name: 'Test User 2',
            role: 'BUYER',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('User Login', () => {
    it('should verify correct password', async () => {
      const { user, password } = await createTestUser('BUYER');

      const isPasswordValid = await bcrypt.compare(password, user.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const { user } = await createTestUser('BUYER');

      const isPasswordValid = await bcrypt.compare('WrongPassword123!', user.password);
      expect(isPasswordValid).toBe(false);
    });

    it('should find user by email', async () => {
      const { user, email } = await createTestUser('BUYER');

      const foundUser = await prisma.user.findUnique({
        where: { email },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(user.id);
      expect(foundUser?.email).toBe(email);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token', async () => {
      const { user } = await createTestUser('BUYER');

      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should verify and decode JWT token', async () => {
      const { user } = await createTestUser('SELLER');

      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const payload = await verifyToken(token);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(user.id);
      expect(payload?.email).toBe(user.email);
      expect(payload?.role).toBe('SELLER');
    });

    it('should reject invalid JWT token', async () => {
      const invalidToken = 'invalid.token.here';

      const payload = await verifyToken(invalidToken);

      expect(payload).toBeNull();
    });

    it('should include expiration in token', async () => {
      const { user } = await createTestUser('ADMIN');

      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const payload = await verifyToken(token);

      expect(payload).toBeDefined();
      expect(payload?.exp).toBeDefined();
      expect(payload?.iat).toBeDefined();
      expect(payload!.exp! > payload!.iat!).toBe(true);
    });
  });

  describe('User Roles', () => {
    it('should create user with BUYER role', async () => {
      const { user } = await createTestUser('BUYER');

      expect(user.role).toBe('BUYER');
    });

    it('should create user with SELLER role', async () => {
      const { user } = await createTestUser('SELLER');

      expect(user.role).toBe('SELLER');
    });

    it('should create user with ADMIN role', async () => {
      const { user } = await createTestUser('ADMIN');

      expect(user.role).toBe('ADMIN');
    });
  });

  describe('User Status', () => {
    it('should set user status to ACTIVE', async () => {
      const { user } = await createTestUser('BUYER', { status: 'ACTIVE' });

      expect(user.status).toBe('ACTIVE');
    });

    it('should set user status to PENDING_VERIFICATION', async () => {
      const email = generateTestEmail();
      const hashedPassword = await bcrypt.hash('Test123!', 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Pending User',
          role: 'BUYER',
          status: 'PENDING_VERIFICATION',
          emailVerified: false,
        },
      });

      expect(user.status).toBe('PENDING_VERIFICATION');
      expect(user.emailVerified).toBe(false);
    });
  });
});
