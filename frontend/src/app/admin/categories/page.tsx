"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Edit,
  Trash2,
  Image,
  Loader2,
  ChevronDown,
  Search,
  Save,
  X,
  Camera,
} from "lucide-react";

export default function AdminCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    parentCategory: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") loadCategories();
  }, [user]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/categories/all");
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      alert("Category name is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("isActive", String(form.isActive));
      if (imageFile) formData.append("image", imageFile);
      if (editingCategory) formData.append("parentCategory", form.parentCategory);

      if (editingCategory) {
        await api.patch(`/categories/${editingCategory._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const editCategory = (category: any) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      parentCategory: category.parentCategory || "",
      isActive: category.isActive !== false,
    });
    setImagePreview(category.image || null);
    setShowForm(true);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", image: "", parentCategory: "", isActive: true });
    setImageFile(null);
    setImagePreview(null);
  };

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Categories</h1>
            <p className="text-muted-text mt-1">Manage product categories</p>
          </div>
          <button onClick={() => { setEditingCategory(null); resetForm(); setShowForm(true); }} className="bg-primary-forest-green hover:bg-secondary-forest-green text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            Add Category
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-4">
          <div className="relative max-w-md mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              type="search"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full max-w-md bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-700"></div>
                  <div className="flex-1"><div className="h-4 bg-white dark:bg-gray-700 rounded w-3/4"></div><div className="h-3 bg-white dark:bg-gray-700 rounded w-1/2 mt-2"></div></div>
                  <div className="w-24"><div className="h-6 bg-white dark:bg-gray-700 rounded"></div></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((category) => (
                  <div key={category._id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-light-border dark:border-gray-700 hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7a2 2 0 01-2.828 0l-7-7a2 2 0 010-2.828l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 010-1.414l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 010-1.414l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75" /></svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-primary-text truncate">{category.name}</p>
                      <p className="text-sm text-muted-text truncate">{category.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${category.isActive !== false ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                        {category.isActive !== false ? "Active" : "Inactive"}
                      </span>
                      <button onClick={() => editCategory(category)} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text transition-colors" aria-label="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={() => deleteCategory(category._id)} disabled={deletingId === category._id} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-red-500 transition-colors disabled:opacity-50" aria-label="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="py-12 text-center text-muted-text">
                    <svg className="w-12 h-12 mx-auto text-muted-text/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7a2 2 0 01-2.828 0l-7-7a2 2 0 010-2.828l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75c0 .617.232.837.617.983l.99.99.007.007.014.014.014.014a22.064 22.064 0 010 4.074l-.014.014-.014.014-.014.014-.007.007-.007.007-.99.99a2 2 0 01-.983.617H6a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l-7-7a1 1 0 01-1.414 0l7-7c.512-.512 1.024-.786 1.414-1.06V3a2 2 0 012-2h6a2 2 0 012 2v6.75" /></svg>
                    <p className="text-primary-text font-medium">No categories yet</p>
                    <p className="text-sm text-muted-text mt-1">Create your first category to organize products</p>
                  </div>
                )}
              </div>
            </>
          )}

              {/* Category Form Modal */}
              {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
                    <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-light-border dark:border-gray-700 p-4 flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-primary-text">{editingCategory ? "Edit Category" : "Add Category"}</h2>
                      <button onClick={() => { setShowForm(false); setEditingCategory(null); resetForm(); }} className="p-2 rounded-lg hover:bg-muted text-muted-text"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Category Name *</label>
                        <input required placeholder="Category name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Description</label>
                        <textarea rows={3} placeholder="Category description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Category Image</label>
                        <div className="flex items-center gap-4">
                          <div className="relative w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                            {imagePreview ? (
                              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-8 h-8 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                            )}
                          </div>
                          <div>
                            <input type="file" accept="image/*" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className="hidden" id="category-image-input" />
                            <label htmlFor="category-image-input" className="cursor-pointer bg-muted hover:bg-muted/80 px-4 py-2 rounded-lg text-sm font-medium text-primary-text transition-colors">{imageFile ? "Change Image" : "Upload Image"}</label>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-light-border text-primary-forest-green focus:ring-soft-gold" />
                          <span className="text-sm text-primary-text">Active</span>
                        </label>
                      </div>
                    </form>
                  </div>
                </div>
            )}
        </div>
      </div>
    </AdminLayout>
  );
}