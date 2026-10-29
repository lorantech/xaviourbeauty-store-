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
  { href: "/admin/bank-transfers", label: "Bank Transfers" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/ceo", label: "CEO Corner" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminBankTransfers() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPending = async () => {
    try {
      const res = await api.get("/payments/bank-transfer/pending");
      setOrders(res.data || []);
    } catch (e) {
      setOrders([]);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchPending();
  }, [user]);

  const approve = async (orderId: string) => {
    if (!confirm("Approve this bank transfer payment?")) return;
    setLoading(true);
    try {
      await api.post(`/payments/bank-transfer/${orderId}/approve`);
      alert("Payment approved");
      fetchPending();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to approve");
    } finally {
      setLoading(false);
    }
  };

  const reject = async (orderId: string) => {
    const reason = prompt("Reason for rejection (optional):");
    setLoading(true);
    try {
      await api.post(`/payments/bank-transfer/${orderId}/reject`, { reason });
      alert("Payment rejected");
      fetchPending();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to reject");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold mb-6">Pending Bank Transfers</h1>
          {orders.length === 0 && <p className="text-zinc-500">No pending bank transfer proofs.</p>}
          <div className="space-y-4">
            {orders.map((o: any) => (
              <div key={o._id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="font-semibold">{o.orderNumber}</p>
                    <p className="text-sm text-zinc-500">{o.customer?.name} ({o.customer?.email})</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand">₦{Number(o.total).toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">{new Date(o.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-sm mb-2">
                  <p><strong>Reference:</strong> {o.paymentReference}</p>
                  <p><strong>Paid By:</strong> {o.bankTransferDetails?.paidBy || "-"}</p>
                  <p><strong>Bank:</strong> {o.bankTransferDetails?.bankName || "-"}</p>
                </div>
                {o.bankTransferProof && (
                  <div className="mb-3">
                    <a href={o.bankTransferProof} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline">View Proof of Payment</a>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => approve(o._id)} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded text-sm">Approve</button>
                  <button onClick={() => reject(o._id)} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded text-sm">Reject</button>
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
