"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Image,
  Tag,
  Loader2,
  ChevronDown,
  X,
  Camera,
  Upload,
  Save,
  AlertTriangle,
} from "lucide-react";

const statusOptions = ["draft", "published", "archived"];
const statusColors = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  archived: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

function AdminProductsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    originalPrice: "",
    stockQuantity: 0,
    sku: "",
    status: "draft",
    featured: false,
    bestSeller: false,
    newArrival: false,
    images: [] as string[],
    specifications: [{ key: "", value: "" }],
    variants: [{ name: "", options: [] }],
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products", { params: { limit: 100, status: statusFilter || undefined, category: categoryFilter || undefined, includeAll: "true" } }),
        api.get("/categories/all"),
      ]);
      let productsData = productsRes.data.items || [];
      if (search) {
        productsData = productsData.filter((p: any) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku?.toLowerCase().includes(search.toLowerCase())
        );
      }
      setProducts(productsData);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, search, statusFilter, categoryFilter]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditingProduct(null);
      resetForm();
      setShowForm(true);
      router.replace("/admin/products");
    }
  }, [searchParams, router]);

  const handleImageUpload = async (files: FileList) => {
    const newFiles = Array.from(files);
    if (images.length + newFiles.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const preview = URL.createObjectURL(file);
      setImagePreviews((prev) => [...prev, preview]);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price) {
      alert("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((image) => formData.append("files", image));
        const uploadResponse = await api.post("/upload/images", formData);
        uploadedImageUrls = uploadResponse.data.urls;
      }

      const productData = {
        ...form,
        images: [...form.images, ...uploadedImageUrls],
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        stockQuantity: Number(form.stockQuantity),
        featured: form.featured,
        bestSeller: form.bestSeller,
        newArrival: form.newArrival,
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct._id}`, {
          ...productData,
        });
      } else {
        await api.post("/products", productData);
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      load();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save product");
    } finally {
      setUploading(false);
    }
  };

  const editProduct = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category?._id || product.category,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      stockQuantity: product.stockQuantity,
      sku: product.sku || "",
      status: product.status,
      featured: product.featured,
      bestSeller: product.bestSeller,
      newArrival: product.newArrival,
      images: product.images || [],
      specifications: product.specifications || [{ key: "", value: "" }],
      variants: product.variants || [{ name: "", options: [] }],
    });
    setImages([]);
    setImagePreviews([]);
    setShowForm(true);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeletingId(id);
    setMessage(null);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      if (editingProduct?._id === id) {
        setShowForm(false);
        setEditingProduct(null);
        resetForm();
      }
      setDeleteConfirmId(null);
      setMessage({ type: "success", text: "Product deleted successfully." });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to delete product" });
    } finally {
      setDeletingId(null);
    }
  };

  const deleteProduct = (id: string) => {
    setDeleteConfirmId(id);
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: categories[0]?._id || "",
      price: "",
      originalPrice: "",
      stockQuantity: 0,
      sku: "",
      status: "draft",
      featured: false,
      bestSeller: false,
      newArrival: false,
      images: [],
      specifications: [{ key: "", value: "" }],
      variants: [{ name: "", options: [] }],
    });
    setImages([]);
    setImagePreviews([]);
  };

  const addSpec = () => setForm((prev) => ({ ...prev, specifications: [...prev.specifications, { key: "", value: "" }] }));
  const removeSpec = (index: number) => setForm((prev) => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));
  const addVariant = () => setForm((prev) => ({ ...prev, variants: [...prev.variants, { name: "", options: [] }] }));
  const removeVariant = (index: number) => setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Products</h1>
            <p className="text-muted-text mt-1">Manage your product catalog</p>
          </div>
          <button onClick={() => { setEditingProduct(null); resetForm(); setShowForm(true); }} className="bg-primary-forest-green hover:bg-secondary-forest-green text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-4">
          {message && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {message.text}
            </div>
          )}
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
              >
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-muted-text uppercase border-b border-light-border dark:border-gray-700">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-light-border/50 dark:border-gray-700/50 animate-pulse">
                      <td className="py-4"><div className="h-4 bg-muted rounded w-3/4"></div></td>
                      <td className="py-4"><div className="h-4 bg-muted rounded w-1/2"></div></td>
                      <td className="py-4"><div className="h-4 bg-muted rounded w-1/3"></div></td>
                      <td className="py-4"><div className="h-4 bg-muted rounded w-1/4"></div></td>
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
                      <th className="pb-3">Product</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Stock</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id} className="border-b border-light-border/50 dark:border-gray-700/50 hover:bg-muted/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <svg className="w-6 h-6 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-primary-text truncate max-w-xs">{product.name}</p>
                              <p className="text-xs text-muted-text">{product.sku || "No SKU"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm text-primary-text">{product.category?.name || "Uncategorized"}</td>
                        <td className="font-medium text-primary-text">₦{Number(product.price).toLocaleString()}</td>
                        <td>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.stockQuantity < 5 && product.stockQuantity > 0 ? "bg-amber-100 text-amber-700" : product.stockQuantity === 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {product.stockQuantity} in stock
                          </span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status as keyof typeof statusColors] || statusColors.draft}`}>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button onClick={() => editProduct(product)} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text transition-colors" aria-label="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </button>
                            <button onClick={() => deleteProduct(product._id)} disabled={deletingId === product._id} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-red-500 transition-colors disabled:opacity-50" aria-label="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-muted-text">
                          <svg className="w-12 h-12 mx-auto text-muted-text/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <p className="text-primary-text font-medium">No products found</p>
                          <p className="text-sm text-muted-text mt-1">Get started by adding your first product</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {products.length > 20 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-muted-text hover:bg-muted transition-colors">Previous</button>
                  <button className="px-3 py-1.5 bg-primary-forest-green text-white rounded-lg text-sm font-medium">1</button>
                  <button className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-muted-text hover:bg-muted transition-colors">Next</button>
                </div>
              )}
            </>
          )}
        </div>

        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 border border-light-border dark:border-gray-700">
              <h3 className="text-lg font-semibold text-primary-text">Delete Product</h3>
              <p className="text-sm text-muted-text mt-2">Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button type="button" onClick={() => setDeleteConfirmId(null)} disabled={!!deletingId} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm font-medium text-primary-text hover:bg-muted transition-colors disabled:opacity-50">Cancel</button>
                <button type="button" onClick={confirmDeleteProduct} disabled={!!deletingId} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                  {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deletingId ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-light-border dark:border-gray-700 p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary-text">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                <button onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }} className="p-2 rounded-lg hover:bg-muted text-muted-text">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Product Name *</label>
                      <input required placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">SKU</label>
                      <input placeholder="SKU (optional)" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Category *</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" required>
                        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Price (₦) *</label>
                        <input type="number" min="0" step="0.01" required placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Original Price (₦)</label>
                        <input type="number" min="0" step="0.01" placeholder="0.00" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Stock Quantity *</label>
                      <input type="number" min="0" required placeholder="0" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Status</label>
                      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold">
                        {statusOptions.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Description</label>
                      <textarea rows={4} placeholder="Product description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Images</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                        {form.images.map((imageUrl, index) => (
                          <div key={`existing-${imageUrl}`} className="relative aspect-square rounded-lg overflow-hidden border border-light-border dark:border-gray-700">
                            <img src={imageUrl} alt={`Product image ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setForm((prev) => ({
                                ...prev,
                                images: prev.images.filter((_, imageIndex) => imageIndex !== index),
                              }))}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                              aria-label="Remove existing image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-light-border dark:border-gray-700">
                            <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600">
                              <svg className="w-3 h-3 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                          </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-light-border dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-soft-gold hover:bg-muted transition-colors">
                          <Camera className="w-8 h-8 text-muted-text mb-1" strokeWidth={2} />
                          <span className="text-xs text-muted-text">Add Images</span>
                          <input type="file" accept="image/*" multiple onChange={(e) => e.target.files && handleImageUpload(e.target.files)} className="hidden" />
                        </label>
                      </div>
                      {images.length > 0 && <p className="text-xs text-muted-text mt-1">{images.length} new image(s) to upload</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded border-light-border text-primary-forest-green focus:ring-soft-gold" />
                        <span className="text-sm text-primary-text">Featured Product</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={form.bestSeller} onChange={(e) => setForm({ ...form, bestSeller: e.target.checked })} className="w-4 h-4 rounded border-light-border text-primary-forest-green focus:ring-soft-gold" />
                        <span className="text-sm text-primary-text">Best Seller</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={form.newArrival} onChange={(e) => setForm({ ...form, newArrival: e.target.checked })} className="w-4 h-4 rounded border-light-border text-primary-forest-green focus:ring-soft-gold" />
                        <span className="text-sm text-primary-text">New Arrival</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-light-border dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      {editingProduct && (
                        <button type="button" onClick={() => deleteProduct(editingProduct._id)} disabled={deletingId === editingProduct._id} className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50">
                          <Trash2 className="w-4 h-4" />
                          Delete Product
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm font-medium text-primary-text hover:bg-muted transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={uploading} className="px-4 py-2.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {uploading ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      </AdminLayout>
  );
}

export default function AdminProducts() {
  return (
    <Suspense fallback={<AdminLayout><div className="p-6 text-sm text-muted-text">Loading products...</div></AdminLayout>}>
      <AdminProductsContent />
    </Suspense>
  );
}