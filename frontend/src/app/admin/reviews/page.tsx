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
  Eye,
  MessageSquare,
  Filter,
  Search,
  Flag,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  useEffect(() => {
    if (user?.role === "admin") loadReviews();
  }, [user]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reviews");
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await api.patch(`/reviews/${id}`, { status });
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update review");
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete review");
    }
  };

  const filteredReviews = reviews
    .filter((r) => filter === "all" || r.status === filter)
    .filter((r) => r.product?.name?.toLowerCase().includes(search.toLowerCase()) || r.user?.name?.toLowerCase().includes(search.toLowerCase()));

  if (user?.role !== "admin") return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary-text">Reviews</h1>
            <p className="text-muted-text mt-1">Manage and moderate customer reviews</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-light-border dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input type="search" placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2.5 w-full bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-soft-gold focus:border-transparent" />
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-light-border dark:border-gray-700 rounded-lg text-sm text-primary-text focus:outline-none focus:ring-2 focus:ring-soft-gold min-w-[180px]">
              <option value="all">All Reviews</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 bg-muted rounded-lg border border-light-border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2"><div className="h-4 bg-white dark:bg-gray-700 rounded w-1/3"></div><div className="h-4 bg-white dark:bg-gray-700 rounded w-1/4"></div></div>
                  <div className="h-4 bg-white dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-white dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review._id} className={`p-4 rounded-lg border border-light-border dark:border-gray-700 ${review.status === "pending" ? "bg-amber-50 dark:bg-amber-900/20" : review.status === "rejected" ? "bg-red-50 dark:bg-red-900/20" : "bg-white dark:bg-gray-800"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-current" />
                        <span className="font-medium text-primary-text">{review.product?.name || "Product"}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${review.status === "approved" ? "bg-emerald-100 text-emerald-700" : review.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-text">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < (review.rating || 0) ? "text-amber-500 fill-current" : "text-muted-text"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 1.292a1 1 0 00-.364 1.118l-2.8 2.034a1 1 0 00-1.175 0l-2.8-2.034a1 1 0 00-.364 1.118l1.07 1.292a1 1 0 00-.364 1.118l-2.8 2.034a1 1 0 00-1.175 0l-2.8-2.034a1 1 0 00-.364 1.118l1.07 1.292a1 1 0 00-.364 1.118l-2.8 2.034a1 1 0 00-1.175 0l-2.8-2.034a1 1 0 00-.364 1.118l1.07 1.292a1 1 0 00-.364 1.118l-2.8 2.034a1 1 0 00-1.175 0z" /></svg>
)}
                    </div>
                    <p className="text-sm text-muted-text mb-3">{review.comment || review.text}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-text">
                      <span>{review.user?.name || "Anonymous"}</span>
                      <span>·</span>
                      <span>{review.user?.email || ""}</span>
                    </div>
                    {review.status === "pending" && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-light-border dark:border-gray-700">
                        <button onClick={() => updateReviewStatus(review._id, "approved")} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-medium transition-colors">Approve</button>
                        <button onClick={() => updateReviewStatus(review._id, "rejected")} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors">Reject</button>
                        <button onClick={() => deleteReview(review._id)} className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">Delete</button>
                      </div>
                    )}
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="py-12 text-center text-muted-text">
                    <svg className="w-12 h-12 mx-auto text-muted-text/50 mb-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 1.292a1 1 0 00-.364 1.118l-2.8 2.034a1 1 0 00-1.175 0l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034a1 1 0 00-.364 1.118l1.07 1.292a1 1 0 00-.364 1.118l-2.8 2.034a1 1 0 00-1.175 0l-2.8-2.034a1 1 0 00-.364 1.118l1.07 1.292a1 1 0 00-.364 1.118l-2.8 2.034a1 1 0 00-1.175 0z" /></svg>
                    <p className="text-primary-text font-medium mt-2">No reviews yet</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    )
  );
}