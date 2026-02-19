'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  ShoppingCart, 
  Download, 
  Package,
  Clock,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface Stats {
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  availableDownloads: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  projectId: string;
  projectTitle: string;
  projectSlug: string;
  projectThumbnail: string;
  projectTechStack: string[];
  sellerName: string;
  price: number;
  downloadUrl: string | null;
  downloadExpiresAt: string | null;
  downloadCount: number;
  lastDownloadAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export default function BuyerDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/buyer/orders');
      const data = await response.json();

      if (data.success) {
        setStats(data.data.stats);
        setOrders(data.data.orders);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load orders",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (orderId: string) => {
    try {
      setDownloading(orderId);
      const response = await fetch(`/api/orders/${orderId}/download`);
      const data = await response.json();
      
      if (data.success) {
        window.open(data.data.downloadUrl, '_blank');
        toast({
          title: "Success",
          description: "Download started successfully",
        });
        // Refresh orders to update download count
        fetchOrders();
      } else {
        toast({
          title: "Error",
          description: data.message || "Download failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Download failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const statCards = (stats ? [
    {
      title: 'Total Purchases',
      value: stats.totalOrders.toString(),
      subtitle: 'Projects owned',
      icon: Package,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Total Spent',
      value: `₹${(stats.totalSpent / 1000).toFixed(1)}K`,
      subtitle: 'Lifetime spending',
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Available Downloads',
      value: stats.availableDownloads.toString(),
      subtitle: 'Ready to download',
      icon: Download,
      color: 'from-green-500 to-green-600',
    },
  ] : []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
            <p className="text-gray-600">Access your purchased projects</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={fetchOrders}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/projects">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Browse Projects
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <StatCard
              title="Total Purchases"
              value={stats.totalOrders.toString()}
              icon={Package}
              description="Projects owned"
              iconClassName="bg-gradient-to-br from-purple-100 to-pink-100"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard
              title="Total Spent"
              value={`₹${(stats.totalSpent / 1000).toFixed(1)}K`}
              icon={ShoppingCart}
              description="Lifetime spending"
              iconClassName="bg-gradient-to-br from-blue-100 to-cyan-100"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatCard
              title="Available Downloads"
              value={stats.availableDownloads.toString()}
              icon={Download}
              description="Ready to download"
              iconClassName="bg-gradient-to-br from-green-100 to-emerald-100"
            />
          </motion.div>
        </div>

        {/* My Purchases */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">My Purchases</h2>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  title="No purchases yet"
                  description="Start browsing our amazing projects and make your first purchase"
                  action={{
                    label: "Browse Projects",
                    onClick: () => window.location.href = '/projects'
                  }}
                />
              ) : (
                orders.map(order => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-purple-100 to-blue-100">
                        <img
                          src={order.projectThumbnail}
                          alt={order.projectTitle}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=200';
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{order.projectTitle}</h3>
                            <p className="text-sm text-gray-600">Order: {order.orderNumber}</p>
                            <p className="text-xs text-gray-500">
                              Purchased: {order.paidAt ? new Date(order.paidAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }) : 'Pending'}
                            </p>
                            <p className="text-xs text-gray-500">Seller: {order.sellerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              ₹{Number(order.price).toLocaleString('en-IN')}
                            </p>
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                              order.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.status === 'COMPLETED' ? (
                                <><CheckCircle className="h-3 w-3" /> Completed</>
                              ) : (
                                <><Clock className="h-3 w-3" /> {order.status}</>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {order.projectTechStack && Array.isArray(order.projectTechStack) && order.projectTechStack.slice(0, 4).map(tech => (
                            <span
                              key={tech}
                              className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {order.status === 'COMPLETED' && (
                          <>
                            <div className="flex items-center gap-4 mt-4">
                              <Button
                                onClick={() => handleDownload(order.id)}
                                disabled={downloading === order.id}
                                className="bg-gradient-to-r from-purple-600 to-blue-600"
                              >
                                {downloading === order.id ? (
                                  <><LoadingSpinner size="sm" className="mr-2" /> Downloading...</>
                                ) : (
                                  <><Download className="h-4 w-4 mr-2" /> Download Project</>
                                )}
                              </Button>
                              <Link href={`/projects/${order.projectSlug}`}>
                                <Button variant="outline">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                              </Link>
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                              <span>Downloads: {order.downloadCount}</span>
                              {order.lastDownloadAt && (
                                <span>Last: {new Date(order.lastDownloadAt).toLocaleDateString('en-IN')}</span>
                              )}
                              {order.downloadExpiresAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Link expires: {new Date(order.downloadExpiresAt).toLocaleDateString('en-IN')}
                                </span>
                              )}
                            </div>
                          </>
                        )}

                        {order.status !== 'COMPLETED' && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-yellow-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>Order is being processed. You'll be able to download once completed.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
        </>
        )}
      </div>
    </div>
  );
}