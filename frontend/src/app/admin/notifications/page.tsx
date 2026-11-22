"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Bell,
  ShoppingCart,
  CreditCard,
  AlertTriangle,
  Star,
  MessageSquare,
  Loader2,
  ChevronDown,
  Check,
  X,
  Filter,
  Clock,
} from "lucide-react";

const notificationTypes: Record<string, { icon: any; color: string; label: string }> = {
  new_order: { icon: ShoppingCart, color: "bg-blue-100 text-blue-700", label: "New Order" },
  payment_received: { icon: CreditCard, color: "bg-emerald-100 text-emerald-700", label: "Payment Received" },
  low_stock: { icon: AlertTriangle, color: "bg-amber-100 text-amber-700", label: "Low Stock" },
  new_review: { icon: Star, color: "bg-purple-100 text-purple-700", label: "New Review" },
  new_message: { icon: MessageSquare, color: "bg-orange-100 text-orange-700", label: "New Message" },
};

export default function AdminNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role === "admin") loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/notifications");
      const data = res.data.notifications || [];
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/admin/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/admin/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const filteredNotifications = notifications.filter((n) => filter === "all" || n.type === filter);

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Notifications</h1>
            <p className="text-muted-text mt-1">Stay updated with your store activities</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="px-4 py-2 bg-primary-forest-green hover:bg-secondary-forest-green text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
                <Check className="w-4 h-4" strokeWidth={2} />
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 overflow-hidden">
          <div className="border-b border-light-border dark:border-gray-700 px-4 py-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                <input type="search" placeholder="Search notifications..." className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent" />
              </div>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold min-w-[180px]">
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="new_order">New Orders</option>
                <option value="payment_received">Payments</option>
                <option value="low_stock">Low Stock</option>
                <option value="new_review">Reviews</option>
                <option value="new_message">Messages</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-start gap-4 p-4 border-b border-light-border/50 dark:border-gray-700/50">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0"></div>
                  <div className="flex-1"><div className="h-4 bg-muted rounded w-3/4"></div><div className="h-3 bg-muted rounded w-1/2 mt-2"></div></div>
                  <div className="w-24 text-right"><div className="h-3 bg-muted rounded"></div></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredNotifications.length > 0 ? (
                <div className="divide-y divide-light-border/50 dark:divide-gray-700/50">
                  {filteredNotifications.map((notification) => {
                    const typeInfo = notificationTypes[notification.type] || { icon: Bell, color: "bg-gray-100 text-gray-700", label: "Notification" };
                    const Icon = typeInfo.icon;
                    return (
                      <div key={notification._id} className={"flex items-start gap-4 p-4 transition-colors " + (notification.read ? "" : "bg-blue-50 dark:bg-blue-900")}>
                        <div className={`p-2 rounded-lg ${typeInfo.color} flex-shrink-0`}>
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-primary-text">{typeInfo.label}</h4>
                            <span className="text-xs text-muted-text whitespace-nowrap">{new Date(notification.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-primary-text mt-1">{notification.message}</p>
                          {notification.data && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {Object.entries(notification.data as Record<string, string>).map(([key, value]) => (
                                <span key={key} className="px-2 py-0.5 bg-muted rounded text-xs text-muted-text">{key}: {value}</span>
                              ))}
                            </div>
                          </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button onClick={() => markAsRead(notification._id)} className="px-3 py-1.5 text-xs font-medium text-primary-forest-green hover:bg-primary-forest-green rounded-lg transition-colors">Mark as read</button>
                          )}
                          <button onClick={() => deleteNotification(notification._id)} className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:bg-red-900 rounded-lg transition-colors">Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-text">
                  <Bell className="w-12 h-12 mx-auto text-muted-text/50 mb-4" strokeWidth={1.5} />
                  <p className="text-primary-text font-medium">No notifications</p>
                  <p className="text-sm text-muted-text mt-1">You're all caught up!</p>
                </div>
              )}
            </>
          }
        </div>
    </AdminLayout>
    )
  };
}