"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";

function VerifyInner() {
  const params = useSearchParams();
  const reference = params.get("reference");
  const [status, setStatus] = useState("verifying");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!reference) return;
    api.get(`/payments/verify/${reference}`)
      .then((r) => { setStatus(r.data.status); setOrder(r.data.order); })
      .catch(() => setStatus("failed"));
  }, [reference]);

  return (
    <>
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-16 flex-1 text-center">
        {status === "verifying" && <p>Verifying payment...</p>}
        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-green-600 mb-4">Payment successful!</h1>
            {order && <p className="text-zinc-600">Order {order.orderNumber} has been paid.</p>}
            <a href="/account" className="text-brand hover:underline mt-4 inline-block">View orders</a>
          </>
        )}
        {status === "failed" && (
          <>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Payment failed</h1>
            <a href="/cart" className="text-brand hover:underline">Return to cart</a>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <VerifyInner />
    </Suspense>
  );
}
