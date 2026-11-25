"use client";

import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Search, Eye, CheckCircle, XCircle, RefreshCw } from "lucide-react";

const statusOptions = ["all", "pending_payment", "paid", "processing", "ready_for_dispatch", "shipped", "delivered", "cancelled", "refunded"];
const paymentStatusOptions = ["all", "pending", "awaiting_verification", "paid", "failed", "refunded"];

const statusColors: Record<string, string> = {
  pending_payment: "bg-gray-100 text-gray-700",
  paid: "bg-emerald-100 text-emerald-700",
  processing: "bg-blue-100 text-blue-700",
  ready_for_dispatch: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  awaiting_verification: "bg-orange-100 text-orange-700",
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
  const [reviewing, setReviewing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (user?.role === "admin") loadOrders();
  }, [user, search, statusFilter, paymentStatusFilter, currentPage]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 20 };
      if (search) params.q = search;
      if (statusFilter !== "all") params.fulfilmentStatus = statusFilter;
      if (paymentStatusFilter !== "all") params.paymentStatus = paymentStatusFilter;
      const res = await api.get("/orders/admin/all", { params });
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
      await api.patch(`/orders/admin/${orderId}/status`, { fulfilmentStatus: newStatus });
      await loadOrders();
      if (selectedOrder?._id === orderId) setSelectedOrder((o: any) => ({ ...o, fulfilmentStatus: newStatus }));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const refreshSelected = async (orderId: string) => {
    const res = await api.get(`/orders/${orderId}`);
    setSelectedOrder(res.data.order);
  };

  const approvePayment = async (orderId: string) => {
    if (!confirm("Verify this payment and mark order as paid?")) return;
    setReviewing(true);
    try {
      await api.post(`/payments/bank-transfer/${orderId}/approve`);
      await loadOrders();
      await refreshSelected(orderId);
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to approve payment");
    } finally {
      setReviewing(false);
    }
  };

  const rejectPayment = async (orderId: string) => {
    const reason = rejectReason.trim();
    if (!reason) return alert("Please provide a rejection reason.");
    setReviewing(true);
    try {
      await api.post(`/payments/bank-transfer/${orderId}/reject`, { reason });
      setRejectReason("");
      await loadOrders();
      await refreshSelected(orderId);
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to reject payment");
    } finally {
      setReviewing(false);
    }
  };

  const money = (amount: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(Number(amount || 0));

  const receiptUrl = useMemo(() => selectedOrder?.paymentReceiptUrl || selectedOrder?.bankTransferProof, [selectedOrder]);

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Orders</h1>
            <p className="text-muted-text mt-1">Manage orders and verify manual payments</p>
          </div>
          <button onClick={loadOrders} className="inline-flex items-center gap-2 px-4 py-2 border border-light-border rounded-lg text-sm hover:bg-muted"><RefreshCw className="w-4 h-4" />Refresh</button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" strokeWidth={2} />
              <input type="search" placeholder="Search by order ref, customer, email, phone..." value={search} onChange={(e) => { setCurrentPage(1); setSearch(e.target.value); }} className="pl-10 pr-4 py-2.5 w-full bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
            </div>
            <div className="flex gap-2">
              <select value={statusFilter} onChange={(e) => { setCurrentPage(1); setStatusFilter(e.target.value); }} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text">
                <option value="all">All Fulfilment</option>
                {statusOptions.filter(s => s !== "all").map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
              <select value={paymentStatusFilter} onChange={(e) => { setCurrentPage(1); setPaymentStatusFilter(e.target.value); }} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text">
                <option value="all">All Payment</option>
                {paymentStatusOptions.filter(s => s !== "all").map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-text" /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-muted-text uppercase border-b border-light-border dark:border-gray-700">
                      <th className="pb-3">Order</th><th className="pb-3">Customer</th><th className="pb-3">Amount</th><th className="pb-3">Payment</th><th className="pb-3">Fulfilment</th><th className="pb-3">Date</th><th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id} className="border-b border-light-border/50 dark:border-gray-700/50 hover:bg-muted/50">
                        <td className="py-4"><div className="font-mono text-sm text-primary-text">{order.orderNumber}</div><div className="text-xs text-muted-text">{order.paymentMethod === "bank_transfer" ? "Bank transfer" : "Paystack"}</div></td>
                        <td><p className="font-medium text-primary-text">{order.delivery?.name || order.customer?.name || "Guest"}</p><p className="text-xs text-muted-text">{order.delivery?.email || order.customer?.email}</p><p className="text-xs text-muted-text">{order.delivery?.phone}</p></td>
                        <td className="font-semibold text-primary-text">{money(order.total)}</td>
                        <td><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[order.paymentStatus] || paymentStatusColors.pending}`}>{String(order.paymentStatus).replace(/_/g, " ")}</span></td>
                        <td>
                          <div className="flex items-center gap-1">
                            <select value={order.fulfilmentStatus} onChange={(e) => updateOrderStatus(order._id, e.target.value)} disabled={updatingId === order._id} className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[order.fulfilmentStatus] || statusColors.pending_payment}`}>
                              {statusOptions.filter(s => s !== "all").map((s) => <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                            </select>
                            {updatingId === order._id && <Loader2 className="w-4 h-4 animate-spin text-muted-text" />}
                          </div>
                        </td>
                        <td className="text-sm text-muted-text whitespace-nowrap">{new Date(order.createdAt).toLocaleString()}</td>
                        <td><button onClick={() => { setSelectedOrder(order); setRejectReason(""); }} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text" aria-label="View order"><Eye className="w-4 h-4" /></button></td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-muted-text">No orders found.</td></tr>}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50">Previous</button>
                  <span className="text-sm text-muted-text">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50">Next</button>
                </div>
              )}
            </>
          )}
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-light-border dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-light-border dark:border-gray-700 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-primary-text">Order {selectedOrder.orderNumber}</h2>
                  <p className="text-sm text-muted-text">Placed {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="px-3 py-1.5 border rounded-lg text-sm">Close</button>
              </div>
              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 space-y-2 text-sm">
                    <h3 className="font-semibold text-primary-text">Customer / Delivery</h3>
                    <p><span className="text-muted-text">Name:</span> {selectedOrder.delivery?.name || selectedOrder.customer?.name}</p>
                    <p><span className="text-muted-text">Email:</span> {selectedOrder.delivery?.email || selectedOrder.customer?.email}</p>
                    <p><span className="text-muted-text">Phone:</span> {selectedOrder.delivery?.phone}</p>
                    <p><span className="text-muted-text">Address:</span> {selectedOrder.delivery?.street}, {selectedOrder.delivery?.city}, {selectedOrder.delivery?.state}</p>
                    {selectedOrder.delivery?.instructions && <p><span className="text-muted-text">Instructions:</span> {selectedOrder.delivery.instructions}</p>}
                  </div>
                  <div className="border rounded-lg p-4 space-y-2 text-sm">
                    <h3 className="font-semibold text-primary-text">Items</h3>
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between gap-3 border-b last:border-0 pb-2 last:pb-0">
                        <div><p className="font-medium">{item.name}</p><p className="text-muted-text">Qty {item.quantity} × {money(item.unitPrice)}</p></div>
                        <div className="font-medium">{money(item.totalPrice)}</div>
                      </div>
                    ))}
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between"><span className="text-muted-text">Subtotal</span><span>{money(selectedOrder.subtotal)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-text">Discount</span><span>-{money(selectedOrder.discount)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-text">Shipping</span><span>{money(selectedOrder.shipping)}</span></div>
                      <div className="flex justify-between font-semibold text-base"><span>Total</span><span>{money(selectedOrder.total)}</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4 space-y-2 text-sm">
                    <h3 className="font-semibold text-primary-text">Payment</h3>
                    <p><span className="text-muted-text">Method:</span> {selectedOrder.paymentMethod === "bank_transfer" ? "Bank Transfer" : "Paystack"}</p>
                    <p><span className="text-muted-text">Status:</span> <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${paymentStatusColors[selectedOrder.paymentStatus] || paymentStatusColors.pending}`}>{String(selectedOrder.paymentStatus).replace(/_/g, " ")}</span></p>
                    <p><span className="text-muted-text">Reference:</span> {selectedOrder.paymentReference || selectedOrder.orderNumber}</p>
                    {selectedOrder.paymentReceiptUploadedAt && <p><span className="text-muted-text">Receipt uploaded:</span> {new Date(selectedOrder.paymentReceiptUploadedAt).toLocaleString()}</p>}
                    {selectedOrder.paymentVerifiedAt && <p><span className="text-muted-text">Verified at:</span> {new Date(selectedOrder.paymentVerifiedAt).toLocaleString()}</p>}
                    {selectedOrder.paymentRejectedReason && <p className="text-red-600"><span className="text-muted-text">Rejection reason:</span> {selectedOrder.paymentRejectedReason}</p>}
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-primary-text">Receipt</h3>
                    {receiptUrl ? (
                      <div className="space-y-2">
                        {/\.(pdf)($|\?)/i.test(receiptUrl) ? (
                          <a href={receiptUrl} target="_blank" rel="noreferrer" className="text-brand underline text-sm">Open receipt PDF</a>
                        ) : (
                          <a href={receiptUrl} target="_blank" rel="noreferrer" className="block">
                            <img src={receiptUrl} alt="Payment receipt" className="max-h-80 rounded border object-contain bg-muted" />
                          </a>
                        )}
                        <a href={receiptUrl} target="_blank" rel="noreferrer" className="text-sm text-brand underline">Open full receipt</a>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-text">No receipt uploaded yet.</p>
                    )}
                  </div>

                  {selectedOrder.paymentMethod === "bank_transfer" && selectedOrder.paymentStatus !== "paid" && (
                    <div className="border rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-primary-text">Verify Payment</h3>
                      <div className="flex gap-2">
                        <button onClick={() => approvePayment(selectedOrder._id)} disabled={reviewing} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-60"><CheckCircle className="w-4 h-4" />Approve</button>
                      </div>
                      <div className="space-y-2">
                        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection (required to reject)" className="w-full px-3 py-2 border rounded-lg text-sm min-h-24" />
                        <button onClick={() => rejectPayment(selectedOrder._id)} disabled={reviewing} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-60"><XCircle className="w-4 h-4" />Reject</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
