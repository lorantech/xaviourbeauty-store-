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

export default function AdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ name: "", price: "", stockQuantity: 0, category: "", description: "", status: "published" });
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    api.get("/products", { params: { status: "published", limit: 100 } }).then((r) => setProducts(r.data.items || [])).catch(() => {});
    api.get("/categories").then((r) => setCategories(r.data.categories || [])).catch(() => {});
  };

  useEffect(() => { if (user?.role === "admin") load(); }, [user]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/products", { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity) });
    setForm({ name: "", price: "", stockQuantity: 0, category: categories[0]?._id || "", description: "", status: "published" });
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete product?")) return;
    await api.delete(`/products/${id}`);
    load();
  };

  if (user?.role !== "admin") return null;

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 flex-1">
        <aside className="w-48 shrink-0">
          <nav className="space-y-1">
            {adminLinks.map((l) => <Link key={l.href} href={l.href} className="block px-3 py-2 rounded hover:bg-muted text-sm">{l.label}</Link>)}
          </nav>
        </aside>
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Products</h1>
            <button onClick={() => setShowForm(!showForm)} className="bg-brand text-white px-4 py-2 rounded-full text-sm">
              {showForm ? "Cancel" : "New Product"}
            </button>
          </div>
          {showForm && (
            <form onSubmit={create} className="bg-muted p-4 rounded-lg space-y-3 mb-6">
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-border rounded" />
              <div className="grid grid-cols-3 gap-3">
                <input required type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="px-3 py-2 border border-border rounded" />
                <input type="number" placeholder="Stock" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} className="px-3 py-2 border border-border rounded" />
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 border border-border rounded">
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <button type="submit" className="bg-brand text-white px-4 py-2 rounded-full text-sm">Create</button>
            </form>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="py-2">Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-border">
                    <td className="py-2">{p.name}</td>
                    <td>₦{Number(p.price).toLocaleString()}</td>
                    <td>{p.stockQuantity}</td>
                    <td>{p.status}</td>
                    <td>
                      <button onClick={() => remove(p._id)} className="text-red-500 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
