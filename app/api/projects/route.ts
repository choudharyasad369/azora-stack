import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response';
import { createProjectSchema } from '@/lib/validations';
import { PlatformSettingsService } from '@/services/platform-settings.service';
import { Decimal } from '@prisma/client/runtime/library';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');
}

// GET - List all projects (with filters)
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const slug = searchParams.get('slug') || '';
    const techStack = searchParams.get('techStack')?.split(',').filter(Boolean) || [];
    const difficulty = searchParams.get('difficulty') || '';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const sortBy = searchParams.get('sortBy') || 'createdAt';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'APPROVED',
    };

    // If slug is provided, search by slug
    if (slug) {
      where.slug = slug;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (techStack.length > 0) {
      where.techStack = {
        hasSome: techStack,
      };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    where.price = {
      gte: minPrice,
      lte: maxPrice,
    };

    // Build orderBy
    let orderBy: any = {};
    if (sortBy === 'popular') {
      orderBy = { salesCount: 'desc' };
    } else if (sortBy === 'price-low') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price-high') {
      orderBy = { price: 'desc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    // Fetch projects and total count
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return successResponse(
      { projects },
      undefined,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Create new project (Seller only)
export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['SELLER', 'ADMIN']);
    const body = await req.json();
    
    console.log('📝 Creating new project...');
    console.log('   User:', user.userId);
    console.log('   Title:', body.title);
    console.log('   Price:', body.price);
    console.log('   Tech Stack:', body.techStack);
    
    // Validate input
    const validation = createProjectSchema.safeParse(body);
    if (!validation.success) {
      console.error('❌ Validation failed:', validation.error.errors);
      return errorResponse('VALIDATION_ERROR', 'Invalid input', validation.error.errors);
    }

    const data = validation.data;

    // Generate slug
    const baseSlug = generateSlug(data.title);
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Get platform settings for listing fee and commission
    const listingFee = await PlatformSettingsService.getListingFee();
    const commissionRate = await PlatformSettingsService.getCommissionRate();

    // Create project
    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug,
        shortDescription: data.shortDescription,
        description: data.description,
        price: new Decimal(data.price),
        listingFee: new Decimal(listingFee),
        commissionRate: new Decimal(commissionRate),
        techStack: data.techStack,
        difficulty: data.difficulty,
        demoUrl: data.demoUrl || null,
        documentationUrl: data.documentationUrl || null,
        fileUrl: body.fileUrl, // From upload
        fileSize: body.fileSize,
        thumbnailUrl: body.thumbnailUrl,
        sellerId: user.userId,
        status: 'PENDING_REVIEW',
      },
    });

    return successResponse(
      { project },
      'Project submitted for review'
    );
  } catch (error) {
    return handleApiError(error);
  }
}