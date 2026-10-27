"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { Filter, SlidersHorizontal } from "lucide-react";

function ShopInner() {
  const params = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: params.get("q") || "",
    category: params.get("category") || "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
    featured: params.get("featured") || "",
    newArrival: params.get("newArrival") || "",
  });

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const p: any = { limit: 40, sort: filters.sort };
    if (filters.q) p.q = filters.q;
    if (filters.category) p.category = filters.category;
    if (filters.minPrice) p.minPrice = filters.minPrice;
    if (filters.maxPrice) p.maxPrice = filters.maxPrice;
    if (filters.featured) p.featured = "true";
    if (filters.newArrival) p.newArrival = "true";
    api.get("/products", { params: p })
      .then((r) => { setProducts(r.data.items || []); setTotal(r.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Shop</h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="md:w-64 shrink-0">
            <div className="bg-muted rounded-lg p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Search</label>
                <input
                  type="text"
                  value={filters.q}
                  onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded bg-white"
                  placeholder="Search products..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-border rounded bg-white"
                >
                  <option value="">All</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Min</label>
                  <input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border rounded bg-white" />
                </div>
                <div>
                  <label className="text-sm font-medium">Max</label>
                  <input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border rounded bg-white" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Sort</label>
                <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border rounded bg-white">
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            <p className="text-sm text-zinc-500 mb-4">{total} products</p>
            {loading ? (
              <p>Loading...</p>
            ) : products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ShopInner />
    </Suspense>
  );
}
