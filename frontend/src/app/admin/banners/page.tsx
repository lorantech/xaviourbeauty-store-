"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Edit,
  Trash2,
  Image,
  Eye,
  Loader2,
  ChevronDown,
  Save,
  X,
  Camera,
  ArrowUp,
  ArrowDown,
  Monitor,
  Smartphone,
} from "lucide-react";

export default function AdminBanners() {
  const { user } = useAuth();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    mobileImage: "",
    link: "",
    ctaText: "",
    ctaLink: "",
    position: "hero",
    device: "both",
    startDate: "",
    endDate: "",
    isActive: true,
    order: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") loadBanners();
  }, [user]);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/banners");
      setBanners(res.data.banners || []);
    } catch (error) {
      console.error("Failed to load banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (field === "image") {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        setMobileImageFile(file);
        setMobileImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      alert("Title is required");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
      if (imageFile) formData.append("image", imageFile);
      if (mobileImageFile) formData.append("mobileImage", mobileImageFile);

      if (editing) {
        await api.patch(`/admin/banners/${editing._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/admin/banners", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      loadBanners();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const editBanner = (banner: any) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      image: banner.image || "",
      mobileImage: banner.mobileImage || "",
      link: banner.link || "",
      ctaText: banner.ctaText || "",
      ctaLink: banner.ctaLink || "",
      position: banner.position || "hero",
      device: banner.device || "both",
      startDate: banner.startDate ? banner.startDate.split("T")[0] : "",
      endDate: banner.endDate ? banner.endDate.split("T")[0] : "",
      isActive: banner.isActive !== false,
      order: banner.order || 0,
    });
    setImagePreview(banner.image || null);
    setMobileImagePreview(banner.mobileImage || null);
    setShowForm(true);
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/banners/${id}`);
      loadBanners();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      subtitle: "",
      description: "",
      image: "",
      mobileImage: "",
      link: "",
      ctaText: "",
      ctaLink: "",
      position: "hero",
      device: "both",
      startDate: "",
      endDate: "",
      isActive: true,
      order: 0,
    });
    setImageFile(null);
    setImagePreview(null);
    setMobileImageFile(null);
    setMobileImagePreview(null);
  };

  const handleImageUpload = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (field === "image") {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        setMobileImageFile(file);
        setMobileImagePreview(URL.createObjectURL(file));
      }
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Promotional Banners</h1>
            <p className="text-muted-text mt-1">Manage promotional banners and hero sections</p>
          </div>
          <button onClick={() => { setEditing(null); setForm({ title: "", subtitle: "", description: "", image: "", mobileImage: "", link: "", ctaText: "", ctaLink: "", position: "hero", device: "both", startDate: "", endDate: "", isActive: true, order: 0 }); setShowForm(true); }} className="bg-primary-forest-green hover:bg-secondary-forest-green text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            Add Banner
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-4">
          <div className="relative max-w-md mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input type="search" placeholder="Search banners..." className="pl-10 pr-4 py-2.5 w-full max-w-md bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent" />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-20 h-12 rounded-lg bg-white dark:bg-gray-700"></div>
                  <div className="flex-1"><div className="h-4 bg-white dark:bg-gray-700 rounded w-3/4"></div><div className="h-3 bg-white dark:bg-gray-700 rounded w-1/2 mt-2"></div></div>
                  <div className="w-24"><div className="h-6 bg-white dark:bg-gray-700 rounded"></div></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {banners.map((banner) => (
                  <div key={banner._id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-light-border dark:border-gray-700 hover:bg-muted/50 transition-colors">
                    <div className="w-20 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {banner.image ? <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" /> : <svg className="w-6 h-6 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-primary-text truncate">{banner.title}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${banner.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{banner.position}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{banner.device}</span>
                      </div>
                      <p className="text-sm text-muted-text truncate">{banner.subtitle || banner.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => editBanner(banner)} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text transition-colors" aria-label="Edit"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                      <button onClick={() => deleteBanner(banner._id)} disabled={deletingId === banner._id} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-red-500 transition-colors disabled:opacity-50" aria-label="Delete"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button>
                    </div>
                  </div>
                ))}
                {banners.length === 0 && (
                  <div className="py-12 text-center text-muted-text">
                    <svg className="w-12 h-12 mx-auto text-muted-text/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                    <p className="text-primary-text font-medium">No banners yet</p>
                    <p className="text-sm text-muted-text mt-1">Create your first promotional banner</p>
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
                <h2 className="text-xl font-semibold text-primary-text">{editing ? "Edit Banner" : "Add Banner"}</h2>
                <button onClick={() => { setShowForm(false); setEditing(null); resetForm(); }} className="p-2 rounded-lg hover:bg-muted text-muted-text"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Title *</label>
                      <input required placeholder="Banner title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Subtitle</label>
                      <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Description</label>
                      <textarea rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">CTA Text</label>
                      <input placeholder="Shop Now" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">CTA Link</label>
                      <input type="url" placeholder="https://example.com" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Link</label>
                      <input type="url" placeholder="https://example.com" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Position</label>
                      <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold">
                        <option value="hero">Hero Section</option>
                        <option value="top">Top Banner</option>
                        <option value="middle">Middle Section</option>
                        <option value="bottom">Bottom Banner</option>
                        <option value="sidebar">Sidebar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Device Target</label>
                      <select value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold">
                        <option value="both">Both Desktop & Mobile</option>
                        <option value="desktop">Desktop Only</option>
                        <option value="mobile">Mobile Only</option>
                      </select>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Display Order</label>
                        <input type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded border-light-border text-primary-forest-green focus:ring-soft-gold" />
                          <span className="text-sm text-primary-text">Active</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Desktop Image</label>
                      <div className="flex items-center gap-4">
                        <div className="relative w-32 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                          {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <svg className="w-8 h-8 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>}
                        </div>
                        <div>
                          <input type="file" accept="image/*" onChange={(e) => e.target.files && (setImageFile(e.target.files[0]), setImagePreview(URL.createObjectURL(e.target.files[0])))} className="hidden" id="banner-image-input" />
                          <label htmlFor="banner-image-input" className="cursor-pointer bg-muted hover:bg-muted/80 px-4 py-2 rounded-lg text-sm font-medium text-primary-text transition-colors">{imageFile ? "Change Image" : "Upload Image"}</label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Mobile Image (Optional)</label>
                      <div className="flex items-center gap-4">
                        <div className="relative w-32 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                          {mobileImagePreview ? <img src={mobileImagePreview} alt="Preview" className="w-full h-full object-cover" /> : <Monitor className="w-8 h-8 text-muted-text mx-auto" strokeWidth={1.5} />}
                        </div>
                        <div>
                          <input type="file" accept="image/*" onChange={(e) => e.target.files && (setMobileImageFile(e.target.files[0]), setMobileImagePreview(URL.createObjectURL(e.target.files[0])))} className="hidden" id="mobile-image-input" />
                          <label htmlFor="mobile-image-input" className="cursor-pointer bg-muted hover:bg-muted/80 px-4 py-2 rounded-lg text-sm font-medium text-primary-text transition-colors">{mobileImageFile ? "Change Image" : "Upload Image"}</label>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-light-border dark:border-gray-700">
                      <button type="button" onClick={() => { setShowForm(false); setEditing(null); resetForm(); }} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm font-medium text-primary-text hover:bg-muted transition-colors">Cancel</button>
                      <button type="submit" disabled={saving} className="px-4 py-2.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                        {saving ? "Saving..." : editing ? "Update" : "Create"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </AdminLayout>
        )
      );
}