'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { 
  ShoppingCart,
  User,
  Mail,
  Phone,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Copy,
  Filter
} from 'lucide-react';

interface PurchaseRequest {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  buyer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  project: {
    id: string;
    title: string;
    price: number;
    thumbnailUrl: string;
    seller: {
      name: string;
      email: string;
    };
  };
}

export default function AdminPurchaseRequestsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/purchase-requests?status=${statusFilter}`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.data.requests);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load purchase requests",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load purchase requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
      variant: "success",
    });
  };

  const handleCreateOrder = async (requestId: string, projectId: string, buyerId: string) => {
    if (!confirm('Have you received payment confirmation? This will create an order and credit the seller.')) {
      return;
    }

    try {
      setProcessingId(requestId);
      const response = await fetch('/api/orders/manual-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          buyerId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Order created successfully! Buyer can now download the project.",
          variant: "success",
        });
        fetchRequests();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create order",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'COMPLETED') return <CheckCircle className="h-4 w-4" />;
    if (status === 'REJECTED') return <XCircle className="h-4 w-4" />;
    if (status === 'PENDING') return <Clock className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const statusCounts = {
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    APPROVED: requests.filter(r => r.status === 'APPROVED').length,
    COMPLETED: requests.filter(r => r.status === 'COMPLETED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
    ALL: requests.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Purchase Requests</h1>
            <p className="text-gray-600">Manage buyer purchase requests and create orders</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchRequests}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Status Filter */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="h-5 w-5 text-gray-500 shrink-0" />
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
                {status} ({count})
              </button>
            ))}
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        )}

        {/* Requests List */}
        {!loading && requests.length > 0 && (
          <div className="space-y-6">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-6">
                    {/* Project Thumbnail */}
                    <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-purple-100 to-blue-100">
                      <img
                        src={request.project.thumbnailUrl}
                        alt={request.project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=200';
                        }}
                      />
                    </div>

                    {/* Request Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{request.project.title}</h3>
                          <p className="text-sm text-gray-600">by {request.project.seller.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            ₹{Number(request.project.price).toLocaleString('en-IN')}
                          </div>
                          <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${getStatusBadge(request.status)}`}>
                            {getStatusIcon(request.status)}
                            {request.status}
                          </span>
                        </div>
                      </div>

                      {/* Buyer Information */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Buyer Information
                        </h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{request.buyer.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{request.buyer.email}</span>
                            <button
                              onClick={() => copyToClipboard(request.buyer.email, 'Email')}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                          {request.buyer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{request.buyer.phone}</span>
                              <button
                                onClick={() => copyToClipboard(request.buyer.phone!, 'Phone')}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Message */}
                      {request.message && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-blue-900">
                            <strong>Message:</strong> {request.message}
                          </p>
                        </div>
                      )}

                      {/* Payment Instructions */}
                      {request.status === 'PENDING' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <h5 className="font-semibold text-yellow-900 mb-2">📋 Next Steps:</h5>
                          <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                            <li>Contact buyer via email/phone</li>
                            <li>Share payment details (UPI/Bank Transfer)</li>
                            <li>Wait for payment confirmation</li>
                            <li>Verify payment received</li>
                            <li>Click "Create Order" below</li>
                          </ol>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        {request.status === 'PENDING' && (
                          <>
                            <Button
                              onClick={() => handleCreateOrder(request.id, request.project.id, request.buyer.id)}
                              disabled={processingId === request.id}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              {processingId === request.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Creating Order...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Create Order (Payment Received)
                                </>
                              )}
                            </Button>
                            <a href={`mailto:${request.buyer.email}?subject=Payment Details for ${request.project.title}`}>
                              <Button variant="outline">
                                <Mail className="h-4 w-4 mr-2" />
                                Email Buyer
                              </Button>
                            </a>
                          </>
                        )}

                        <Link href={`/projects/${request.project.id}`}>
                          <Button variant="outline">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Project
                          </Button>
                        </Link>
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs text-gray-500 mt-4">
                        Requested: {new Date(request.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No purchase requests</h3>
              <p className="text-gray-600 mb-6">
                {statusFilter === 'PENDING' 
                  ? 'No pending purchase requests at the moment'
                  : `No ${statusFilter.toLowerCase()} requests found`
                }
              </p>
              {statusFilter !== 'PENDING' && (
                <Button onClick={() => setStatusFilter('PENDING')}>
                  View Pending Requests
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
