"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function Account() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [proof, setProof] = useState<{ orderId: string; paidBy: string; bankName: string; file?: File } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) api.get("/orders/my-orders").then((r) => setOrders(r.data.orders || [])).catch(() => {});
  }, [user]);

  const submitProof = async () => {
    if (!proof || !proof.orderId) return;
    setUploading(true);
    try {
      let proofUrl = "";
      if (proof.file) {
        const fd = new FormData();
        fd.append("image", proof.file);
        const up = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        proofUrl = up.data.url || up.data.imageUrl || up.data.secure_url;
      }
      await api.post("/payments/bank-transfer/submit", { orderId: proof.orderId, proofUrl, paidBy: proof.paidBy, bankName: proof.bankName });
      alert("Proof submitted. We will verify it shortly.");
      setProof(null);
      const r = await api.get("/orders/my-orders");
      setOrders(r.data.orders || []);
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to submit proof");
    } finally {
      setUploading(false);
    }
  };

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
              {o.paymentMethod === "bank_transfer" && o.paymentStatus !== "paid" && !o.bankTransferProof && (
                <button onClick={() => setProof({ orderId: o._id, paidBy: user?.name || "", bankName: "" })} className="mt-2 px-4 py-2 bg-brand text-white rounded text-sm">Submit Proof of Payment</button>
              )}
              {o.paymentMethod === "bank_transfer" && o.bankTransferProof && o.paymentStatus !== "paid" && (
                <p className="text-sm text-amber-600 mt-2">Proof submitted. Awaiting verification.</p>
              )}
            </div>
          ))}
        </div>

        {proof && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-3">
              <h2 className="text-lg font-bold">Submit Proof of Payment</h2>
              <input className="w-full px-3 py-2 border rounded" placeholder="Bank you paid from" value={proof.bankName} onChange={(e) => setProof({ ...proof, bankName: e.target.value })} />
              <input className="w-full px-3 py-2 border rounded" placeholder="Name used for transfer" value={proof.paidBy} onChange={(e) => setProof({ ...proof, paidBy: e.target.value })} />
              <input type="file" accept="image/*" onChange={(e) => setProof({ ...proof, file: e.target.files?.[0] })} />
              <div className="flex gap-2">
                <button onClick={submitProof} disabled={uploading} className="flex-1 bg-brand text-white py-2 rounded">{uploading ? "Submitting..." : "Submit"}</button>
                <button onClick={() => setProof(null)} className="flex-1 border py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
