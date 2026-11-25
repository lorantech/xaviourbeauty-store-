"use client";

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

interface MediaAsset {
  _id: string;
  url: string;
  publicId: string;
  filename: string;
  type: "image" | "video" | "raw";
  size: number;
  uploadedAt: string;
}

interface MediaPageResponse {
  media: MediaAsset[];
  page: number;
  pages: number;
}

const PAGE_SIZE = 20;
const MAX_FILES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export default function AdminMedia() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const previewUrlsRef = useRef<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleRequestError = useCallback(async (error: unknown, fallback: string) => {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      if (error.response?.status === 401) {
        try {
          await logout();
        } catch (logoutError) {
          console.error("Failed to clear the expired admin session:", logoutError);
        } finally {
          router.replace("/admin/login");
        }
        return "Your session expired. Please sign in again.";
      }
      if (error.response?.status === 403) return "Admin access is required to manage media.";
      return error.response?.data?.message || (error.request ? "Unable to reach the media service." : fallback);
    }
    return fallback;
  }, [logout, router]);

  const loadMedia = useCallback(async (page = currentPage) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data } = await api.get<MediaPageResponse>("/admin/media", {
        params: {
          page,
          limit: PAGE_SIZE,
          type: typeFilter === "all" ? undefined : typeFilter,
        },
      });
      setMedia(data.media);
      setCurrentPage(data.page);
      setTotalPages(data.pages);
    } catch (error) {
      console.error("Failed to load media:", error);
      setErrorMessage(await handleRequestError(error, "Failed to load media."));
    } finally {
      setLoading(false);
    }
  }, [currentPage, handleRequestError, typeFilter]);

  useEffect(() => {
    if (user?.role === "admin") void loadMedia();
  }, [user, loadMedia]);

  useEffect(() => () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setErrorMessage(null);
    if (selectedFiles.length + files.length > MAX_FILES) {
      setErrorMessage(`Upload up to ${MAX_FILES} files at a time.`);
      return;
    }
    const invalidFile = files.find((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = ["video/mp4", "video/webm", "video/quicktime"].includes(file.type);
      return !isImage && !isVideo
        || (isImage && file.size > MAX_IMAGE_SIZE)
        || (isVideo && file.size > MAX_VIDEO_SIZE);
    });
    if (invalidFile) {
      const isImage = invalidFile.type.startsWith("image/");
      setErrorMessage(
        isImage
          ? `${invalidFile.name} is not a supported image or exceeds the 5 MB image limit.`
          : `${invalidFile.name} is not a supported video or exceeds the 50 MB video limit.`
      );
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    previewUrlsRef.current = [...previewUrlsRef.current, ...previews];
    setPreviewUrls((prev) => [...prev, ...previews]);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setErrorMessage(null);
    setNotice(null);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      const { data } = await api.post<{ media: MediaAsset[] }>("/admin/media", formData);
      setMedia(data.media);
      setSelectedFiles([]);
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current = [];
      setPreviewUrls([]);
      setCurrentPage(1);
      setTotalPages(Math.max(1, totalPages));
      setNotice(`${data.media.length} file${data.media.length === 1 ? "" : "s"} uploaded.`);
      await loadMedia(1);
    } catch (error: any) {
      console.error("Failed to upload media:", error);
      setErrorMessage(await handleRequestError(error, "Failed to upload files."));
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (asset: MediaAsset) => {
    if (!confirm(`Delete "${asset.filename}"?`)) return;
    setDeletingId(asset._id);
    setErrorMessage(null);
    setNotice(null);
    try {
      await api.delete(`/admin/media/${asset._id}`);
      setMedia((prev) => prev.filter((item) => item._id !== asset._id));
      setNotice("Media asset deleted.");
      if (media.length === 1 && currentPage > 1) {
        await loadMedia(currentPage - 1);
      } else {
        await loadMedia(currentPage);
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
      setErrorMessage(await handleRequestError(error, "Failed to delete media."));
    } finally {
      setDeletingId(null);
    }
  };

  const clearSelectedFiles = () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current = [];
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    previewUrlsRef.current = previewUrlsRef.current.filter((_, fileIndex) => fileIndex !== index);
    setPreviewUrls((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
    setSelectedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard!");
  };

  if (user?.role !== "admin") return null;

  const filteredMedia = media.filter((asset) =>
    `${asset.filename} ${asset.url}`.toLowerCase().includes(search.toLowerCase())
  );

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
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={handleFileSelect} className="hidden" />
            </label>
            {selectedFiles.length > 0 && (
              <button onClick={uploadFiles} disabled={uploading} className="px-4 py-2.5 bg-primary-forest-green hover:bg-secondary-forest-green text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                <Loader2 className={`w-4 h-4 ${uploading ? "animate-spin" : ""}`} /> {uploading ? "Uploading..." : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? "s" : ""}`}
              </button>
            )}
          </div>
        </div>

        {errorMessage && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        {notice && (
          <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input type="search" placeholder="Search media..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2.5 w-full bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent" />
            </div>
            <select value={typeFilter} onChange={(e) => { setCurrentPage(1); setTypeFilter(e.target.value); }} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold">
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
                    <button onClick={clearSelectedFiles} className="text-sm text-red-500 hover:underline">Clear All</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-light-border dark:border-gray-700">
                        {selectedFiles[i]?.type.startsWith("video/") ? (
                          <video src={url} className="w-full h-32 object-cover" muted controls />
                        ) : (
                          <img src={url} alt="Pending upload preview" className="w-full h-32 object-cover" />
                        )}
                        <button type="button" onClick={() => removeSelectedFile(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600" aria-label="Remove selected file"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filteredMedia.map((asset) => (
                    <div key={asset._id} className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-light-border dark:border-gray-700 group">
                      {asset.type === "video" ? (
                        <video src={asset.url} className="w-full h-40 object-cover" muted loop />
                      ) : (
                        <img src={asset.url} alt={asset.filename} className="w-full h-40 object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => copyUrl(asset.url)} className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-full hover:bg-white hover:bg-gray-800 transition-colors" aria-label="Copy URL"><Copy className="w-4 h-4" strokeWidth={2} /></button>
                        <button onClick={() => window.open(asset.url, "_blank", "noopener,noreferrer")} className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-full hover:bg-white hover:bg-gray-800 transition-colors" aria-label="Open in new tab"><Eye className="w-4 h-4" strokeWidth={2} /></button>
                        <button onClick={() => { const a = document.createElement("a"); a.href = asset.url; a.download = asset.filename; a.click(); }} className="p-2 bg-white/90 dark:bg-gray-900/90 rounded-full hover:bg-white hover:bg-gray-800 transition-colors" aria-label="Download"><Download className="w-4 h-4" strokeWidth={2} /></button>
                        <button onClick={() => deleteMedia(asset)} disabled={deletingId === asset._id} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50" aria-label="Delete"><Trash2 className="w-4 h-4" strokeWidth={2} /></button>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-primary-text truncate" title={asset.filename}>{asset.filename}</p>
                        <p className="text-xs text-muted-text truncate">{asset.type} · {(asset.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-text">
                  <Image className="w-12 h-12 mx-auto text-muted-text/50 mb-4" strokeWidth={1.5} />
                  <p className="text-primary-text font-medium">{search ? "No matching media" : "No media files yet"}</p>
                  <p className="text-sm text-muted-text mt-1">{search ? "Try a different search." : "Upload your first image or video."}</p>
                </div>
              )}
            </>
          )}
          {!loading && totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg border border-light-border px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted-text">Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-light-border px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
