"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";

export default function Testimonials() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get("/testimonials").then((r) => setItems(r.data.testimonials || [])).catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12 flex-1">
        <h1 className="text-3xl font-bold mb-8">Testimonials</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t: any) => (
            <div key={t._id} className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <p className="text-zinc-600 italic">"{t.content || t.text}"</p>
              <div className="mt-4">
                <p className="font-semibold">{t.customerName || t.name}</p>
                {t.location && <p className="text-sm text-zinc-500">{t.location}</p>}
              </div>
            </div>
          ))}
        </div>
        {items.length === 0 && <p className="text-zinc-500">No testimonials yet.</p>}
      </main>
      <Footer />
    </>
  );
}
