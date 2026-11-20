"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Star,
  Check,
  X,
  Loader2,
  ChevronDown,
  Edit,
  Trash2,
  Image,
  MessageSquare,
  Eye,
} from "lucide-react";

export default function AdminTestimonials() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerRole: "",
    company: "",
    content: "",
    rating: 5,
    image: "",
    videoUrl: "",
    featured: false,
    approved: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") loadTestimonials();
  }, [user]);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const res = await api.get("/testimonials");
      setTestimonials(res.data.testimonials || []);
    } catch (error) {
      console.error("Failed to load testimonials:", error);
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
    if (!form.customerName || !form.content) {
      alert("Name and content are required");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (imageFile) formData.append("image", imageFile);

      if (editing) {
        await api.patch(`/testimonials/${editing._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/testimonials", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      loadTestimonials();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const editTestimonial = (testimonial: any) => {
    setEditing(testimonial);
    setForm({
      customerName: testimonial.customerName,
      customerRole: testimonial.customerRole || "",
      company: testimonial.company || "",
      content: testimonial.content,
      rating: testimonial.rating || 5,
      image: testimonial.image || "",
      videoUrl: testimonial.videoUrl || "",
      featured: testimonial.featured || false,
      approved: testimonial.approved !== false,
    });
    setImagePreview(testimonial.image || null);
    setShowForm(true);
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await api.delete(`/testimonials/${id}`);
      loadTestimonials();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete");
    }
  };

  const resetForm = () => {
    setForm({ customerName: "", customerRole: "", company: "", content: "", rating: 5, image: "", videoUrl: "", featured: false, approved: true });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Testimonials</h1>
            <p className="text-muted-text mt-1">Manage customer testimonials and reviews</p>
          </div>
          <button onClick={() => { setEditing(null); setForm({ customerName: "", customerRole: "", company: "", content: "", rating: 5, image: "", videoUrl: "", featured: false, approved: true }); setShowForm(true); }} className="bg-primary-forest-green hover:bg-secondary-forest-green text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 4v16m8-8H4" /></svg>
            Add Testimonial
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-4">
          <div className="relative max-w-md mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input type="search" placeholder="Search testimonials..." className="pl-10 pr-4 py-2.5 w-full max-w-md bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent" />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-700"></div>
                  <div className="flex-1"><div className="h-4 bg-white dark:bg-gray-700 rounded w-3/4"></div><div className="h-3 bg-white dark:bg-gray-700 rounded w-1/2 mt-2"></div></div>
                  <div className="w-24"><div className="h-6 bg-white dark:bg-gray-700 rounded"></div></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {testimonials.map((t) => (
                  <div key={t._id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-light-border dark:border-gray-700 hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {t.image ? <img src={t.image} alt={t.customerName} className="w-full h-full object-cover" /> : <Star className="w-6 h-6 text-muted-text" strokeWidth={2} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-primary-text">{t.customerName}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{'★'.repeat(t.rating || 5)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {t.approved ? "Approved" : "Pending"}
                        </span>
                        {t.featured && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Featured</span>}
                      </div>
                      <p className="text-sm text-muted-text truncate">{t.content}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => editTestimonial(t)} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text transition-colors" aria-label="Edit"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                      <button onClick={() => deleteTestimonial(t._id)} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-red-500 transition-colors" aria-label="Delete"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></button>
                    </div>
                  </div>
                ))}
                {testimonials.length === 0 && (
                  <div className="py-12 text-center text-muted-text">
                    <Star className="w-12 h-12 mx-auto text-muted-text/50 mb-4" strokeWidth={1.5} />
                    <p className="text-primary-text font-medium">No testimonials yet</p>
                    <p className="text-sm text-muted-text mt-1">Add your first customer testimonial</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-light-border dark:border-gray-700 p-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary-text">{editing ? "Edit Testimonial" : "Add Testimonial"}</h2>
                <button onClick={() => { setShowForm(false); setEditing(null); resetForm(); }} className="p-2 rounded-lg hover:bg-muted text-muted-text"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-text mb-1.5">Customer Name *</label>
                    <input required placeholder="Customer name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-text mb-1.5">Role/Title</label>
                    <input placeholder="e.g., Business Owner" value={form.customerRole} onChange={(e) => setForm({ ...form, customerRole: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1.5">Company</label>
                  <input placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1.5">Testimonial Content *</label>
                  <textarea rows={4} required placeholder="Testimonial text..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-text mb-1.5">Rating</label>
                    <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold">
                      {[5,4,3,2,1].map((r) => <option key={r} value={r}>{'★'.repeat(r)} {r} Star{r !== 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-text mb-1.5">Video URL (optional)</label>
                    <input type="url" placeholder="YouTube/Vimeo URL" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1.5">Customer Image</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <svg className="w-8 h-8 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>}
                    </div>
                    <div>
                      <input type="file" accept="image/*" onChange={(e) => e.target.files && (setImageFile(e.target.files[0]), setImagePreview(URL.createObjectURL(e.target.files[0])))} className="hidden" id="testimonial-image-input" />
                      <label htmlFor="testimonial-image-input" className="cursor-pointer bg-muted hover:bg-muted/80 px-4 py-2 rounded-lg text-sm font-medium text-primary-text transition-colors">Upload Image</label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded border-light-border text-primary-forest-green focus:ring-soft-gold" />
                    <span className="text-sm text-primary-text">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.approved} onChange={(e) => setForm({ ...form, approved: e.target.checked })} className="w-4 h-4 rounded border-light-border text-primary-forest-green focus:ring-soft-gold" />
                    <span className="text-sm text-primary-text">Approved</span>
                  </label>
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