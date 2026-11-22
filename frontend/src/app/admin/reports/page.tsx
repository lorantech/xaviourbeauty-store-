"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Download,
  Calendar,
  ChevronDown,
  Loader2,
  FileText,
  BarChart2,
  PieChart as PieChartIcon,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
} from "lucide-react";

const COLORS = ["#172C25", "#223B31", "#C6A66B", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

export default function AdminReports() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [reportType, setReportType] = useState<"sales" | "products" | "customers" | "orders">("sales");

  useEffect(() => {
    if (user?.role === "admin") fetchData();
  }, [user, timeRange, reportType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/reports", { params: { range: timeRange, type: reportType } });
      setData(res.data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value);
  };

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Reports</h1>
            <p className="text-muted-text mt-1">Generate and export detailed business reports</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target as any).value} className="px-4 py-2 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button className="px-4 py-2 bg-primary-forest-green hover:bg-secondary-forest-green text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {(["sales", "products", "customers", "orders"] as const).map((type) => (
            <button key={type} onClick={() => setReportType(type)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${reportType === type ? "bg-primary-forest-green text-white" : "bg-muted hover:bg-muted/80 text-primary-text"}`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5"><div className="h-4 bg-muted rounded w-3/4 mb-2"></div><div className="h-8 bg-muted rounded w-1/2"></div></div>)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-text">Total Revenue</p><p className="text-2xl font-bold text-primary-text mt-1">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(data?.revenue || 0)}</p></div><div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-700 dark:text-emerald-400" strokeWidth={2} /></div></div></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-text">Total Orders</p><p className="text-2xl font-bold text-primary-text mt-1">{data?.totalOrders || 0}</p></div><div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><ShoppingCart className="w-5 h-5 text-blue-700 dark:text-blue-400" strokeWidth={2} /></div></div></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-text">New Customers</p><p className="text-2xl font-bold text-primary-text mt-1">{data?.newCustomers || 0}</p></div><div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Users className="w-5 h-5 text-purple-700 dark:text-purple-400" strokeWidth={2} /></div></div></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-text">Products Sold</p><p className="text-2xl font-bold text-primary-text mt-1">{data?.productsSold || 0}</p></div><div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg"><Package className="w-5 h-5 text-orange-700 dark:text-orange-400" strokeWidth={2} /></div></div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary-text">{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Trend</h2>
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {(["area", "line", "bar"] as const).map((type) => (
                      <button key={type} onClick={() => setChartType(type)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${chartType === type ? "bg-white dark:bg-gray-700 text-primary-forest-green shadow-sm" : "text-muted-text hover:text-primary-text"}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</button>
                    ))}
                  </div>
                </div>
                <div className="h-80">
                  {data?.chartData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#172C25" stopOpacity={0.3} /><stop offset="95%" stopColor="#172C25" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DC" vertical={false} /><XAxis dataKey="name" stroke="#858B84" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#858B84" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${(v/1000).toFixed(0)}k`} /><Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E8E5DC", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={(v: number) => [`₦${new Intl.NumberFormat().format(v)}`, "Revenue"]} /><Area type="monotone" dataKey="value" stroke="#172C25" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-text">No data available</div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-primary-text mb-4">Revenue by Category</h2>
                <div className="h-80">
                  {data?.categoryData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {data.categoryData.map((_: any, i: number) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`₦${new Intl.NumberFormat().format(v)}`, "Revenue"]} contentStyle={{ backgroundColor: "#fff", border: "1px solid #E8E5DC", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-text">No category data</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-primary-text mb-4">Detailed Report Table</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-muted-text uppercase border-b border-light-border dark:border-gray-700">
                      <th className="pb-3">Period</th>
                      <th className="pb-3">Revenue</th>
                      <th className="pb-3">Orders</th>
                      <th className="pb-3">Customers</th>
                      <th className="pb-3">Avg Order</th>
                      <th className="pb-3">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.chartData?.map((d: any, i: number) => (
                      <tr key={i} className="border-b border-light-border/50 dark:border-gray-700/50 hover:bg-muted/50 transition-colors">
                        <td className="py-3 font-medium text-primary-text">{d.name}</td>
                        <td className="py-3 font-medium text-primary-text">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(d.value || 0)}</td>
                        <td className="py-3 text-primary-text">{d.orders || 0}</td>
                        <td className="py-3 text-primary-text">{d.customers || 0}</td>
                        <td className="py-3 text-primary-text">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(d.avgOrder || 0)}</td>
                        <td className="py-3 text-primary-text">{(d.conversion || 0).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
</div>
          </ClientOnly>
        </AdminLayout>
      )
    };
}