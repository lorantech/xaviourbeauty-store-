"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  MoreVertical,
  Loader2,
} from "lucide-react";

const statusOptions = ["all", "pending_payment", "paid", "processing", "ready_for_dispatch", "shipped", "delivered", "cancelled", "refunded"];
const paymentStatusOptions = ["all", "pending", "paid", "failed", "refunded"];

const statusColors = {
  pending_payment: "bg-gray-100 text-gray-700",
  paid: "bg-emerald-100 text-emerald-700",
  processing: "bg-blue-100 text-blue-700",
  ready_for_dispatch: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

const paymentStatusColors = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") loadOrders();
  }, [user, search, statusFilter, paymentStatusFilter, currentPage]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 20 };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (paymentStatusFilter !== "all") params.paymentStatus = paymentStatusFilter;
      
      const res = await api.get("/admin/orders", { params });
      setOrders(res.data.orders || []);
      setTotalPages(res.data.pages || 1);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}`, { fulfilmentStatus: newStatus });
      loadOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
  };

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Orders</h1>
            <p className="text-muted-text mt-1">Manage and track customer orders</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" strokeWidth={2} />
              <input
                type="search"
                placeholder="Search orders by ID, customer, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold min-w-[160px]"
              >
                <option value="all">All Status</option>
                {statusOptions.filter(s => s !== "all").map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold min-w-[160px]"
              >
                <option value="all">All Payment Status</option>
                {paymentStatusOptions.filter(s => s !== "all").map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-muted-text uppercase border-b border-light-border dark:border-gray-700">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-light-border/50 dark:border-gray-700/50 animate-pulse">
                      <td className="py-4"><div className="h-4 bg-muted rounded w-3/4"></div></td>
                      <td className="py-4"><div className="h-4 bg-muted rounded w-1/2"></div></td>
                      <td className="py-4"><div className="h-4 bg-muted rounded w-1/3"></div></td>
                      <td className="py-4"><div className="h-4 bg-muted rounded w-1/3"></div></td>
                      <td className="py-4"><div className="h-4 bg-muted rounded w-1/3"></div></td>
                      <td className="py-4"><div className="h-4 bg-muted rounded w-1/3"></div></td>
                      <td className="py-4"><div className="h-4 bg-muted rounded w-1/3"></div></td>
                      <td className="py-4"><div className="h-4 bg-muted rounded w-1/4"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-muted-text uppercase border-b border-light-border dark:border-gray-700">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-light-border/50 dark:border-gray-700/50 hover:bg-muted/50 transition-colors">
                        <td className="py-4 font-mono text-sm text-primary-text">{order.orderNumber}</td>
                        <td>
                          <div>
                            <p className="font-medium text-primary-text">{order.delivery?.name || order.customer?.name || "Guest"}</p>
                            <p className="text-xs text-muted-text">{order.delivery?.email || order.customer?.email}</p>
                            <p className="text-xs text-muted-text">{order.delivery?.phone}</p>
                          </div>
                        </td>
                        <td className="text-sm text-primary-text">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                        </td>
                        <td className="font-semibold text-primary-text">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(order.total)}</td>
                        <td>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors] || paymentStatusColors.pending}`}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <select
                              value={order.fulfilmentStatus}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              disabled={updatingId === order._id}
                              className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[order.fulfilmentStatus as keyof typeof statusColors] || statusColors.pending_payment} bg-opacity-20`}
                            >
                              {statusOptions.filter(s => s !== "all").map((s) => (
                                <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                              ))}
                            </select>
                            {updatingId === order._id && <Loader2 className="w-4 h-4 animate-spin text-muted-text" />}
                          </div>
                        </td>
                        <td className="text-sm text-muted-text whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => window.open(`/admin/orders/${order._id}`, '_blank')}
                            className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text transition-colors"
                            aria-label="View order details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-muted-text">
                          <svg className="w-12 h-12 mx-auto text-muted-text/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v7m12 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-7m12 0l-4-4m0 0l-4 4m4-4v12" />
                          </svg>
                          <p className="text-primary-text font-medium mt-2">No orders found</p>
                          <p className="text-sm text-muted-text mt-1">Try adjusting your filters</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-muted-text hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-primary-forest-green text-white"
                            : "text-muted-text hover:bg-muted"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-muted-text hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </AdminLayout>
    )
  );
}