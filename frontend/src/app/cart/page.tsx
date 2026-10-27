"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { BACKEND_URL } from "@/lib/api";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, refresh, updateItem, removeItem } = useCart();

  useEffect(() => { refresh(); }, [refresh]);

  const items = cart?.items || [];
  const subtotal = items.reduce((a, i) => a + i.priceSnapshot * i.quantity, 0);
  const shipping = 5000;
  const total = subtotal + shipping;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        {loading && <p>Loading...</p>}
        {!loading && items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 mb-4">Your cart is empty.</p>
            <Link href="/shop" className="bg-brand text-white px-6 py-2 rounded-full">Shop now</Link>
          </div>
        )}
        {items.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {items.map((item: any) => {
                const p = item.product;
                const img = p?.images?.[0]
                  ? (p.images[0].startsWith("http") ? p.images[0] : p.images[0])
                  : "/placeholder.svg";
                return (
                  <div key={item._id} className="flex gap-4 border border-border rounded-lg p-4">
                    <img src={img} alt={p?.name} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium">{p?.name}</p>
                      <p className="text-brand font-bold">₦{Number(item.priceSnapshot).toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(item._id, Number(e.target.value))} className="w-16 px-2 py-1 border border-border rounded" />
                        <button onClick={() => removeItem(item._id)} className="text-red-500 text-sm">Remove</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border border-border rounded-lg p-4 h-fit">
              <h2 className="font-bold mb-4">Summary</h2>
              <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm mb-2"><span>Shipping</span><span>₦{shipping.toLocaleString()}</span></div>
              <div className="flex justify-between font-bold border-t border-border pt-2 mt-2"><span>Total</span><span>₦{total.toLocaleString()}</span></div>
              <button onClick={() => router.push("/checkout")} className="w-full mt-4 bg-brand text-white py-2 rounded-full">Checkout</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
