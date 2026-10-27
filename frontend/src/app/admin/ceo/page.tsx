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

export default function AdminCeo() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", message: "", ceoName: "", designation: "", status: "published", featuredInHero: true });
  const [show, setShow] = useState(false);

  const load = () => api.get("/ceo-corner/admin/all").then((r) => setItems(r.data.messages || [])).catch(() => {});
  useEffect(() => { if (user?.role === "admin") load(); }, [user]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/ceo-corner/admin", form);
    setShow(false);
    setForm({ title: "", message: "", ceoName: "", designation: "", status: "published", featuredInHero: true });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await api.delete(`/ceo-corner/admin/${id}`);
    load();
  };

  if (user?.role !== "admin") return null;
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 flex-1">
        <aside className="w-48 shrink-0">
          <nav className="space-y-1">{adminLinks.map((l) => <Link key={l.href} href={l.href} className="block px-3 py-2 rounded hover:bg-muted text-sm">{l.label}</Link>)}</nav>
        </aside>
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">CEO Corner</h1>
            <button onClick={() => setShow(!show)} className="bg-brand text-white px-4 py-2 rounded-full text-sm">{show ? "Cancel" : "New"}</button>
          </div>
          {show && (
            <form onSubmit={create} className="bg-muted p-4 rounded-lg space-y-3 mb-6">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-border rounded" />
              <textarea required placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2 border border-border rounded" rows={4} />
              <input required placeholder="CEO Name" value={form.ceoName} onChange={(e) => setForm({ ...form, ceoName: e.target.value })} className="w-full px-3 py-2 border border-border rounded" />
              <input placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="w-full px-3 py-2 border border-border rounded" />
              <button type="submit" className="bg-brand text-white px-4 py-2 rounded-full text-sm">Create</button>
            </form>
          )}
          <div className="space-y-3">
            {items.map((m) => (
              <div key={m._id} className="border border-border rounded p-3 text-sm flex justify-between">
                <div>
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-zinc-600 line-clamp-2">{m.message}</p>
                </div>
                <button onClick={() => remove(m._id)} className="text-red-500 text-xs">Delete</button>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
