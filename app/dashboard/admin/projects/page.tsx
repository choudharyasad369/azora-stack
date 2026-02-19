'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  FileArchive,
  User,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  status: string;
  techStack: string[];
  difficulty: string;
  thumbnailUrl: string;
  fileUrl: string;
  fileSize: number;
  demoUrl?: string;
  documentationUrl?: string;
  seller: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  rejectionReason?: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'>('PENDING_REVIEW');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/projects?status=${filter}`);
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId: string) => {
    if (!confirm('Are you sure you want to approve this project?')) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/projects/${projectId}/approve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        alert('Project approved successfully!');
        setSelectedProject(null);
        fetchProjects();
      } else {
        alert(data.error?.message || 'Failed to approve project');
      }
    } catch (error) {
      alert('Error approving project');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (projectId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (!confirm('Are you sure you want to reject this project?')) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/projects/${projectId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Project rejected');
        setSelectedProject(null);
        setRejectionReason('');
        fetchProjects();
      } else {
        alert(data.error?.message || 'Failed to reject project');
      }
    } catch (error) {
      alert('Error rejecting project');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      PENDING_REVIEW: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const variant = variants[status] || variants.PENDING_REVIEW;
    const Icon = variant.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${variant.color}`}>
        <Icon className="h-4 w-4" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Project Approvals</h1>
          <p className="text-gray-600">Review and approve seller projects</p>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex gap-2">
            <Button
              variant={filter === 'PENDING_REVIEW' ? 'default' : 'outline'}
              onClick={() => setFilter('PENDING_REVIEW')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending Review
            </Button>
            <Button
              variant={filter === 'APPROVED' ? 'default' : 'outline'}
              onClick={() => setFilter('APPROVED')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approved
            </Button>
            <Button
              variant={filter === 'REJECTED' ? 'default' : 'outline'}
              onClick={() => setFilter('REJECTED')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejected
            </Button>
          </div>
        </Card>

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
            <p className="text-gray-600">No projects with status: {filter.replace('_', ' ')}</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="md:flex">
                    {/* Thumbnail */}
                    <div className="md:w-64 h-48 md:h-auto relative">
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(project.status)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                          <p className="text-gray-600 mb-3">{project.shortDescription}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            ₹{project.price.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack && Array.isArray(project.techStack) && project.techStack.slice(0, 5).map(tech => (
                          <span
                            key={tech}
                            className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack && project.techStack.length > 5 && (
                          <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                            +{project.techStack.length - 5} more
                          </span>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span>{project.seller.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileArchive className="h-4 w-4" />
                          <span>{(project.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="font-medium">{project.difficulty}</span>
                        </div>
                      </div>

                      {/* Rejection Reason */}
                      {project.status === 'REJECTED' && project.rejectionReason && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Rejection Reason:</strong> {project.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedProject(project)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>

                        {project.status === 'PENDING_REVIEW' && (
                          <>
                            <Button
                              onClick={() => handleApprove(project.id)}
                              disabled={actionLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => setSelectedProject(project)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">{selectedProject.title}</h2>
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                      setRejectionReason('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <img
                  src={selectedProject.thumbnailUrl}
                  alt={selectedProject.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedProject.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Seller</h3>
                      <p>{selectedProject.seller.name}</p>
                      <p className="text-sm text-gray-600">{selectedProject.seller.email}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Price</h3>
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{selectedProject.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {selectedProject.demoUrl && (
                    <div>
                      <h3 className="font-semibold mb-2">Demo URL</h3>
                      <a
                        href={selectedProject.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        {selectedProject.demoUrl}
                      </a>
                    </div>
                  )}

                  {selectedProject.documentationUrl && (
                    <div>
                      <h3 className="font-semibold mb-2">Documentation URL</h3>
                      <a
                        href={selectedProject.documentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        {selectedProject.documentationUrl}
                      </a>
                    </div>
                  )}

                  {selectedProject.status === 'PENDING_REVIEW' && (
                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-4">Rejection Reason (if rejecting)</h3>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        rows={4}
                        placeholder="Provide a reason for rejection..."
                      />

                      <div className="flex gap-3 mt-4">
                        <Button
                          onClick={() => handleApprove(selectedProject.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Project
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(selectedProject.id)}
                          disabled={actionLoading || !rejectionReason.trim()}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Project
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
