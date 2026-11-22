"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronDown,
  Eye,
  MoreVertical,
  Loader2,
} from "lucide-react";

export default function AdminCustomers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user?.role === "admin") loadCustomers();
  }, [user, currentPage]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage, limit: 20 };
      // Note: backend would need search support; for now we filter client-side
      const res = await api.get("/admin/customers");
      let customersData = res.data.customers || [];
      if (search) {
        customersData = customersData.filter((c: any) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      setCustomers(customersData);
      setTotalPages(Math.ceil(customersData.length / 20));
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") loadCustomers();
  }, [user, currentPage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
  };

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Customers</h1>
            <p className="text-muted-text mt-1">Manage customer accounts and view purchase history</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-4">
          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" strokeWidth={2} />
            <input
              type="search"
              placeholder="Search customers by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full max-w-md bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent"
            />
          </div>

          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-muted-text uppercase border-b border-light-border dark:border-gray-700">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Orders</th>
                    <th className="pb-3">Total Spent</th>
                    <th className="pb-3">Registered</th>
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
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Contact</th>
                      <th className="pb-3">Orders</th>
                      <th className="pb-3">Total Spent</th>
                      <th className="pb-3">Registered</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id} className="border-b border-light-border/50 dark:border-gray-700/50 hover:bg-muted/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-forest-green/10 flex items-center justify-center">
                              <span className="text-primary-forest-green font-medium">
                                {customer.name?.charAt(0).toUpperCase() || "C"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-primary-text">{customer.name}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm text-primary-text">
                            <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" strokeWidth={2} /> {customer.email}</p>
                            {customer.phone && <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" strokeWidth={2} /> {customer.phone}</p>}
                          </div>
                        </td>
                        <td className="text-sm text-primary-text">
                          {customer.orderCount || 0} orders
                        </td>
                        <td className="font-medium text-primary-text">
                          {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(customer.totalSpent || 0)}
                        </td>
                        <td className="text-sm text-muted-text whitespace-nowrap">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text transition-colors"
                            aria-label="View customer details"
                          >
                            <Eye className="w-4 h-4" strokeWidth={2} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-text">
                          <Users className="w-12 h-12 mx-auto text-muted-text/50 mb-4" strokeWidth={1.5} />
                          <p className="text-primary-text font-medium">No customers found</p>
                          <p className="text-sm text-muted-text mt-1">No customers match your search</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {Math.ceil(customers.length / 20) > 1 && (
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
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-muted-text hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-light-border dark:border-gray-700 p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary-text">Customer Details</h2>
                <button onClick={() => setSelectedCustomer(null)} className="p-2 rounded-lg hover:bg-muted text-muted-text">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-primary-forest-green flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">{selectedCustomer.name?.charAt(0).toUpperCase() || "C"}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary-text">{selectedCustomer.name}</h3>
                    <p className="text-muted-text">{selectedCustomer.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-xs font-medium text-muted-text uppercase tracking-wider mb-2">Contact Info</p>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-primary-text"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg> {selectedCustomer.email}</p>
                      {selectedCustomer.phone && <p className="flex items-center gap-2 text-primary-text"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg> {selectedCustomer.phone}</p>}
                    </div>
                  </div>

                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-xs font-medium text-muted-text uppercase tracking-wider mb-2">Account Details</p>
                    <div className="space-y-2 text-sm">
                      <p className="text-primary-text"><strong>Orders:</strong> <span className="text-muted-text">{selectedCustomer.orderCount || 0}</span></p>
                      <p className="text-primary-text"><strong>Total Spent:</strong> <span className="text-muted-text">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(selectedCustomer.totalSpent || 0)}</span></p>
                      <p className="text-primary-text"><strong>Member Since:</strong> <span className="text-muted-text">{new Date(selectedCustomer.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-primary-text mb-3">Recent Orders</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-text text-center py-4">Order history would be loaded here from the orders API</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-light-border dark:border-gray-700 p-4 flex justify-end">
                <button onClick={() => setSelectedCustomer(null)} className="px-4 py-2 bg-primary-forest-green hover:bg-secondary-forest-green text-white rounded-lg font-medium">Close</button>
              </div>
            </div>
          </div>
)}
        </AdminLayout>
      </ClientOnly>
    )
  };
}