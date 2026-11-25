"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

type BankDetails = { bankName: string; accountName: string; accountNumber: string; instructions?: string };

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
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "bank_transfer">("bank_transfer");
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [orderToken, setOrderToken] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptSubmitted, setReceiptSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storeWhatsapp, setStoreWhatsapp] = useState("");

  useEffect(() => {
    setForm((f) => ({ ...f, fullName: user?.name || f.fullName, email: user?.email || f.email }));
  }, [user]);

  useEffect(() => {
    api.get("/orders/bank-details").then((r) => {
      if (r.data?.bank) setBankDetails(r.data.bank);
      const raw = String(r.data?.whatsappNumber || "");
      const digits = raw.replace(/\D/g, "");
      if (digits) setStoreWhatsapp(digits.startsWith("0") ? `234${digits.slice(1)}` : digits);
    }).catch(() => {
      setBankDetails({ bankName: "UBA", accountName: "Xaviour Beauty Store Ventures", accountNumber: "1027152497", instructions: "Transfer the exact total amount and upload your payment receipt below for verification." });
    });
  }, []);

  const total = useMemo(() => {
    const items = (cart?.items || []) as any[];
    return items.reduce((sum, i) => sum + Number(i.priceSnapshot || i.product?.price || 0) * Number(i.quantity || 0), 0);
  }, [cart]);

  const createOrder = async () => {
    const { data } = await api.post("/orders", {
      paymentMethod,
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
    setOrder(data.order);
    setOrderToken(data.orderAccessToken || null);
    return data;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const orderData = order ? { order, orderAccessToken: orderToken } : await createOrder();
      const orderIdRes = orderData.order._id;
      const { data: payData } = await api.post("/payments/initialize", { orderId: orderIdRes, method: paymentMethod, orderAccessToken: orderData.orderAccessToken || orderToken });
      if (paymentMethod === "bank_transfer") {
        setBankDetails(payData.account);
        setOrder((prev: any) => ({ ...(prev || orderData.order), ...payData.order, paymentReference: payData.reference }));
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

  const copyAccount = async () => {
    if (!bankDetails?.accountNumber) return;
    await navigator.clipboard.writeText(bankDetails.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const submitReceipt = async () => {
    if (!order?._id || !receiptFile) {
      setError("Please upload your payment receipt before confirming.");
      return;
    }
    setError("");
    setUploadingReceipt(true);
    try {
      const fd = new FormData();
      fd.append("file", receiptFile);
      const up = await api.post("/upload/receipt", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await api.post("/payments/bank-transfer/submit", {
        orderId: order._id,
        proofUrl: up.data.url,
        paidBy: form.fullName,
        bankName: bankDetails?.bankName,
        orderAccessToken: orderToken,
      });
      setReceiptSubmitted(true);
      await refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit receipt");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const whatsappLink = useMemo(() => {
    const digits = storeWhatsapp.replace(/\D/g, "");
    if (!digits) return "";
    const amount = Number(order?.total || total || 0).toLocaleString();
    const msg = encodeURIComponent(`Hello Xaviour Beauty Store, I have made payment for order ${order?.orderNumber || ""}. Amount: NGN ${amount}. I will send my receipt now.`);
    return `https://wa.me/${digits}?text=${msg}`;
  }, [order?.orderNumber, order?.total, total, storeWhatsapp]);

  const confirmed = paymentMethod === "bank_transfer" && !!order && (order.paymentReference || order.orderNumber);
  const showBankStep = confirmed;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        {!receiptSubmitted ? (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(["fullName","email","phone","address","city","state","country"] as const).map((k) => (
                <input
                  key={k}
                  required
                  placeholder={k === "fullName" ? "Full name" : k.charAt(0).toUpperCase() + k.slice(1)}
                  value={(form as any)[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className={`w-full px-3 py-2 border border-border rounded ${k === "address" ? "md:col-span-2" : ""}`}
                />
              ))}
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <p className="font-medium">Payment Method</p>
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer">
                <input type="radio" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")} />
                <span>Bank Transfer</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer">
                <input type="radio" checked={paymentMethod === "paystack"} onChange={() => setPaymentMethod("paystack")} />
                <span>Pay with Card/Bank (Paystack)</span>
              </label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {!showBankStep && (
              <button type="submit" disabled={loading} className="w-full bg-brand text-white py-3 rounded-full font-medium disabled:opacity-60">
                {loading ? "Processing..." : paymentMethod === "bank_transfer" ? "Continue to Bank Transfer" : "Pay Now"}
              </button>
            )}
          </form>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
            <h2 className="text-xl font-bold text-green-800">Order received</h2>
            <p className="text-green-700">Your receipt has been uploaded successfully. Our team will verify your payment and confirm your order.</p>
            <div className="text-sm text-green-800 space-y-1">
              <p><strong>Order Reference:</strong> {order?.orderNumber}</p>
              <p><strong>Status:</strong> Awaiting payment verification</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => router.push(user ? "/account" : "/")} className="bg-brand text-white px-4 py-2 rounded">{user ? "View My Orders" : "Continue Shopping"}</button>
            </div>
          </div>
        )}

        {showBankStep && !receiptSubmitted && bankDetails && (
          <div className="mt-6 border rounded-lg p-5 space-y-4 bg-amber-50/40">
            <h2 className="text-lg font-semibold">Bank Transfer Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-white border rounded p-3"><p className="text-zinc-500">Bank Name</p><p className="font-medium">{bankDetails.bankName}</p></div>
              <div className="bg-white border rounded p-3"><p className="text-zinc-500">Account Name</p><p className="font-medium">{bankDetails.accountName}</p></div>
              <div className="bg-white border rounded p-3 flex items-center justify-between gap-2">
                <div><p className="text-zinc-500">Account Number</p><p className="font-medium">{bankDetails.accountNumber}</p></div>
                <button type="button" onClick={copyAccount} className="px-3 py-1.5 text-sm border rounded bg-white">{copied ? "Copied" : "Copy"}</button>
              </div>
              <div className="bg-white border rounded p-3"><p className="text-zinc-500">Amount</p><p className="font-medium">?{Number(order?.total || total).toLocaleString()}</p></div>
              <div className="bg-white border rounded p-3 sm:col-span-2"><p className="text-zinc-500">Order Reference</p><p className="font-medium">{order?.orderNumber}</p></div>
            </div>
            <div className="text-sm bg-white border rounded p-3">
              <p className="font-medium mb-1">Payment Instructions</p>
              <p className="text-zinc-600">{bankDetails.instructions || "Transfer the exact amount and upload your receipt for verification."}</p>
            </div>
            <div className="bg-white border rounded p-4 space-y-3">
              <label className="block text-sm font-medium">Upload payment receipt <span className="text-red-500">*</span></label>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} className="w-full text-sm" />
              <p className="text-xs text-zinc-500">Accepted: JPG, PNG, WEBP, PDF. Max 10MB.</p>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex flex-col sm:flex-row gap-2">
                {whatsappLink && <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center border border-green-600 text-green-700 py-3 rounded-full font-medium hover:bg-green-50">Send Receipt on WhatsApp</a>}
                <button type="button" onClick={submitReceipt} disabled={uploadingReceipt || !receiptFile} className="flex-1 bg-brand text-white py-3 rounded-full font-medium disabled:opacity-60">
                  {uploadingReceipt ? "Submitting receipt..." : "I Have Made Payment / Submit Receipt"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
