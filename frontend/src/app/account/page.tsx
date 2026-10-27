"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Account() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) api.get("/orders/my-orders").then((r) => setOrders(r.data.orders || [])).catch(() => {});
  }, [user]);

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">My Account</h1>
        <p className="mb-4">Welcome, {user?.name}</p>
        <h2 className="text-xl font-bold mb-4">My Orders</h2>
        {orders.length === 0 && <p className="text-zinc-500">No orders yet.</p>}
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div key={o._id} className="border border-border rounded-lg p-4">
              <div className="flex justify-between">
                <span className="font-semibold">{o.orderNumber}</span>
                <span className="text-sm text-zinc-500">{new Date(o.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm mt-1">Status: {o.paymentStatus} / {o.fulfilmentStatus}</p>
              <p className="text-brand font-bold mt-1">₦{Number(o.total).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
