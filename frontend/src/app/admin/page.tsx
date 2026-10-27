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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user?.role === "admin") api.get("/admin").then((r) => setData(r.data)).catch(() => {});
  }, [user]);

  if (user?.role !== "admin") {
    return (
      <>
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 flex-1 text-center">
          <p>Admin access required.</p>
        </main>
        <Footer />
      </>
    );
  }

  const stats = data?.stats;
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 flex-1">
        <aside className="w-48 shrink-0">
          <nav className="space-y-1">
            {adminLinks.map((l) => (
              <Link key={l.href} href={l.href} className="block px-3 py-2 rounded hover:bg-muted text-sm">
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1">
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(stats).map(([k, v]) => (
                <div key={k} className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-zinc-500 uppercase">{k}</p>
                  <p className="text-2xl font-bold">{String(v)}</p>
                </div>
              ))}
            </div>
          )}
          {data?.recentOrders && (
            <div>
              <h2 className="font-bold mb-3">Recent Orders</h2>
              <div className="space-y-2">
                {data.recentOrders.map((o: any) => (
                  <div key={o._id} className="border border-border rounded p-3 text-sm flex justify-between">
                    <span>{o.orderNumber}</span>
                    <span>{o.paymentStatus}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
