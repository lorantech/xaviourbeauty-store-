"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

const heroImages = [
  "/504222860_18357316930150444_9188908467971046494_n.jpg",
  "/586867212_18379203601150444_3002517375187693764_n.jpg",
  "/569526436_18373168510150444_8034119568919736111_n.jpg",
  "/610789892_18383944330150444_7584768845937992713_n.jpg",
  "/580505482_18376628098150444_5202817661101760651_n.jpg",
  "/564295548_18104128789618940_2669776670156205894_n(1).jpg",
];

export default function HomeClient() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [ceo, setCeo] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const p = await api.get("/products", { params: { featured: "true", limit: 8 } });
        setFeatured(p.data.items || []);
        const c = await api.get("/categories").catch(() => ({ data: {} }));
        setCategories(c.data.categories || []);
        const ce = await api.get("/ceo-corner/featured").catch(() => ({ data: {} }));
        setCeo(ce.data.message);
        const t = await api.get("/testimonials", { params: { homepage: "true" } }).catch(() => ({ data: {} }));
        setTestimonials(t.data.testimonials || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden text-white h-[70vh] min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img src={heroImages[currentSlide]} alt="Beauty Equipment" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          </motion.div>
        </AnimatePresence>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight">
              Premium Beauty & Salon Equipment for Professionals
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 text-lg text-zinc-200 max-w-2xl">
              Discover professional-grade skincare, spa, and salon machines to elevate your beauty business.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 flex gap-4">
              <Link href="/shop" className="bg-brand hover:bg-brand-dark px-6 py-3 rounded-full font-medium transition">Shop Now</Link>
              <Link href="/ceo-corner" className="border border-white/50 hover:bg-white/10 px-6 py-3 rounded-full font-medium transition">CEO Corner</Link>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition ${i === currentSlide ? "bg-white w-8" : "bg-white/50"}`} />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Link href="/shop" className="text-brand hover:underline text-sm">View all products</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c: any, idx: number) => (
            <motion.div
              key={c._id || c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                href={`/shop?category=${c.slug}`}
                className="group relative block overflow-hidden rounded-xl bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 p-6 text-center hover:shadow-lg hover:border-brand/40 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand/0 to-brand/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <h3 className="font-semibold text-sm md:text-base group-hover:text-brand transition-colors">{c.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 group-hover:text-brand/70">Shop now →</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link href="/shop?featured=true" className="text-brand hover:underline text-sm">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {ceo && (
        <section className="bg-muted py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            {ceo.profileImage && (
              <img src={ceo.profileImage} alt={ceo.ceoName} className="w-24 h-24 rounded-full object-cover mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold mb-4">{ceo.title}</h2>
            <p className="text-zinc-600 leading-relaxed">{ceo.message}</p>
            <p className="mt-4 font-semibold">{ceo.ceoName}</p>
            <p className="text-sm text-zinc-500">{ceo.designation}</p>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-6">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t: any) => (
              <div key={t._id} className="bg-white border border-border rounded-xl p-6 shadow-sm">
                <p className="text-zinc-600 italic">"{t.content || t.text}"</p>
                <p className="mt-4 font-semibold">{t.customerName || t.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
