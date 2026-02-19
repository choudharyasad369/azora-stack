/**
 * Project Integration Tests
 * Tests project creation, fetching, and database operations
 */

import { prisma } from '@/lib/db';
import {
  createTestSeller,
  createTestProject,
  generateTestSlug,
} from '../helpers/test-utils';
import { Decimal } from '@prisma/client/runtime/library';

describe('Project Integration Tests', () => {
  describe('Create Project', () => {
    it('should create a new project by authenticated seller', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id, {
        title: 'E-commerce Platform',
        price: 10000,
        techStack: ['Next.js', 'TypeScript', 'Prisma'],
        difficulty: 'ADVANCED',
      });

      expect(project).toBeDefined();
      expect(project.title).toBe('E-commerce Platform');
      expect(Number(project.price)).toBe(10000);
      expect(project.sellerId).toBe(seller.id);
      expect(project.techStack).toEqual(['Next.js', 'TypeScript', 'Prisma']);
      expect(project.difficulty).toBe('ADVANCED');
    });

    it('should create project with default status APPROVED', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id);

      expect(project.status).toBe('APPROVED');
    });

    it('should create project with unique slug', async () => {
      const { user: seller } = await createTestSeller();

      const project1 = await createTestProject(seller.id);
      const project2 = await createTestProject(seller.id);

      expect(project1.slug).not.toBe(project2.slug);
    });

    it('should store project in database', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id, {
        title: 'Test Database Storage',
      });

      const foundProject = await prisma.project.findUnique({
        where: { id: project.id },
      });

      expect(foundProject).toBeDefined();
      expect(foundProject?.id).toBe(project.id);
      expect(foundProject?.title).toBe('Test Database Storage');
    });

    it('should initialize project counters to zero', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id);

      expect(project.viewCount).toBe(0);
      expect(project.downloadCount).toBe(0);
      expect(project.salesCount).toBe(0);
    });
  });

  describe('Fetch Marketplace Projects', () => {
    it('should fetch all approved projects', async () => {
      const { user: seller } = await createTestSeller();
      const testStartTime = new Date();

      await createTestProject(seller.id, { status: 'APPROVED', title: 'Project 1' });
      await createTestProject(seller.id, { status: 'APPROVED', title: 'Project 2' });
      await createTestProject(seller.id, { status: 'DRAFT', title: 'Project 3' });

      const approvedProjects = await prisma.project.findMany({
        where: { 
          status: 'APPROVED',
          createdAt: { gte: testStartTime }
        },
      });

      expect(approvedProjects.length).toBeGreaterThanOrEqual(2);
      expect(approvedProjects.every(p => p.status === 'APPROVED')).toBe(true);
    });

    it('should fetch projects with seller information', async () => {
      const { user: seller } = await createTestSeller({ name: 'John Seller' });

      const project = await createTestProject(seller.id);

      const projectWithSeller = await prisma.project.findUnique({
        where: { id: project.id },
        include: { seller: true },
      });

      expect(projectWithSeller).toBeDefined();
      expect(projectWithSeller?.seller.name).toBe('John Seller');
      expect(projectWithSeller?.seller.id).toBe(seller.id);
    });

    it('should filter projects by tech stack', async () => {
      const { user: seller } = await createTestSeller();
      const testStartTime = new Date();

      await createTestProject(seller.id, { techStack: ['React', 'Node.js'] });
      await createTestProject(seller.id, { techStack: ['Vue', 'Express'] });
      await createTestProject(seller.id, { techStack: ['React', 'Django'] });

      const reactProjects = await prisma.project.findMany({
        where: {
          techStack: {
            has: 'React',
          },
          createdAt: { gte: testStartTime }
        },
      });

      expect(reactProjects.length).toBeGreaterThanOrEqual(2);
      expect(reactProjects.every(p => p.techStack.includes('React'))).toBe(true);
    });

    it('should order projects by creation date', async () => {
      const { user: seller } = await createTestSeller();

      const project1 = await createTestProject(seller.id, { title: 'First' });
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const project2 = await createTestProject(seller.id, { title: 'Second' });
      await new Promise(resolve => setTimeout(resolve, 10));
      const project3 = await createTestProject(seller.id, { title: 'Third' });

      const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
      });

      expect(projects[0].title).toBe('Third');
      expect(projects[1].title).toBe('Second');
      expect(projects[2].title).toBe('First');
    });
  });

  describe('Fetch Single Project by Slug', () => {
    it('should fetch project by slug', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id, {
        title: 'Unique Project',
      });

      const foundProject = await prisma.project.findUnique({
        where: { slug: project.slug },
      });

      expect(foundProject).toBeDefined();
      expect(foundProject?.id).toBe(project.id);
      expect(foundProject?.title).toBe('Unique Project');
    });

    it('should return null for non-existent slug', async () => {
      const foundProject = await prisma.project.findUnique({
        where: { slug: 'non-existent-slug-12345' },
      });

      expect(foundProject).toBeNull();
    });

    it('should fetch project with all details', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id, {
        title: 'Full Details Project',
        description: 'Complete description',
        demoUrl: 'https://demo.example.com',
        documentationUrl: 'https://docs.example.com',
      });

      const foundProject = await prisma.project.findUnique({
        where: { slug: project.slug },
        include: { seller: true },
      });

      expect(foundProject).toBeDefined();
      expect(foundProject?.description).toBe('Complete description');
      expect(foundProject?.demoUrl).toBe('https://demo.example.com');
      expect(foundProject?.documentationUrl).toBe('https://docs.example.com');
      expect(foundProject?.seller).toBeDefined();
    });
  });

  describe('Project Status Management', () => {
    it('should create project with DRAFT status', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id, { status: 'DRAFT' });

      expect(project.status).toBe('DRAFT');
    });

    it('should create project with PENDING_REVIEW status', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id, { status: 'PENDING_REVIEW' });

      expect(project.status).toBe('PENDING_REVIEW');
    });

    it('should update project status', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id, { status: 'PENDING_REVIEW' });

      const updatedProject = await prisma.project.update({
        where: { id: project.id },
        data: { status: 'APPROVED' },
      });

      expect(updatedProject.status).toBe('APPROVED');
    });
  });

  describe('Project Pricing', () => {
    it('should store price as Decimal', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id, { price: 15000 });

      expect(project.price).toBeInstanceOf(Decimal);
      expect(Number(project.price)).toBe(15000);
    });

    it('should store commission rate', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id, {
        price: 10000,
        commissionRate: 15,
      });

      expect(Number(project.commissionRate)).toBe(15);
    });
  });

  describe('Project File Information', () => {
    it('should store file URL and size', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id, {
        fileUrl: 'https://storage.example.com/project.zip',
        fileSize: 52428800, // 50MB
      });

      expect(project.fileUrl).toBe('https://storage.example.com/project.zip');
      expect(Number(project.fileSize)).toBe(52428800);
    });

    it('should store thumbnail URL', async () => {
      const { user: seller } = await createTestSeller();

      const project = await createTestProject(seller.id, {
        thumbnailUrl: 'https://cdn.example.com/thumb.jpg',
      });

      expect(project.thumbnailUrl).toBe('https://cdn.example.com/thumb.jpg');
    });
  });
});
