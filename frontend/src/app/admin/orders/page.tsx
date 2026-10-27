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

export default function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  const load = () => api.get("/orders/admin/all").then((r) => setOrders(r.data.orders || [])).catch(() => {});
  useEffect(() => { if (user?.role === "admin") load(); }, [user]);

  const updateStatus = async (id: string, fulfilmentStatus: string) => {
    await api.patch(`/orders/admin/${id}/status`, { fulfilmentStatus });
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
          <h1 className="text-2xl font-bold mb-4">Orders</h1>
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o._id} className="border border-border rounded p-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">{o.orderNumber}</span>
                  <span>{o.paymentStatus}</span>
                </div>
                <p className="text-zinc-500">{o.customer?.name} - {o.customer?.email}</p>
                <p className="text-brand font-bold">₦{Number(o.total).toLocaleString()}</p>
                <div className="mt-2 flex gap-2">
                  <select
                    value={o.fulfilmentStatus}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    className="border border-border rounded px-2 py-1 text-xs"
                  >
                    {["pending_payment","paid","processing","shipped","delivered","cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
