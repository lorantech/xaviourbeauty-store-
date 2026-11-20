"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, Area } from "recharts";
import Link from "next/link";
import { AdminLayout } from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Package,
  ShoppingCart,
  Users,
  Package as PackageIcon,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

const statCards = [
  { name: "Total Revenue", key: "revenue", icon: TrendingUp, color: "bg-emerald-500", format: "currency" },
  { name: "Total Orders", key: "orders", icon: ShoppingCart, color: "bg-blue-500", format: "number" },
  { name: "Total Products", key: "products", icon: Package, color: "bg-purple-500", format: "number" },
  { name: "Total Customers", key: "customers", icon: Users, color: "bg-orange-500", format: "number" },
  { name: "Pending Orders", key: "pendingOrders", icon: AlertTriangle, color: "bg-amber-500", format: "number" },
  { name: "Low Stock Items", key: "lowStock", icon: AlertTriangle, color: "bg-red-500", format: "number" },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, chartRes] = await Promise.all([
        api.get("/admin"),
        api.get("/admin/analytics", { params: { range: timeRange } }),
      ]);
      setData(dashboardRes.data);
      setChartData(chartRes.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number, type: string) => {
    if (type === "currency") {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value);
    }
    return new Intl.NumberFormat().format(value);
  };

  if (user?.role !== "admin") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-text">Admin access required.</p>
        </div>
      </AdminLayout>
    );
  }

  const stats = data?.stats;
  const recentOrders = data?.recentOrders || [];
  const bestSelling = data?.bestSelling || [];
  const recentReviews = data?.recentReviews || [];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Dashboard</h1>
            <p className="text-muted-text mt-1">
              Welcome back, {user?.name || "Admin"} · {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/products/new" className="bg-primary-forest-green hover:bg-secondary-forest-green text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Link>
            <Link href="/admin/orders" className="bg-muted hover:bg-muted/80 text-primary-text px-4 py-2.5 rounded-lg font-medium transition-colors">
              View Orders
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-light-border p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                const value = stats?.[stat.key] ?? 0;
                return (
                  <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-text">{stat.name}</p>
                        <p className="text-2xl font-bold text-primary-text mt-1">{formatValue(value, stat.format)}</p>
                      </div>
                      <div className={`p-2.5 rounded-lg ${stat.color}`}>
                        <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary-text">Sales Overview</h2>
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {(["daily", "weekly", "monthly", "yearly"] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                          timeRange === range
                            ? "bg-white dark:bg-gray-700 text-primary-forest-green shadow-sm"
                            : "text-muted-text hover:text-primary-text"
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-72">
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-muted-text">Loading chart...</div>
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#172C25" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#172C25" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DC" vertical={false} />
                        <XAxis dataKey="name" stroke="#858B84" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#858B84" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #E8E5DC", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                          formatter={(value: number) => [`₦${new Intl.NumberFormat().format(value)}`, "Revenue"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#172C25"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-text">No data available for this period</div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary-text">Recent Orders</h2>
                  <Link href="/admin/orders" className="text-sm text-soft-gold hover:underline flex items-center gap-1">
                    View all <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-medium text-muted-text uppercase border-b border-light-border dark:border-gray-700">
                        <th className="pb-3">Order</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.slice(0, 5).map((order: any) => (
                        <tr key={order._id} className="border-b border-light-border/50 dark:border-gray-700/50 hover:bg-muted/50 transition-colors">
                          <td className="py-3 font-medium text-primary-text">{order.orderNumber}</td>
                          <td className="py-3 text-sm text-primary-text">{order.customer?.name || "Guest"}</td>
                          <td className="py-3 font-medium text-primary-text">₦{Number(order.total).toLocaleString()}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                              order.paymentStatus === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-muted-text">{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {recentOrders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-text">No recent orders</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary-text">Top Selling Products</h2>
                  <Link href="/admin/products" className="text-sm text-soft-gold hover:underline flex items-center gap-1">
                    View all <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </Link>
                </div>
                <div className="space-y-4">
                  {bestSelling.slice(0, 5).map((product: any) => (
                    <div key={product._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <PackageIcon className="w-6 h-6 text-muted-text" strokeWidth={2} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-primary-text truncate">{product.name}</p>
                        <p className="text-sm text-muted-text">₦{Number(product.price).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-text">₦{Number(product.price * (product.reviewCount || 0)).toLocaleString()}</p>
                        <p className="text-xs text-muted-text">Revenue</p>
                      </div>
                    </div>
                  ))}
                  {bestSelling.length === 0 && (
                    <div className="py-8 text-center text-muted-text">No best selling products</div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary-text">Recent Reviews</h2>
                  <Link href="/admin/reviews" className="text-sm text-soft-gold hover:underline flex items-center gap-1">
                    View all <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentReviews.slice(0, 5).map((review: any) => (
                    <div key={review._id} className="p-4 rounded-lg border border-light-border dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-primary-text">{review.product?.name || "Product"}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? "text-amber-500 fill-current" : "text-muted-text"}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.78-.57-.38-1.501.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-text mb-2">{review.comment || review.text}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-text">
                        <span>{review.user?.name || "Anonymous"}</span>
                        <span>·</span>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {recentReviews.length === 0 && (
                    <div className="py-8 text-center text-muted-text">No recent reviews</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    )
  );
}