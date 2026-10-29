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
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "bank_transfer">("paystack");
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showBankModal, setShowBankModal] = useState(false);

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
      const orderIdRes = orderData.order._id;
      setOrderId(orderIdRes);
      const { data: payData } = await api.post("/payments/initialize", { orderId: orderIdRes, method: paymentMethod });
      if (paymentMethod === "bank_transfer") {
        setBankDetails(payData.account);
        setShowBankModal(true);
        await refresh();
        return;
      }
      window.location.href = payData.authorization_url;
    } catch (err: any) {
      setError(err.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const goToAccount = () => {
    router.push("/account");
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
          <div className="mt-6">
            <p className="font-medium mb-2">Payment Method</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer">
                <input type="radio" checked={paymentMethod === "paystack"} onChange={() => setPaymentMethod("paystack")} />
                <span>Pay with Card/Bank (Paystack)</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer">
                <input type="radio" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")} />
                <span>Bank Transfer (Transfer to UBA)</span>
              </label>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-brand text-white py-3 rounded-full font-medium">
            {loading ? "Processing..." : paymentMethod === "bank_transfer" ? "Place Order & Get Account Details" : "Pay Now"}
          </button>
        </form>

        {showBankModal && bankDetails && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
              <h2 className="text-xl font-bold">Bank Transfer Details</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Bank:</strong> {bankDetails.bankName}</p>
                <p><strong>Account Number:</strong> {bankDetails.accountNumber}</p>
                <p><strong>Account Name:</strong> {bankDetails.accountName}</p>
                <p><strong>Amount:</strong> ₦{cart?.total?.toLocaleString()}</p>
                <p><strong>Order Reference:</strong> {orderId}</p>
              </div>
              <p className="text-xs text-gray-600">Make transfer via ATM, USSD, or Bank App. After payment, go to your Account &gt; Orders and submit proof of payment (receipt/screenshot).</p>
              <div className="flex gap-2">
                <button onClick={goToAccount} className="flex-1 bg-brand text-white py-2 rounded">Go to Orders</button>
                <button onClick={() => setShowBankModal(false)} className="flex-1 border py-2 rounded">Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
