"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/ceo", label: "CEO Corner" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any>({ storeName: "Xaviourbeautystore", shippingFee: 0 });

  useEffect(() => {
    if (user?.role === "admin") api.get("/admin/settings").then((r) => setSettings(r.data.settings || settings)).catch(() => {});
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.patch("/admin/settings", settings);
    alert("Saved");
  };

  if (user?.role !== "admin") return null;
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 flex-1">
        <aside className="w-48 shrink-0">
          <nav className="space-y-1">{adminLinks.map((l) => <Link key={l.href} href={l.href} className="block px-3 py-2 rounded hover:bg-muted text-sm">{l.label}</Link>)}</nav>
        </aside>
        <main className="flex-1 max-w-lg">
          <h1 className="text-2xl font-bold mb-4">Store Settings</h1>
          <form onSubmit={save} className="space-y-3">
            <input value={settings.storeName || ""} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} placeholder="Store name" className="w-full px-3 py-2 border border-border rounded" />
            <input type="number" value={settings.shippingFee || 0} onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })} placeholder="Shipping fee" className="w-full px-3 py-2 border border-border rounded" />
            <button type="submit" className="bg-brand text-white px-4 py-2 rounded-full text-sm">Save</button>
          </form>
        </main>
      </div>
      <Footer />
    </>
  );
}
