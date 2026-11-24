"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Save,
  X,
  Tag,
  Percent,
  Truck,
  Gift,
} from "lucide-react";

const discountTypes = [
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed Amount" },
  { value: "free_shipping", label: "Free Shipping" },
  { value: "buy_x_get_y", label: "Buy X Get Y" },
];

export default function AdminPromotions() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "percentage",
    value: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    code: "",
    usageLimit: 0,
    usagePerCustomer: 1,
    startDate: "",
    endDate: "",
    isActive: true,
    applicableProducts: [] as string[],
    applicableCategories: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === "admin") {
      loadPromotions();
      loadProductsAndCategories();
    }
  }, [user]);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/promotions");
      setPromotions(res.data.promotions || []);
    } catch (error) {
      console.error("Failed to load promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsAndCategories = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products", { params: { limit: 100, status: "published" } }),
        api.get("/categories"),
      ]);
      setProducts(productsRes.data.items || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error("Failed to load products/categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      alert("Name and code are required");
      return;
    }

    try {
      if (editing) {
        await api.patch(`/admin/promotions/${editing._id}`, form);
      } else {
        await api.post("/admin/promotions", form);
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      loadPromotions();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save promotion");
    } finally {
      setSaving(false);
    }
  };

  const editPromotion = (promo: any) => {
    setEditing(promo);
    setForm({
      name: promo.name,
      description: promo.description || "",
      type: promo.type,
      value: promo.value,
      minOrderAmount: promo.minOrderAmount || 0,
      maxDiscount: promo.maxDiscount || 0,
      code: promo.code,
      usageLimit: promo.usageLimit || 0,
      usagePerCustomer: promo.usagePerCustomer || 1,
      startDate: promo.startDate ? promo.startDate.split("T")[0] : "",
      endDate: promo.endDate ? promo.endDate.split("T")[0] : "",
      isActive: promo.isActive !== false,
      applicableProducts: promo.applicableProducts?.map((p: any) => p._id || p) || [],
      applicableCategories: promo.applicableCategories?.map((c: any) => c._id || c) || [],
    });
    setShowForm(true);
  };

  const deletePromotion = async (id: string) => {
    if (!confirm("Delete this promotion?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/promotions/${id}`);
      loadPromotions();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      type: "percentage",
      value: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      code: "",
      usageLimit: 0,
      usagePerCustomer: 1,
      startDate: "",
      endDate: "",
      isActive: true,
      applicableProducts: [],
      applicableCategories: [],
    });
  };

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Promotions & Discounts</h1>
            <p className="text-muted-text mt-1">Create and manage discount codes and promotions</p>
          </div>
          <button onClick={() => { setEditing(null); setForm({ name: "", description: "", type: "percentage", value: 0, minOrderAmount: 0, maxDiscount: 0, code: "", usageLimit: 0, usagePerCustomer: 1, startDate: "", endDate: "", isActive: true, applicableProducts: [], applicableCategories: [] }); setShowForm(true); }} className="bg-primary-forest-green hover:bg-secondary-forest-green text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            Add Promotion
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-4">
          <div className="relative max-w-md mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input type="search" placeholder="Search promotions..." className="pl-10 pr-4 py-2.5 w-full max-w-md bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent" />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 bg-muted rounded-lg border border-light-border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2"><div className="h-4 bg-white dark:bg-gray-700 rounded w-1/3"></div><div className="h-4 bg-white dark:bg-gray-700 rounded w-1/4"></div></div>
                  <div className="h-4 bg-white dark:bg-gray-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {promotions.map((promo) => (
                  <div key={promo._id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-light-border dark:border-gray-700 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${promo.type === "percentage" ? "bg-purple-100 text-purple-700" : promo.type === "fixed" ? "bg-blue-100 text-blue-700" : promo.type === "free_shipping" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {promo.type === "percentage" ? <Percent className="w-5 h-5" strokeWidth={2} /> : promo.type === "fixed" ? <Tag className="w-5 h-5" strokeWidth={2} /> : promo.type === "free_shipping" ? <Truck className="w-5 h-5" strokeWidth={2} /> : <Gift className="w-5 h-5" strokeWidth={2} />}
                      </div>
                      <div>
                        <p className="font-medium text-primary-text">{promo.name}</p>
                        <p className="text-sm text-muted-text">{promo.code}</p>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-text truncate">{promo.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{promo.type.replace("_", " ").toUpperCase()}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{promo.value}{promo.type === "percentage" ? "%" : "₦"}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${promo.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                          {promo.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => editPromotion(promo)} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text transition-colors" aria-label="Edit"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                      <button onClick={() => deletePromotion(promo._id)} disabled={deletingId === promo._id} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-red-500 transition-colors disabled:opacity-50" aria-label="Delete"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button>
                    </div>
                  </div>
                ))}
                {promotions.length === 0 && (
                  <div className="py-12 text-center text-muted-text">
                    <Tag className="w-12 h-12 mx-auto text-muted-text/50 mb-4" strokeWidth={1.5} />
                    <p className="text-primary-text font-medium">No promotions yet</p>
                    <p className="text-sm text-muted-text mt-1">Create your first promotion or discount code</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-light-border dark:border-gray-700 p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary-text">{editing ? "Edit Promotion" : "Create Promotion"}</h2>
                <button onClick={() => { setShowForm(false); setEditing(null); resetForm(); }} className="p-2 rounded-lg hover:bg-muted text-muted-text"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Promotion Name *</label>
                      <input required placeholder="e.g., Summer Sale 2024" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Promo Code *</label>
                      <input required placeholder="SUMMER2024" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Discount Type *</label>
                      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold">
                        {discountTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Discount Value *</label>
                        <input type="number" min="0" step="0.01" required placeholder="0" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Max Discount (₦)</label>
                        <input type="number" min="0" step="0.01" placeholder="0 (no limit)" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Min Order Amount (₦)</label>
                      <input type="number" min="0" step="0.01" placeholder="0 (no minimum)" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Description</label>
                      <textarea rows={3} placeholder="Promotion description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Usage Limit (0 = unlimited)</label>
                        <input type="number" min="0" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Usage Per Customer</label>
                        <input type="number" min="1" value={form.usagePerCustomer} onChange={(e) => setForm({ ...form, usagePerCustomer: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Start Date</label>
                        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">End Date</label>
                        <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-light-border text-primary-forest-green focus:ring-soft-gold" />
                        <span className="text-sm text-primary-text">Active</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Applicable Products</label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {products.slice(0, 20).map((p) => (
                          <label key={p._id} className="flex items-center gap-2 p-2 border border-light-border dark:border-gray-700 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <input type="checkbox" checked={form.applicableProducts.includes(p._id)} onChange={(e) => setForm({ ...form, applicableProducts: e.target.checked ? [...form.applicableProducts, p._id] : form.applicableProducts.filter((id: string) => id !== p._id) })} className="w-4 h-4 rounded border-light-border text-primary-forest-green focus:ring-soft-gold" />
                            <img src={p.images?.[0]} alt={p.name} className="w-8 h-8 rounded object-cover" />
                            <span className="text-sm text-primary-text truncate flex-1">{p.name}</span>
                            <span className="text-sm text-muted-text">₦{Number(p.price).toLocaleString()}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Applicable Categories</label>
                      <div className="space-y-2">
                        {categories.map((c) => (
                          <label key={c._id} className="flex items-center gap-2 p-2 border border-light-border dark:border-gray-700 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                            <input type="checkbox" checked={form.applicableCategories.includes(c._id)} onChange={(e) => setForm({ ...form, applicableCategories: e.target.checked ? [...form.applicableCategories, c._id] : form.applicableCategories.filter((id: string) => id !== c._id) })} className="w-4 h-4 rounded border-light-border text-primary-forest-green focus:ring-soft-gold" />
                            <span className="text-sm text-primary-text">{c.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-light-border dark:border-gray-700">
                  <button type="button" onClick={() => { setShowForm(false); setEditing(null); resetForm(); }} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm font-medium text-primary-text hover:bg-muted transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                    {saving ? "Saving..." : editing ? "Update Promotion" : "Create Promotion"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
