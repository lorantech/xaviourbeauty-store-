"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { api, BACKEND_URL } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Star, ShoppingCart } from "lucide-react";

function ProductDetailInner() {
  const { slug } = useParams() as { slug: string };
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", text: "" });
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.product);
        const r = await api.get(`/reviews/product/${data.product._id}`);
        setReviews(r.data.reviews || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    await api.post(`/reviews/product/${product._id}`, reviewForm);
    alert("Review submitted for moderation");
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!product) return <div className="p-8">Product not found</div>;

  const img = product.images?.[0]
    ? (product.images[0].startsWith("http") ? product.images[0] : product.images[0])
    : "/placeholder.svg";

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-muted rounded-xl overflow-hidden">
            <img src={img} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-brand">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.round(product.rating || 0) ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="text-sm text-zinc-500">({product.reviewCount || 0} reviews)</span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-brand">₦{Number(product.price).toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-zinc-400 line-through ml-3">₦{Number(product.originalPrice).toLocaleString()}</span>
              )}
            </div>
            <p className="mt-4 text-zinc-600 leading-relaxed">{product.description}</p>
            <p className="mt-2 text-sm text-zinc-500">Stock: {product.stockQuantity}</p>

            <div className="mt-6 flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={product.stockQuantity}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-20 px-3 py-2 border border-border rounded"
              />
              <button
                onClick={() => addItem(product._id, qty)}
                disabled={product.stockQuantity <= 0}
                className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-6 py-2 rounded-full transition disabled:opacity-50"
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Reviews</h2>
          {reviews.length === 0 && <p className="text-zinc-500">No reviews yet.</p>}
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div key={r._id} className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.user?.name || "Customer"}</span>
                  <div className="flex text-brand">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < r.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                {r.title && <p className="font-medium mt-1">{r.title}</p>}
                <p className="text-zinc-600 text-sm mt-1">{r.text}</p>
              </div>
            ))}
          </div>

          {user && (
            <form onSubmit={submitReview} className="mt-6 border border-border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Write a review</h3>
              <div>
                <label className="text-sm">Rating</label>
                <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} className="ml-2 border border-border rounded px-2 py-1">
                  {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <input placeholder="Title" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} className="w-full px-3 py-2 border border-border rounded" />
              <textarea placeholder="Your review" value={reviewForm.text} onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })} className="w-full px-3 py-2 border border-border rounded" rows={3} required />
              <button type="submit" className="bg-brand text-white px-4 py-2 rounded-full">Submit</button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function ProductDetail() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ProductDetailInner />
    </Suspense>
  );
}
