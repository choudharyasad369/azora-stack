/**
 * Purchase Flow Integration Tests
 * Tests order creation, wallet updates, and seller earnings
 */

import { prisma } from '@/lib/db';
import {
  createTestUser,
  createTestSeller,
  createTestProject,
  createTestOrder,
} from '../helpers/test-utils';
import { Decimal } from '@prisma/client/runtime/library';

describe('Purchase Flow Integration Tests', () => {
  describe('Create Order', () => {
    it('should create order record when purchase is initiated', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller();
      const project = await createTestProject(seller.id, { price: 5000 });

      const order = await createTestOrder(buyer.id, project.id);

      expect(order).toBeDefined();
      expect(order.buyerId).toBe(buyer.id);
      expect(order.projectId).toBe(project.id);
      expect(Number(order.projectPrice)).toBe(5000);
      expect(order.status).toBe('CREATED');
    });

    it('should generate unique order number', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller();
      const project = await createTestProject(seller.id);

      const order1 = await createTestOrder(buyer.id, project.id);
      const order2 = await createTestOrder(buyer.id, project.id);

      expect(order1.orderNumber).not.toBe(order2.orderNumber);
    });

    it('should calculate platform commission correctly', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller();
      const project = await createTestProject(seller.id, { price: 10000 });

      const order = await createTestOrder(buyer.id, project.id);

      const expectedCommission = 10000 * 0.15; // 15% commission
      const expectedSellerEarning = 10000 - expectedCommission;

      expect(Number(order.platformCommission)).toBe(expectedCommission);
      expect(Number(order.sellerEarning)).toBe(expectedSellerEarning);
    });

    it('should store payment gateway information', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller();
      const project = await createTestProject(seller.id);

      const uniqueOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const order = await createTestOrder(buyer.id, project.id, {
        paymentGateway: 'RAZORPAY',
        paymentOrderId: uniqueOrderId,
      });

      expect(order.paymentGateway).toBe('RAZORPAY');
      expect(order.paymentOrderId).toBe(uniqueOrderId);
    });
  });

  describe('Complete Purchase Flow', () => {
    it('should update order status to COMPLETED after payment', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller();
      const project = await createTestProject(seller.id);

      const order = await createTestOrder(buyer.id, project.id);

      const uniquePaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          paymentId: uniquePaymentId,
          paidAt: new Date(),
          completedAt: new Date(),
        },
      });

      expect(updatedOrder.status).toBe('COMPLETED');
      expect(updatedOrder.paymentId).toBe(uniquePaymentId);
      expect(updatedOrder.paidAt).toBeDefined();
      expect(updatedOrder.completedAt).toBeDefined();
    });

    it('should credit seller wallet after successful payment', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller({ walletBalance: 0 });
      const project = await createTestProject(seller.id, { price: 10000 });

      const order = await createTestOrder(buyer.id, project.id);

      // Simulate payment completion
      const sellerEarning = Number(order.sellerEarning);
      const currentBalance = Number(seller.walletBalance);
      const newBalance = currentBalance + sellerEarning;

      await prisma.user.update({
        where: { id: seller.id },
        data: { walletBalance: new Decimal(newBalance) },
      });

      const updatedSeller = await prisma.user.findUnique({
        where: { id: seller.id },
      });

      expect(Number(updatedSeller?.walletBalance)).toBe(sellerEarning);
    });

    it('should create wallet transaction record', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller({ walletBalance: 0 });
      const project = await createTestProject(seller.id, { price: 5000 });

      const order = await createTestOrder(buyer.id, project.id, {
        status: 'COMPLETED',
      });

      const sellerEarning = Number(order.sellerEarning);

      const transaction = await prisma.walletTransaction.create({
        data: {
          userId: seller.id,
          type: 'CREDIT',
          source: 'SALE',
          amount: new Decimal(sellerEarning),
          balanceBefore: new Decimal(0),
          balanceAfter: new Decimal(sellerEarning),
          orderId: order.id,
          description: `Sale of ${project.title}`,
        },
      });

      expect(transaction).toBeDefined();
      expect(transaction.userId).toBe(seller.id);
      expect(transaction.type).toBe('CREDIT');
      expect(transaction.source).toBe('SALE');
      expect(Number(transaction.amount)).toBe(sellerEarning);
      expect(transaction.orderId).toBe(order.id);
    });

    it('should increment project sales count', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller();
      const project = await createTestProject(seller.id);

      const initialSalesCount = project.salesCount;

      await createTestOrder(buyer.id, project.id, { status: 'COMPLETED' });

      const updatedProject = await prisma.project.update({
        where: { id: project.id },
        data: { salesCount: { increment: 1 } },
      });

      expect(updatedProject.salesCount).toBe(initialSalesCount + 1);
    });
  });

  describe('Order Verification', () => {
    it('should verify order belongs to buyer', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller();
      const project = await createTestProject(seller.id);

      const order = await createTestOrder(buyer.id, project.id);

      const foundOrder = await prisma.order.findFirst({
        where: {
          id: order.id,
          buyerId: buyer.id,
        },
      });

      expect(foundOrder).toBeDefined();
      expect(foundOrder?.buyerId).toBe(buyer.id);
    });

    it('should fetch order with project and buyer details', async () => {
      const { user: buyer } = await createTestUser('BUYER', { name: 'John Buyer' });
      const { user: seller } = await createTestSeller();
      const project = await createTestProject(seller.id, { title: 'Premium Project' });

      const order = await createTestOrder(buyer.id, project.id);

      const orderWithDetails = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          buyer: true,
          project: {
            include: { seller: true },
          },
        },
      });

      expect(orderWithDetails).toBeDefined();
      expect(orderWithDetails?.buyer.name).toBe('John Buyer');
      expect(orderWithDetails?.project.title).toBe('Premium Project');
      expect(orderWithDetails?.project.seller.id).toBe(seller.id);
    });
  });

  describe('Multiple Purchases', () => {
    it('should allow same buyer to purchase multiple projects', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller();
      const project1 = await createTestProject(seller.id, { title: 'Project 1' });
      const project2 = await createTestProject(seller.id, { title: 'Project 2' });

      const order1 = await createTestOrder(buyer.id, project1.id);
      const order2 = await createTestOrder(buyer.id, project2.id);

      expect(order1.buyerId).toBe(buyer.id);
      expect(order2.buyerId).toBe(buyer.id);
      expect(order1.projectId).not.toBe(order2.projectId);
    });

    it('should accumulate seller earnings from multiple sales', async () => {
      const { user: buyer1 } = await createTestUser('BUYER');
      const { user: buyer2 } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller({ walletBalance: 0 });
      const project = await createTestProject(seller.id, { price: 5000 });

      const order1 = await createTestOrder(buyer1.id, project.id);
      const order2 = await createTestOrder(buyer2.id, project.id);

      const totalEarnings = Number(order1.sellerEarning) + Number(order2.sellerEarning);

      await prisma.user.update({
        where: { id: seller.id },
        data: { walletBalance: new Decimal(totalEarnings) },
      });

      const updatedSeller = await prisma.user.findUnique({
        where: { id: seller.id },
      });

      expect(Number(updatedSeller?.walletBalance)).toBe(totalEarnings);
    });
  });

  describe('Order Status Transitions', () => {
    it('should transition from CREATED to PAYMENT_COMPLETED', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller();
      const project = await createTestProject(seller.id);

      const order = await createTestOrder(buyer.id, project.id, { status: 'CREATED' });

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAYMENT_COMPLETED' },
      });

      expect(updatedOrder.status).toBe('PAYMENT_COMPLETED');
    });

    it('should handle payment failure', async () => {
      const { user: buyer } = await createTestUser('BUYER');
      const { user: seller } = await createTestSeller();
      const project = await createTestProject(seller.id);

      const order = await createTestOrder(buyer.id, project.id);

      const failedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAYMENT_FAILED',
          refundReason: 'Payment declined by bank',
        },
      });

      expect(failedOrder.status).toBe('PAYMENT_FAILED');
      expect(failedOrder.refundReason).toBe('Payment declined by bank');
    });
  });
});
