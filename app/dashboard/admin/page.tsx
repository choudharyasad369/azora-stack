'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { useToast } from '@/components/ui/use-toast';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalOrders: number;
  platformRevenue: number;
  pendingProjects: number;
  pendingWithdrawals: number;
}

interface PendingProject {
  id: string;
  title: string;
  seller: {
    name: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

interface PendingWithdrawal {
  id: string;
  withdrawalNumber: string;
  seller: {
    name: string;
    email: string;
  };
  amount: number;
  status: string;
  requestedAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingProjects, setPendingProjects] = useState<PendingProject[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics
      const [analyticsRes, projectsRes, withdrawalsRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/projects?status=PENDING_REVIEW&limit=5'),
        fetch('/api/withdrawals?status=PENDING&limit=5'),
      ]);

      const analyticsData = await analyticsRes.json();
      const projectsData = await projectsRes.json();
      const withdrawalsData = await withdrawalsRes.json();

      if (analyticsData.success) {
        setStats(analyticsData.data.stats);
      }

      if (projectsData.success) {
        setPendingProjects(projectsData.data.projects || []);
      }

      if (withdrawalsData.success) {
        setPendingWithdrawals(withdrawalsData.data.withdrawals || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/approve`, {
        method: 'PUT',
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Project approved successfully",
        });
        fetchDashboardData();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to approve project",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve project",
        variant: "destructive",
      });
    }
  };

  const handleRejectProject = async (projectId: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/projects/${projectId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Project rejected",
        });
        fetchDashboardData();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reject project",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject project",
        variant: "destructive",
      });
    }
  };

  const statCards = stats ? [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects.toLocaleString(),
      icon: Package,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Platform Revenue',
      value: `₹${(stats.platformRevenue / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your platform and monitor performance</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && stats && (
          <>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Pending Projects</h2>
                {stats && (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                    {stats.pendingProjects} pending
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {pendingProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No pending projects</p>
                  </div>
                ) : (
                  pendingProjects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{project.title}</h3>
                        <p className="text-sm text-gray-600">by {project.seller.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(project.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApproveProject(project.id)}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleRejectProject(project.id)}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link href="/dashboard/admin/projects">
                <button className="w-full mt-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium">
                  View All Projects →
                </button>
              </Link>
            </Card>
          </motion.div>

          {/* Pending Withdrawals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Pending Withdrawals</h2>
                {stats && (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                    {stats.pendingWithdrawals} pending
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {pendingWithdrawals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No pending withdrawals</p>
                  </div>
                ) : (
                  pendingWithdrawals.map(withdrawal => (
                    <div key={withdrawal.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{withdrawal.seller.name}</h3>
                          <p className="text-sm text-gray-600">{withdrawal.withdrawalNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            ₹{Number(withdrawal.amount).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(withdrawal.requestedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link href={`/dashboard/admin/withdrawals/${withdrawal.id}`} className="flex-1">
                          <button className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm">
                            Review
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link href="/dashboard/admin/withdrawals">
                <button className="w-full mt-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium">
                  View All Withdrawals →
                </button>
              </Link>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Link href="/dashboard/admin/purchase-requests">
                <button className="w-full p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl hover:shadow-md transition-all text-left">
                  <ShoppingCart className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold">Purchase Requests</h3>
                  <p className="text-sm text-gray-600">Manage buyer requests</p>
                </button>
              </Link>
              <Link href="/dashboard/admin/projects">
                <button className="w-full p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all text-left">
                  <Package className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-semibold">Review Projects</h3>
                  <p className="text-sm text-gray-600">Approve or reject projects</p>
                </button>
              </Link>
              <Link href="/dashboard/admin/orders/create">
                <button className="w-full p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl hover:shadow-md transition-all text-left">
                  <DollarSign className="h-8 w-8 text-orange-600 mb-2" />
                  <h3 className="font-semibold">Create Order</h3>
                  <p className="text-sm text-gray-600">Manual order creation</p>
                </button>
              </Link>
              <Link href="/dashboard/admin/settings">
                <button className="w-full p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition-all text-left">
                  <AlertCircle className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold">Platform Settings</h3>
                  <p className="text-sm text-gray-600">Configure platform</p>
                </button>
              </Link>
            </div>
          </Card>
        </motion.div>
        </>
        )}
      </div>
    </div>
  );
}