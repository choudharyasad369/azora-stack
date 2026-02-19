import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await requireRole(['ADMIN']);
    
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query filters
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        phone: true,
        walletBalance: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            projects: true,
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get user statistics
    const stats = {
      total: await prisma.user.count(),
      buyers: await prisma.user.count({ where: { role: 'BUYER' } }),
      sellers: await prisma.user.count({ where: { role: 'SELLER' } }),
      admins: await prisma.user.count({ where: { role: 'ADMIN' } }),
      active: await prisma.user.count({ where: { status: 'ACTIVE' } }),
      pending: await prisma.user.count({ where: { status: 'PENDING_VERIFICATION' } }),
    };

    return NextResponse.json({
      success: true,
      data: {
        users,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Failed to fetch users',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
