"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, ShoppingCart, CreditCard, AlertTriangle, Star, Check } from "lucide-react";

const notificationTypes: Record<string, { icon: any; color: string; label: string }> = {
  new_order: { icon: ShoppingCart, color: "bg-blue-100 text-blue-700", label: "New Order" },
  payment_received: { icon: CreditCard, color: "bg-emerald-100 text-emerald-700", label: "Payment Received" },
  payment_receipt_uploaded: { icon: CreditCard, color: "bg-amber-100 text-amber-700", label: "Receipt Uploaded" },
  payment_rejected: { icon: AlertTriangle, color: "bg-red-100 text-red-700", label: "Payment Rejected" },
  low_stock: { icon: AlertTriangle, color: "bg-amber-100 text-amber-700", label: "Low Stock" },
  new_review: { icon: Star, color: "bg-purple-100 text-purple-700", label: "New Review" },
};

export default function AdminNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { if (user?.role === "admin") loadNotifications(); }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(Number(res.data.unreadCount || 0));
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) { console.error("Failed to mark as read:", error); }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/admin/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) { console.error("Failed to mark all as read:", error); }
  };

  const deleteNotification = async (id: string) => {
    try {
      const notification = notifications.find((n) => n._id === id);
      await api.delete(`/admin/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (notification && !notification.read) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) { console.error("Failed to delete notification:", error); }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter = filter === "all" || (filter === "unread" && !n.read) || n.type === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q || String(n.message || "").toLowerCase().includes(q) || String(n.title || "").toLowerCase().includes(q) || String(n.type || "").toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Notifications</h1>
            <p className="text-muted-text mt-1">Order and payment alerts for admin review</p>
          </div>
          {unreadCount > 0 && <button onClick={markAllAsRead} className="px-4 py-2 bg-primary-forest-green text-white rounded-lg font-medium text-sm flex items-center gap-2"><Check className="w-4 h-4" />Mark all as read ({unreadCount})</button>}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 overflow-hidden">
          <div className="border-b border-light-border dark:border-gray-700 px-4 py-3 flex flex-col sm:flex-row gap-3">
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notifications..." className="pl-3 pr-4 py-2 w-full max-w-md bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm min-w-[180px]">
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="new_order">New Orders</option>
              <option value="payment_received">Payments Verified</option>
              <option value="payment_receipt_uploaded">Receipts Uploaded</option>
              <option value="payment_rejected">Payments Rejected</option>
            </select>
          </div>

          {loading ? <div className="p-6 text-sm text-muted-text">Loading notifications...</div> : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-light-border/50 dark:divide-gray-700/50">
              {filteredNotifications.map((notification) => {
                const typeInfo = notificationTypes[notification.type] || { icon: Bell, color: "bg-gray-100 text-gray-700", label: "Notification" };
                const Icon = typeInfo.icon;
                return (
                  <div key={notification._id} className={`flex items-start gap-4 p-4 ${notification.read ? "" : "bg-amber-50/40 dark:bg-amber-900/10"}`}>
                    <div className={`p-2 rounded-lg ${typeInfo.color} flex-shrink-0`}><Icon className="w-5 h-5" strokeWidth={2} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2"><h4 className="font-medium text-primary-text">{notification.title || typeInfo.label}</h4><span className="text-xs text-muted-text whitespace-nowrap">{new Date(notification.createdAt).toLocaleString()}</span></div>
                      <p className="text-sm text-primary-text mt-1">{notification.message}</p>
                      {notification.data?.orderNumber && <p className="text-xs text-muted-text mt-1">Order: {notification.data.orderNumber}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && <button onClick={() => markAsRead(notification._id)} className="px-3 py-1.5 text-xs font-medium text-primary-forest-green hover:bg-muted rounded-lg">Mark read</button>}
                      <button onClick={() => deleteNotification(notification._id)} className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg">Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div className="py-12 text-center text-muted-text"><Bell className="w-12 h-12 mx-auto text-muted-text/50 mb-4" strokeWidth={1.5} /><p className="text-primary-text font-medium">No notifications</p></div>}
        </div>
      </div>
    </AdminLayout>
  );
}
