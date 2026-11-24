"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import type { PieLabelRenderProps, TooltipValueType } from "recharts";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  ChevronDown,
  Loader2,
  Download,
  BarChart2,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";

const COLORS = ["#172C25", "#223B31", "#C6A66B", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];
const formatRevenueTooltip = (value: TooltipValueType | undefined): [string, string] => [
  value === undefined ? "N/A" : `\u20a6${new Intl.NumberFormat().format(Number(value))}`,
  "Revenue",
];

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [chartType, setChartType] = useState<"bar" | "line" | "area">("area");

  useEffect(() => {
    if (user?.role === "admin") fetchData();
  }, [user, timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/analytics", { params: { range: timeRange } });
      setData(res.data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(value);
  };

  const renderChart = () => {
    if (!data?.chartData?.length) {
      return <div className="h-full flex items-center justify-center text-muted-text">No data available</div>;
    }

    if (chartType === "area") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#172C25" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#172C25" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DC" vertical={false} />
            <XAxis dataKey="name" stroke="#858B84" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#858B84" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `₦${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E8E5DC", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={formatRevenueTooltip} />
            <Area type="monotone" dataKey="revenue" stroke="#172C25" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === "line") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DC" vertical={false} />
            <XAxis dataKey="name" stroke="#858B84" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#858B84" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `₦${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E8E5DC", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={formatRevenueTooltip} />
            <Line type="monotone" dataKey="revenue" stroke="#172C25" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DC" vertical={false} />
          <XAxis dataKey="name" stroke="#858B84" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#858B84" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `₦${(v/1000).toFixed(0)}k`} />
          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #E8E5DC", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} formatter={formatRevenueTooltip} />
          <Bar dataKey="revenue" fill="#172C25" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Sales Analytics</h1>
            <p className="text-muted-text mt-1">Track your store performance and trends</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(["daily", "weekly", "monthly", "yearly"] as const).map((range) => (
                <button key={range} onClick={() => setTimeRange(range)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === range ? "bg-white dark:bg-gray-700 text-primary-forest-green shadow-sm" : "text-muted-text hover:text-primary-text"}`}>{range.charAt(0).toUpperCase() + range.slice(1)}</button>
              ))}
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(["area", "line", "bar"] as const).map((type) => (
                <button key={type} onClick={() => setChartType(type)} className={`p-2 rounded transition-all ${chartType === type ? "bg-white dark:bg-gray-700 text-primary-forest-green shadow-sm" : "text-muted-text hover:text-primary-text"}`} aria-label={type}>
                  {type === "area" ? <AreaChartIcon className="w-4 h-4" strokeWidth={2} /> : type === "line" ? <LineChartIcon className="w-4 h-4" strokeWidth={2} /> : <BarChart2 className="w-4 h-4" strokeWidth={2} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5"><div className="h-4 bg-muted rounded w-3/4 mb-2"></div><div className="h-8 bg-muted rounded w-1/2"></div></div>)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-text">Total Revenue</p><p className="text-2xl font-bold text-primary-text mt-1">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(data?.revenue || 0)}</p></div><div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-700 dark:text-emerald-400" strokeWidth={2} /></div></div></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-text">Total Orders</p><p className="text-2xl font-bold text-primary-text mt-1">{data?.totalOrders || 0}</p></div><div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><ShoppingCart className="w-5 h-5 text-blue-700 dark:text-blue-400" strokeWidth={2} /></div></div></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-text">Avg Order Value</p><p className="text-2xl font-bold text-primary-text mt-1">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(data?.avgOrderValue || 0)}</p></div><div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><DollarSign className="w-5 h-5 text-purple-700 dark:text-purple-400" strokeWidth={2} /></div></div></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-text">Conversion Rate</p><p className="text-2xl font-bold text-primary-text mt-1">{(data?.conversionRate || 0).toFixed(1)}%</p></div><div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg"><TrendingUp className="w-5 h-5 text-orange-700 dark:text-orange-400" strokeWidth={2} /></div></div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary-text">Revenue Trend</h2>
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {(["area", "line", "bar"] as const).map((type) => (
                      <button key={type} onClick={() => setChartType(type)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${chartType === type ? "bg-white dark:bg-gray-700 text-primary-forest-green shadow-sm" : "text-muted-text hover:text-primary-text"}`}>{type.charAt(0).toUpperCase() + type.slice(1)}</button>
                    ))}
                  </div>
                </div>
                <div className="h-80">
                  {renderChart()}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary-text">Revenue by Category</h2>
                </div>
                <div className="h-80">
                  {data?.categoryData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="revenue" nameKey="name" label={({ name, percent }: PieLabelRenderProps) => percent === undefined ? name : `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {data.categoryData.map((_: any, i: number) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={formatRevenueTooltip} contentStyle={{ backgroundColor: "#fff", border: "1px solid #E8E5DC", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-text">No category data available</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-primary-text mb-4">Top Products by Revenue</h2>
                <div className="space-y-3">
                  {data?.topProducts?.slice(0, 10).map((p: any, i: number) => (
                    <div key={p._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                      <span className="w-8 h-8 rounded-full bg-primary-forest-green/10 flex items-center justify-center text-primary-forest-green font-bold text-sm">{i + 1}</span>
                      <div className="flex-1 min-w-0"><p className="font-medium text-primary-text truncate">{p.name}</p><p className="text-xs text-muted-text">₦{Number(p.revenue).toLocaleString()}</p></div>
                      <span className="font-semibold text-primary-text">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-primary-text mb-4">Orders by Status</h2>
                <div className="space-y-3">
                  {data?.orderStatusData?.map((s: any) => (
                    <div key={s._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary-forest-green" />
                        <span className="font-medium text-primary-text capitalize">{s._id.replace(/_/g, " ")}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-text">{s.count}</p>
                        <p className="text-xs text-muted-text">{s.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}