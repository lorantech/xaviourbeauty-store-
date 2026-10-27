"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, refresh } = useCart();
  const [form, setForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-16 flex-1 text-center">
          <p>Please sign in to checkout.</p>
          <a href="/auth/login" className="text-brand hover:underline">Sign in</a>
        </main>
        <Footer />
      </>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: orderData } = await api.post("/orders", {
        delivery: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          country: form.country,
        },
        deliveryMethod: "standard",
      });
      const orderId = orderData.order._id;
      const { data: payData } = await api.post("/payments/initialize", { orderId });
      window.location.href = payData.authorization_url;
    } catch (err: any) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <form onSubmit={submit} className="space-y-3">
          {(["fullName","email","phone","address","city","state","country"] as const).map((k) => (
            <input
              key={k}
              required
              placeholder={k}
              value={(form as any)[k]}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded"
            />
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-brand text-white py-3 rounded-full font-medium">
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
