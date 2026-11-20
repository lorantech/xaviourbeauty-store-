"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ClientOnly } from "@/components/ClientOnly";
import {
  Edit,
  Save,
  X,
  Image,
  Video,
  Link as LinkIcon,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Loader2,
  Camera,
  Play,
  Link2,
  Save as SaveIcon,
} from "lucide-react";

export default function AdminCEO() {
  const { user } = useAuth();
  const [ceo, setCeo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    title: "",
    bio: "",
    welcomeMessage: "",
    vision: "",
    mission: "",
    profileImage: "",
    videoUrl: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      linkedin: "",
    },
    announcements: [{ title: "", content: "", date: new Date().toISOString().split("T")[0] }],
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === "admin") loadCEO();
  }, [user]);

  const loadCEO = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ceo-corner");
      const data = res.data;
      if (data) {
        setCeo(data);
        setForm({
          name: data.name || "",
          title: data.title || "",
          bio: data.bio || "",
          welcomeMessage: data.welcomeMessage || "",
          vision: data.vision || "",
          mission: data.mission || "",
          profileImage: data.profileImage || "",
          videoUrl: data.videoUrl || "",
          socialLinks: data.socialLinks || {
            facebook: "",
            instagram: "",
            twitter: "",
            youtube: "",
            linkedin: "",
          },
          announcements: data.announcements || [{ title: "", content: "", date: new Date().toISOString().split("T")[0] }],
        });
        if (data.profileImage) setProfileImagePreview(data.profileImage);
      }
    } catch (error) {
      console.error("Failed to load CEO data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const addAnnouncement = () => {
    setForm((prev) => ({
      ...prev,
      announcements: [...prev.announcements, { title: "", content: "", date: new Date().toISOString().split("T")[0] }],
    }));
  };

  const removeAnnouncement = (index: number) => {
    setForm((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "socialLinks" || key === "announcements") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      await api.post("/ceo-corner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditMode(false);
      loadCEO();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save CEO Corner");
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <ClientOnly>
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">CEO Corner</h1>
            <p className="text-muted-text mt-1">Manage CEO profile, brand story, and announcements</p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${editMode ? "bg-primary-forest-green hover:bg-secondary-forest-green text-white" : "bg-muted hover:bg-muted/80 text-primary-text"}`}
          >
            {editMode ? <X className="w-5 h-5" strokeWidth={2} /> : <Edit className="w-5 h-5" strokeWidth={2} />}
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-muted rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-muted rounded-xl"></div>
              <div className="h-48 bg-muted rounded-xl"></div>
            </div>
            <div className="h-48 bg-muted rounded-xl"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-primary-text">CEO Profile</h2>
                    {editMode && (
                      <button onClick={() => setEditMode(false)} className="text-sm text-soft-gold hover:underline">
                        Cancel
                      </button>
                    )}
                  </div>

                  {editMode ? (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-1.5">CEO Name *</label>
                          <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-1.5">Title *</label>
                          <input
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-text mb-1.5">Profile Image</label>
                        <div className="flex items-center gap-4">
                          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                            {profileImagePreview ? (
                              <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <svg className="w-8 h-8 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M24 21l-4-4m0 0l-4 4m4-4v12M12 6v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            )}
                          </div>
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="profile-image-input"
                              ref={(el) => el && editMode && el.click()}
                            />
                            <label htmlFor="profile-image-input" className="cursor-pointer bg-muted hover:bg-muted/80 px-4 py-2 rounded-lg text-sm font-medium text-primary-text transition-colors">
                              {profileImageFile ? "Change Image" : "Upload Image"}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-6">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                      {ceo?.profileImage ? (
                        <img src={ceo.profileImage} alt={ceo.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-10 h-10 text-muted-text mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M24 21l-4-4m0 0l-4 4m4-4v12M12 6v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-primary-text">{ceo?.name || "CEO Name"}</h3>
                      <p className="text-soft-gold font-medium mt-1">{ceo?.title || "Chief Executive Officer"}</p>
                    </div>
                  </div>
                )}
                {!editMode && ceo && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="font-medium text-primary-text mb-2">Bio</h4>
                      <p className="text-muted-text leading-relaxed">{ceo.bio || "No bio available"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary-text mb-2">Welcome Message</h4>
                      <p className="text-muted-text leading-relaxed italic">"{ceo.welcomeMessage || "Welcome to Xaviour Beauty Store"}"</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-primary-text mb-2">Vision</h4>
                        <p className="text-muted-text">{ceo.vision || "No vision statement"}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-primary-text mb-2">Mission</h4>
                        <p className="text-muted-text">{ceo.mission || "No mission statement"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-primary-text mb-6">Announcements</h2>

                {editMode ? (
                  <div className="space-y-4">
                    {form.announcements.map((ann: any, index) => (
                      <div key={index} className="border border-light-border dark:border-gray-700 rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-primary-text">Announcement #{index + 1}</h4>
                          {form.announcements.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeAnnouncement(index)}
                              className="p-1 text-muted-text hover:text-red-500"
                              aria-label="Remove announcement"
                            >
                              <X className="w-5 h-5" strokeWidth={2} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-primary-text mb-1.5">Title</label>
                            <input
                              value={ann.title}
                              onChange={(e) => {
                                const newAnnouncements = [...form.announcements];
                                newAnnouncements[index] = { ...ann, title: e.target.value };
                                setForm({ ...form, announcements: newAnnouncements });
                              }}
                              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-primary-text mb-1.5">Date</label>
                            <input
                              type="date"
                              value={ann.date}
                              onChange={(e) => {
                                const newAnnouncements = [...form.announcements];
                                newAnnouncements[index] = { ...ann, date: e.target.value };
                                setForm({ ...form, announcements: newAnnouncements });
                              }}
                              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-text mb-1.5">Content</label>
                          <textarea
                            rows={3}
                            value={ann.content}
                            onChange={(e) => {
                              const newAnnouncements = [...form.announcements];
                              newAnnouncements[index] = { ...ann, content: e.target.value };
                              setForm({ ...form, announcements: newAnnouncements });
                            }}
                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addAnnouncement}
                      className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-primary-text rounded-lg font-medium transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 4v16m8-8H4" /></svg>
                      Add Announcement
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ceo?.announcements?.length > 0 ? (
                      ceo.announcements.map((ann: any, index: number) => (
                        <div key={index} className="bg-muted rounded-lg p-4 border-l-4 border-primary-forest-green">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-primary-text">{ann.title}</h4>
                            <span className="text-xs text-muted-text">{new Date(ann.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                          </div>
                          <p className="text-muted-text">{ann.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-text text-center py-8">No announcements yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-primary-text mb-6">Video Message</h2>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Video URL (YouTube/Vimeo)</label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                      />
                      <p className="text-xs text-muted-text mt-1">Paste a YouTube or Vimeo video URL</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ceo?.videoUrl ? (
                      <div className="aspect-video rounded-lg bg-muted overflow-hidden relative">
                        <iframe
                          src={ceo.videoUrl.replace("watch?v=", "embed/")}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                        <Play className="w-12 h-12 text-muted-text/50" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-primary-text mb-6">Social Links</h2>

                {editMode ? (
                  <div className="space-y-4">
                    {[
                      { key: "facebook", label: "Facebook", icon: Facebook },
                      { key: "instagram", label: "Instagram", icon: Instagram },
                      { key: "twitter", label: "Twitter/X", icon: Twitter },
                      { key: "youtube", label: "YouTube", icon: Youtube },
                      { key: "linkedin", label: "LinkedIn", icon: LinkIcon },
                    ].map((social) => (
                      <div key={social.key} className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary-forest-green/10 flex items-center justify-center">
                          <social.icon className="w-5 h-5 text-primary-forest-green" strokeWidth={2} />
                        </div>
                        <input
                          type="url"
                          placeholder={`https://${social.key}.com/...`}
                          value={form.socialLinks[social.key as keyof typeof form.socialLinks] || ""}
                          onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, [social.key]: e.target.value } })}
                          className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                          placeholder={`https://${social.key}.com/...`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: "facebook", label: "Facebook", icon: Facebook },
                      { key: "instagram", label: "Instagram", icon: Instagram },
                      { key: "twitter", label: "Twitter", icon: Twitter },
                      { key: "youtube", label: "YouTube", icon: Youtube },
                      { key: "linkedin", label: "LinkedIn", icon: LinkIcon },
                    ].map((social) => {
                      const url = ceo?.socialLinks?.[social.key as keyof typeof ceo.socialLinks];
                      return url ? (
                        <a
                          key={social.key}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-primary-text transition-colors"
                        >
                          <social.icon className="w-5 h-5" strokeWidth={2} />
                          <span className="text-sm">{social.label}</span>
                        </a>
                      ) : null;
                    })}
                    {Object.values(ceo?.socialLinks || {}).every(v => !v) && (
                      <p className="text-muted-text text-center py-4">No social links configured</p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-primary-text mb-6">Brand Story</h2>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Vision</label>
                      <textarea
                        rows={3}
                        value={form.vision}
                        onChange={(e) => setForm({ ...form, vision: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                        placeholder="Our vision for the future..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary-text mb-1.5">Mission</label>
                      <textarea
                        rows={3}
                        value={form.mission}
                        onChange={(e) => setForm({ ...form, mission: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold"
                        placeholder="Our mission statement..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-primary-text mb-2">Vision</h4>
                      <p className="text-muted-text leading-relaxed">{ceo?.vision || "No vision statement provided"}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-primary-text mb-2">Mission</h4>
                      <p className="text-muted-text leading-relaxed">{ceo?.mission || "No mission statement provided"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {editMode && (
              <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-light-border dark:border-gray-700 p-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center justify-end gap-3">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg font-medium text-primary-text hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <SaveIcon className="w-5 h-5" />}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
)}
        </ClientOnly>
      </AdminLayout>
    )
  );
}