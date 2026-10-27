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

export default function AdminCustomers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === "admin") api.get("/admin/customers").then((r) => setCustomers(r.data.customers || [])).catch(() => {});
  }, [user]);

  if (user?.role !== "admin") return null;
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 flex-1">
        <aside className="w-48 shrink-0">
          <nav className="space-y-1">{adminLinks.map((l) => <Link key={l.href} href={l.href} className="block px-3 py-2 rounded hover:bg-muted text-sm">{l.label}</Link>)}</nav>
        </aside>
        <main className="flex-1">
          <h1 className="text-2xl font-bold mb-4">Customers</h1>
          <div className="space-y-2">
            {customers.map((c) => (
              <div key={c._id} className="border border-border rounded p-3 text-sm">
                <p className="font-semibold">{c.name}</p>
                <p className="text-zinc-500">{c.email}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
