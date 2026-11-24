"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Image,
  Loader2,
  ChevronDown,
  Trash2,
  Search,
  Eye,
  MoreVertical,
  Download,
  Copy,
  Check,
  X,
} from "lucide-react";

export default function AdminMedia() {
  const { user } = useAuth();
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (user?.role === "admin") loadMedia();
  }, [user]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/media");
      setMedia(res.data.media || []);
    } catch (error) {
      console.error("Failed to load media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (selectedFiles.length + files.length > 50) {
      alert("Maximum 50 files allowed");
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const preview = URL.createObjectURL(file);
      setPreviewUrls((prev) => [...prev, preview]);
    });
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSelectedFiles([]);
      setPreviewUrls([]);
      loadMedia();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      await api.delete(`/admin/media/${id}`);
      loadMedia();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete");
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  if (user?.role !== "admin") return null;

  const filteredMedia = media
    .filter((m) => m.url.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => typeFilter === "all" || m.type === typeFilter);

  return (
    <AdminLayout>
      
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Media Library</h1>
            <p className="text-muted-text mt-1">Manage your images, videos, and files</p>
          </div>
          <div className="flex gap-3">
            <label className="cursor-pointer bg-muted hover:bg-muted/80 px-4 py-2.5 rounded-lg text-sm font-medium text-primary-text transition-colors flex items-center gap-2">
              <Image className="w-4 h-4" strokeWidth={2} />
              Upload Files
              <input type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
            </label>
            {selectedFiles.length > 0 && (
              <button onClick={uploadFiles} disabled={uploading} className="px-4 py-2.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                <Loader2 className="w-4 h-4" /> Upload {selectedFiles.length} File{selectedFiles.length > 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input type="search" placeholder="Search media..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2.5 w-full bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent" />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold">
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-pulse">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg"></div>
              ))}
            </div>
          ) : (
            <>
              {previewUrls.length > 0 && (
                <div className="mb-6 p-4 bg-muted rounded-xl border border-light-border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-primary-text">Pending Uploads ({previewUrls.length})</h4>
                    <button onClick={() => { setSelectedFiles([]); setPreviewUrls([]); }} className="text-sm text-red-500 hover:underline">Clear All</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-light-border dark:border-gray-700">
                        <img src={url} alt="Preview" className="w-full h-32 object-cover" />
                        <button onClick={() => { setPreviewUrls((prev) => prev.filter((_, idx) => idx !== i)); setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i)); }} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filteredMedia.map((item) => (
                    <div key={item._id} className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-light-border dark:border-gray-700 group">
                      {item.type === "video" ? (
                        <video src={item.url} className="w-full h-40 object-cover" muted loop />
                      ) : (
                        <img src={item.url} alt={item.name || "Media"} className="w-full h-40 object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => copyUrl(item.url)} className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-full hover:bg-white hover:bg-gray-800 transition-colors" aria-label="Copy URL"><Copy className="w-4 h-4" strokeWidth={2} /></button>
                        <button onClick={() => window.open(item.url, "_blank")} className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-full hover:bg-white hover:bg-gray-800 transition-colors" aria-label="Open in new tab"><Eye className="w-4 h-4" strokeWidth={2} /></button>
                        <button onClick={() => { const a = document.createElement("a"); a.href = item.url; a.download = item.name; a.click(); }} className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-full hover:bg-white hover:bg-gray-800 transition-colors" aria-label="Download"><Download className="w-4 h-4" strokeWidth={2} /></button>
                        <button onClick={() => deleteMedia(item._id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors" aria-label="Delete"><Trash2 className="w-4 h-4" strokeWidth={2} /></button>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-primary-text truncate">{item.name}</p>
                        <p className="text-xs text-muted-text truncate">{item.type} · {item.size ? (item.size / 1024).toFixed(1) + " KB" : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-text">
                  <Image className="w-12 h-12 mx-auto text-muted-text/50 mb-4" strokeWidth={1.5} />
                  <p className="text-primary-text font-medium">No media files yet</p>
                  <p className="text-sm text-muted-text mt-1">Upload your first image or video</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
