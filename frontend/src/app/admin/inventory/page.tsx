"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ClientOnly } from "@/components/ClientOnly";
import {
  Search,
  AlertTriangle,
  Package,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function AdminInventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("stock");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") loadProducts();
  }, [user]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products", { params: { limit: 200, status: "published" } });
      setProducts(res.data.items || []);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (product: any, newStock: number) => {
    setSaving(true);
    try {
      await api.patch(`/products/${product._id}`, { stockQuantity: newStock });
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
  };

  const getStockStatus = (product: any) => {
    if (product.stockQuantity === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-700", icon: AlertCircle };
    if (product.stockQuantity < 5) return { label: "Low Stock", color: "bg-amber-100 text-amber-700", icon: AlertTriangle };
    return { label: "In Stock", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle };
  };

  const filteredProducts = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => {
      if (stockFilter === "out") return p.stockQuantity === 0;
      if (stockFilter === "low") return p.stockQuantity > 0 && p.stockQuantity < 5;
      if (stockFilter === "in") return p.stockQuantity >= 5;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount);
  };

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary-text">Inventory Management</h1>
              <p className="text-muted-text mt-1">Track stock levels and manage inventory</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-text">Total Products</p>
                  <p className="text-2xl font-bold text-primary-text mt-1">{products.length}</p>
                </div>
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <Package className="w-5 h-5 text-emerald-700 dark:text-emerald-400" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-text">In Stock</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{products.filter(p => p.stockQuantity >= 5).length}</p>
                </div>
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-text">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-700 mt-1">{products.filter(p => p.stockQuantity > 0 && p.stockQuantity < 5).length}</p>
                </div>
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-text">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-700 mt-1">{products.filter(p => p.stockQuantity === 0).length}</p>
                </div>
                <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-400" strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" strokeWidth={2} />
                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                >
                  <option value="all">All Stock</option>
                  <option value="in">In Stock (5+)</option>
                  <option value="low">Low Stock (1-4)</option>
                  <option value="out">Out of Stock (0)</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                >
                  <option value="stock">Stock Level</option>
                  <option value="name">Product Name</option>
                  <option value="price">Price</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-muted-text hover:bg-muted transition-colors"
                  aria-label={sortOrder === "asc" ? "Sort descending" : "Sort ascending"}
                >
                  <ChevronDown className={`w-5 h-5 ${sortOrder === "desc" ? "rotate-180" : ""}`} strokeWidth={2} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-muted-text uppercase border-b border-light-border dark:border-gray-700">
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Stock</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Value</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-light-border/50 dark:border-gray-700/50 animate-pulse">
                        <td className="py-4"><div className="h-4 bg-muted rounded w-3/4"></div></td>
                        <td className="py-4"><div className="h-4 bg-muted rounded w-1/4"></div></td>
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
                        <th className="pb-3">
                          <button
                            onClick={() => setSortBy("name")}
                            className="flex items-center gap-1 hover:text-primary-text"
                          >
                            Product {sortBy === "name" && (sortOrder === "asc" ? <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} /> : <ChevronDown className="w-3.5 h-3.5 rotate-180" strokeWidth={2} />)}
                          </button>
                        </th>
                        <th className="pb-3">
                          <button
                            onClick={() => setSortBy("stock")}
                            className="flex items-center gap-1 hover:text-primary-text"
                          >
                            Stock {sortBy === "stock" && (sortOrder === "asc" ? <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} /> : <ChevronDown className="w-3.5 h-3.5 rotate-180" strokeWidth={2} />)}
                          </button>
                        </th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3">Stock Value</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const stock = product.stockQuantity;
                        return (
                          <tr key={product._id} className="border-b border-light-border/50 dark:border-gray-700/50 hover:bg-muted/50 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {product.images?.[0] ? (
                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <svg className="w-5 h-5 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-primary-text truncate max-w-xs">{product.name}</p>
                                  <p className="text-xs text-muted-text">{product.sku || "No SKU"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="font-mono text-sm font-medium text-primary-text">{product.stockQuantity}</td>
                            <td>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                product.stockQuantity === 0 ? "bg-red-100 text-red-700" :
                                product.stockQuantity < 5 ? "bg-amber-100 text-amber-700" :
                                "bg-emerald-100 text-emerald-700"
                              }`}>
                                {product.stockQuantity === 0 ? "Out of Stock" : product.stockQuantity < 5 ? "Low Stock" : "In Stock"}
                              </span>
                            </td>
                            <td className="font-medium text-primary-text">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(product.price)}</td>
                            <td className="font-medium text-primary-text">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(product.price * product.stockQuantity)}</td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                value={0}
                                onChange={(e) => {
                                  const newStock = Number(e.target.value);
                                  if (newStock !== undefined) handleStockUpdate(product, newStock);
                                }}
                                className="w-20 px-2 py-1.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text text-right focus:outline-none focus:ring-2 focus:ring-soft-gold"
                                placeholder={product.stockQuantity.toString()}
                              />
                            </td>
                          </tr>
)}
                        {products.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted-text">
                              <svg className="w-12 h-12 mx-auto text-muted-text/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              <p className="text-primary-text font-medium">No products in inventory</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>

      </AdminLayout>
    )
  };
}
