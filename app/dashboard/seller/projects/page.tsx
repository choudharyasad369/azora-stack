'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { 
  Package, 
  Plus,
  Eye,
  Download,
  DollarSign,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  status: string;
  price: number;
  salesCount: number;
  viewCount: number;
  thumbnailUrl: string;
  techStack: string[];
  difficulty: string;
  createdAt: string;
  publishedAt: string | null;
  rejectionReason?: string | null;
}

export default function SellerProjectsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/seller/stats');
      const data = await response.json();

      if (data.success) {
        setProjects(data.data.projects);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load projects",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Project deleted successfully",
          variant: "success",
        });
        fetchProjects();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete project",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      APPROVED: 'bg-green-100 text-green-700',
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
      REJECTED: 'bg-red-100 text-red-700',
      DRAFT: 'bg-gray-100 text-gray-700',
      ARCHIVED: 'bg-gray-100 text-gray-600',
    };
    return styles[status as keyof typeof styles] || styles.DRAFT;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'APPROVED') return <CheckCircle className="h-4 w-4" />;
    if (status === 'PENDING_REVIEW') return <Clock className="h-4 w-4" />;
    if (status === 'REJECTED') return <XCircle className="h-4 w-4" />;
    if (status === 'DRAFT') return <AlertCircle className="h-4 w-4" />;
    return null;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    ALL: projects.length,
    APPROVED: projects.filter(p => p.status === 'APPROVED').length,
    PENDING_REVIEW: projects.filter(p => p.status === 'PENDING_REVIEW').length,
    REJECTED: projects.filter(p => p.status === 'REJECTED').length,
    DRAFT: projects.filter(p => p.status === 'DRAFT').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Projects</h1>
            <p className="text-gray-600">Manage and track all your projects</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={fetchProjects}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/projects/new">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Plus className="h-5 w-5 mr-2" />
                Upload New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.replace('_', ' ')} ({count})
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Projects Grid */}
        {!loading && filteredProjects.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100">
                    <img
                      src={project.thumbnailUrl}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=500';
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${getStatusBadge(project.status)}`}>
                        {getStatusIcon(project.status)}
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
                    
                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.techStack && Array.isArray(project.techStack) && project.techStack.slice(0, 3).map(tech => (
                        <span
                          key={tech}
                          className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack && project.techStack.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Price & Difficulty */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <span className="font-semibold text-lg">
                        ₹{Number(project.price).toLocaleString('en-IN')}
                      </span>
                      <span className="text-gray-600">{project.difficulty}</span>
                    </div>

                    {/* Stats */}
                    {project.status === 'APPROVED' && (
                      <div className="grid grid-cols-3 gap-2 mb-4 text-sm text-gray-600 pb-4 border-b">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Eye className="h-4 w-4" />
                          </div>
                          <p className="font-semibold text-gray-900">{project.viewCount}</p>
                          <p className="text-xs">Views</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Download className="h-4 w-4" />
                          </div>
                          <p className="font-semibold text-gray-900">{project.salesCount}</p>
                          <p className="text-xs">Sales</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <DollarSign className="h-4 w-4" />
                          </div>
                          <p className="font-semibold text-gray-900">
                            ₹{((Number(project.price) * project.salesCount * 0.5) / 1000).toFixed(1)}K
                          </p>
                          <p className="text-xs">Revenue</p>
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {project.status === 'REJECTED' && project.rejectionReason && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason:</p>
                        <p className="text-xs text-red-600">{project.rejectionReason}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/projects/${project.slug}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/dashboard/seller/projects/${project.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Date */}
                    <p className="text-xs text-gray-500 mt-3">
                      Created: {new Date(project.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || statusFilter !== 'ALL' ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Start by uploading your first project'}
              </p>
              {!searchQuery && statusFilter === 'ALL' && (
                <Link href="/projects/new">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Plus className="h-5 w-5 mr-2" />
                    Upload Your First Project
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
