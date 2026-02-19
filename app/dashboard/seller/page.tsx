'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Plus,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  RefreshCw
} from 'lucide-react';

interface Stats {
  totalProjects: number;
  approvedProjects: number;
  pendingProjects: number;
  rejectedProjects: number;
  draftProjects: number;
  totalSales: number;
  totalRevenue: number;
  walletBalance: number;
}

interface Project {
  id: string;
  title: string;
  status: string;
  price: number;
  sales: number;
  views: number;
  revenue: number;
  publishedAt: string | null;
  createdAt: string;
}

interface RecentSale {
  id: string;
  projectTitle: string;
  buyer: string;
  buyerName: string;
  amount: number;
  date: string;
  orderNumber: string;
}

export default function SellerDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/seller/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setProjects(data.data.projects);
        setRecentSales(data.data.recentSales);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load dashboard data",
          variant: "destructive",
        });
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

  const statCards = stats ? [
    {
      title: 'Wallet Balance',
      value: `₹${(Number(stats.walletBalance) / 1000).toFixed(1)}K`,
      subtitle: 'Available for withdrawal',
      icon: Wallet,
      color: 'from-green-500 to-green-600',
      action: 'Withdraw',
      link: '/dashboard/seller/wallet',
    },
    {
      title: 'Total Revenue',
      value: `₹${(Number(stats.totalRevenue) / 1000).toFixed(1)}K`,
      subtitle: 'All time earnings',
      icon: DollarSign,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Sales',
      value: stats.totalSales.toString(),
      subtitle: 'Projects sold',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Active Projects',
      value: stats.approvedProjects.toString(),
      subtitle: `${stats.pendingProjects} pending`,
      icon: Package,
      color: 'from-orange-500 to-orange-600',
      action: 'Upload',
      link: '/projects/new',
    },
  ] : [];

  const getStatusBadge = (status: string) => {
    const styles = {
      APPROVED: 'bg-green-100 text-green-700',
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
      REJECTED: 'bg-red-100 text-red-700',
      DRAFT: 'bg-gray-100 text-gray-700',
    };
    return styles[status as keyof typeof styles] || styles.DRAFT;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'APPROVED') return <CheckCircle className="h-4 w-4" />;
    if (status === 'PENDING_REVIEW') return <Clock className="h-4 w-4" />;
    if (status === 'REJECTED') return <XCircle className="h-4 w-4" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Seller Dashboard</h1>
            <p className="text-gray-600">Manage your projects and track earnings</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/projects/new">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Plus className="h-5 w-5 mr-2" />
                Upload Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && stats && (
          <>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <StatCard
              title="Wallet Balance"
              value={`₹${(Number(stats.walletBalance) / 1000).toFixed(1)}K`}
              icon={Wallet}
              description="Available for withdrawal"
              iconClassName="bg-gradient-to-br from-green-100 to-emerald-100"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard
              title="Total Revenue"
              value={`₹${(Number(stats.totalRevenue) / 1000).toFixed(1)}K`}
              icon={DollarSign}
              description="All time earnings"
              iconClassName="bg-gradient-to-br from-blue-100 to-cyan-100"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatCard
              title="Total Sales"
              value={stats.totalSales.toString()}
              icon={TrendingUp}
              description="Projects sold"
              iconClassName="bg-gradient-to-br from-purple-100 to-pink-100"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <StatCard
              title="Active Projects"
              value={stats.approvedProjects.toString()}
              icon={Package}
              description={`${stats.pendingProjects} pending review`}
              iconClassName="bg-gradient-to-br from-orange-100 to-amber-100"
            />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* My Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">My Projects</h2>
                <Link href="/dashboard/seller/projects">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {projects.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No projects yet"
                    description="Start by uploading your first project to begin selling"
                    action={{
                      label: "Upload Project",
                      onClick: () => window.location.href = '/projects/new'
                    }}
                  />
                ) : (
                  projects.slice(0, 5).map(project => (
                    <div key={project.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{project.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusBadge(project.status)}`}>
                              {getStatusIcon(project.status)}
                              {project.status.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-medium">
                              ₹{Number(project.price).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {project.status === 'APPROVED' && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-1 text-gray-600 mb-1">
                              <Download className="h-4 w-4" />
                              <span>Sales</span>
                            </div>
                            <p className="font-semibold">{project.sales}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-gray-600 mb-1">
                              <Eye className="h-4 w-4" />
                              <span>Views</span>
                            </div>
                            <p className="font-semibold">{project.views.toLocaleString()}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-gray-600 mb-1">
                              <DollarSign className="h-4 w-4" />
                              <span>Revenue</span>
                            </div>
                            <p className="font-semibold">₹{(Number(project.revenue) / 1000).toFixed(1)}K</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          {/* Recent Sales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Sales</h2>
                <Link href="/dashboard/seller/sales">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {recentSales.length === 0 ? (
                  <EmptyState
                    icon={TrendingUp}
                    title="No sales yet"
                    description="Sales will appear here once customers purchase your projects"
                  />
                ) : (
                  recentSales.map(sale => (
                    <div key={sale.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{sale.projectTitle}</h3>
                          <p className="text-xs text-gray-600">{sale.buyerName || sale.buyer}</p>
                          <p className="text-xs text-gray-400 mt-1">Order #{sale.orderNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            +₹{Number(sale.amount).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(sale.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}