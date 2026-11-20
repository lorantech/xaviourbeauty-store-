"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ClientOnly } from "@/components/ClientOnly";
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
  Star,
  Target,
  Info,
  ChevronRight,
} from "lucide-react";

export default function AdminHomepage() {
  const { user } = useAuth();
  const [sections, setSections] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState<any>({});

  useEffect(() => {
    if (user?.role === "admin") loadContent();
  }, [user]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/homepage");
      setSections(res.data || {});
    } catch (error) {
      console.error("Failed to load homepage content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      await api.patch(`/admin/homepage/${section}`, sectionForm);
      setEditSection(null);
      loadContent();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== "admin") return null;

  const sectionsList = [
    { key: "hero", label: "Hero Section", icon: Image },
    { key: "featuredProducts", label: "Featured Products", icon: Star },
    { key: "featuredCategories", label: "Featured Categories", icon: Tag },
    { key: "promoBanners", label: "Promotional Banners", icon: Tag },
    { key: "ctaSection", label: "Call to Action", icon: Target },
    { key: "aboutSection", label: "About Section", icon: Info },
  ];

  return (
    <AdminLayout>
      <ClientOnly>
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Homepage Content</h1>
            <p className="text-muted-text mt-1">Manage your store's homepage sections</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sectionsList.map((section) => {
            const Icon = section.icon;
            const data = sections[section.key] || {};
            const isEditing = editSection === section.key;

            return (
              <div key={section.key} className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-light-border dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-forest-green/10 rounded-lg"><Icon className="w-5 h-5 text-primary-forest-green" strokeWidth={2} /></div>
                    <h3 className="font-semibold text-primary-text">{section.label}</h3>
                  </div>
                  {!isEditing ? (
                    <button onClick={() => { setSectionForm({ ...data }); setEditSection(section.key); }} className="p-2 rounded-lg hover:bg-muted text-muted-text hover:text-primary-text transition-colors"><Edit className="w-4 h-4" strokeWidth={2} /></button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={async () => { await handleSave(section.key); }} disabled={saving} className="px-3 py-1.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save</button>
                      <button onClick={() => setEditSection(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-text"><X className="w-4 h-4" strokeWidth={2} /></button>
                    </div>
                  )}
                </div>

                {section.key === "hero" && (
                  <div className={isEditing ? "p-6 space-y-4" : "p-6"}>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-1.5">Headline</label>
                          <input value={sectionForm.headline || ""} onChange={(e) => setSectionForm({ ...sectionForm, headline: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-1.5">Subheadline</label>
                          <textarea rows={2} value={sectionForm.subheadline || ""} onChange={(e) => setSectionForm({ ...sectionForm, subheadline: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-1.5">CTA Text</label>
                          <input value={sectionForm.ctaText || ""} onChange={(e) => setSectionForm({ ...sectionForm, ctaText: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-1.5">CTA Link</label>
                          <input value={sectionForm.ctaLink || ""} onChange={(e) => setSectionForm({ ...sectionForm, ctaLink: e.target.value })} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-1.5">Background Image</label>
                          <div className="flex items-center gap-4">
                            <div className="relative w-32 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                              {sectionForm.backgroundImage ? <img src={sectionForm.backgroundImage} alt="Preview" className="w-full h-full object-cover" /> : <svg className="w-8 h-8 text-muted-text mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>}
                            </div>
                            <label className="cursor-pointer bg-muted hover:bg-muted/80 px-4 py-2 rounded-lg text-sm font-medium text-primary-text transition-colors">Upload Image<input type="file" accept="image/*" onChange={(e) => e.target.files && setSectionForm({ ...sectionForm, backgroundImage: URL.createObjectURL(e.target.files[0]) })} className="hidden" /></label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {data.headline && <h4 className="text-xl font-semibold text-primary-text">{data.headline}</h4>}
                        {data.subheadline && <p className="text-muted-text">{data.subheadline}</p>}
                        {data.ctaText && <a href={data.ctaLink} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-forest-green hover:bg-secondary-forest-green text-white rounded-lg font-medium transition-colors">{data.ctaText} <ChevronRight className="w-4 h-4" /></a>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-primary-text mb-4">Mobile Preview</h2>
          <div className="max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 overflow-hidden shadow-xl">
            <div className="bg-muted px-4 py-2 flex items-center justify-between">
              <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-amber-500"></div><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
              <div className="text-xs text-muted-text font-mono">xaviourbeautystore.vercel.app</div>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="aspect-[16/9] bg-muted rounded-lg flex items-center justify-center">
                <Image className="w-10 h-10 text-muted-text" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-primary-text text-center">Hero Section</h3>
              <p className="text-muted-text text-sm text-center px-4">Your store's hero section will appear here</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-square bg-muted rounded-lg"></div>
                <div className="aspect-square bg-muted rounded-lg"></div>
              </div>
              <p className="text-muted-text text-sm text-center px-4">Featured Products</p>
            </div>
          </div>
        </div>
      </ClientOnly>
      </AdminLayout>
    )
  );
}