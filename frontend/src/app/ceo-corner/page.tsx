"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, BACKEND_URL } from "@/lib/api";

export default function CeoCorner() {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    api.get("/ceo-corner").then((r) => setMessages(r.data.messages || [])).catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1">
        <h1 className="text-3xl font-bold mb-8">CEO Corner</h1>
        <div className="space-y-8">
          {messages.map((m: any) => (
            <article key={m._id} className="bg-white border border-border rounded-xl p-6 shadow-sm">
              {m.bannerImage && (
                <img src={m.bannerImage.startsWith("http") ? m.bannerImage : m.bannerImage} alt={m.title} className="w-full h-48 object-cover rounded-lg mb-4" />
              )}
              <div className="flex items-center gap-4 mb-4">
                {m.profileImage && (
                  <img src={m.profileImage.startsWith("http") ? m.profileImage : m.profileImage} alt={m.ceoName} className="w-16 h-16 rounded-full object-cover" />
                )}
                <div>
                  <h2 className="text-xl font-bold">{m.title}</h2>
                  <p className="text-sm text-zinc-500">{m.ceoName} — {m.designation}</p>
                </div>
              </div>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{m.message}</p>
            </article>
          ))}
          {messages.length === 0 && <p className="text-zinc-500">No messages yet.</p>}
        </div>
      </main>
      <Footer />
    </>
  );
}
