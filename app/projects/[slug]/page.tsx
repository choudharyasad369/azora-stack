'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { 
  Star, 
  Download, 
  Eye, 
  ShoppingCart,
  CheckCircle2,
  Globe,
  FileText,
  Code2,
  Shield,
  Zap,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  thumbnailUrl: string;
  fileSize: number;
  techStack: string[];
  difficulty: string;
  demoUrl: string | null;
  documentationUrl: string | null;
  status: string;
  viewCount: number;
  salesCount: number;
  publishedAt: string | null;
  seller: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    bio: string | null;
  };
}

export default function ProjectDetailsPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProject();
  }, [params.slug]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects?slug=${params.slug}`);
      const data = await response.json();

      if (data.success && data.data.projects.length > 0) {
        setProject(data.data.projects[0]);
      } else {
        toast({
          title: "Error",
          description: "Project not found",
          variant: "destructive",
        });
        router.push('/projects');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    
    try {
      // Create purchase request
      const response = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId: project!.id,
          message: 'I would like to purchase this project'
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success!",
          description: `Purchase request submitted! Admin will contact you at your registered email with payment details.`,
          variant: "success",
        });
        router.push('/dashboard/buyer');
      } else {
        toast({
          title: "Error",
          description: data.message || 'Failed to submit purchase request',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: 'Purchase request failed. Please try again.',
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/projects">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
            >
              {/* Project Image */}
              <div className="relative h-96 bg-gradient-to-br from-purple-100 to-blue-100">
                <img
                  src={project.thumbnailUrl}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Project Info */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                    <p className="text-lg text-gray-600">{project.shortDescription}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                    <Star className="h-5 w-5 text-purple-600 fill-current" />
                    <span className="font-semibold text-purple-700">New</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Download className="h-5 w-5" />
                    <span>{project.salesCount} sales</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="h-5 w-5" />
                    <span>{project.viewCount} views</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Code2 className="h-5 w-5" />
                    <span className="font-medium">{project.difficulty}</span>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-4">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack && Array.isArray(project.techStack) && project.techStack.map(tech => (
                      <span
                        key={tech}
                        className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="font-semibold text-lg mb-4">Description</h3>
                  <div className="prose max-w-none whitespace-pre-wrap">
                    {project.description}
                  </div>
                </div>

                {/* Links */}
                <div className="flex gap-4">
                  {project.demoUrl && (
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        <Globe className="h-4 w-4 mr-2" />
                        Live Demo
                      </Button>
                    </a>
                  )}
                  {project.documentationUrl && (
                    <a href={project.documentationUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Documentation
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Seller Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm mt-6"
            >
              <h3 className="font-semibold text-lg mb-4">About the Seller</h3>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={project.seller.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xl">
                    {project.seller.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{project.seller.name}</h4>
                  <p className="text-gray-600 mb-3">{project.seller.bio || 'Professional developer'}</p>
                  <div className="flex gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-purple-600 fill-current" />
                      <span className="font-semibold text-gray-900">Verified Seller</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg sticky top-24"
            >
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  ₹{Number(project.price).toLocaleString('en-IN')}
                </div>
                <p className="text-gray-600">One-time payment</p>
              </div>

              <Button 
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-6 text-lg font-semibold mb-4"
              >
                {purchasing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Request to Purchase
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500 mb-6">
                Admin will contact you with payment details
              </p>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Complete source code</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Documentation included</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>6 months updates</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>Money-back guarantee</span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>File Size:</span>
                  <span className="font-medium text-gray-900">{formatFileSize(project.fileSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-medium text-gray-900">ZIP Archive</span>
                </div>
                <div className="flex justify-between">
                  <span>Published:</span>
                  <span className="font-medium text-gray-900">
                    {project.publishedAt ? new Date(project.publishedAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="h-4 w-4" />
                  <span>Instant Download</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}