import Link from "next/link";
import { Facebook, Instagram, Phone, MessageCircle } from "lucide-react";

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <img src="/xaviour logo.jpg" alt="Xaviourbeautystore" className="h-12 w-auto mb-3 brightness-0 invert" />
          <p className="text-sm">Professional beauty, skincare, spa and salon equipment for professionals.</p>
          <div className="flex items-center gap-3 mt-4">
            <a href="https://www.facebook.com/xaviourbeautystore" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/xaviourbeautystore" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="https://www.tiktok.com/@xaviourbeautystore" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition" aria-label="TikTok">
              <TikTokIcon size={20} />
            </a>
            <a href="https://x.com/xaviourbeautystore" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition" aria-label="X">
              <XIcon size={20} />
            </a>
            <a href="https://wa.me/2348097513421" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition" aria-label="WhatsApp">
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="hover:text-brand">All Products</Link></li>
            <li><Link href="/shop?featured=true" className="hover:text-brand">Featured</Link></li>
            <li><Link href="/shop?newArrival=true" className="hover:text-brand">New Arrivals</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/ceo-corner" className="hover:text-brand">CEO Corner</Link></li>
            <li><Link href="/testimonials" className="hover:text-brand">Testimonials</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone size={16} /> <a href="tel:+2348039640776" className="hover:text-brand">08039640776</a></li>
            <li className="flex items-center gap-2"><MessageCircle size={16} /> <a href="https://wa.me/2348097513421" target="_blank" rel="noopener noreferrer" className="hover:text-brand">08097513421 (WhatsApp)</a></li>
            <li>support@xaviourbeautystore.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-4 text-center text-xs">
        © 2026 Xaviourbeautystore. All rights reserved.
      </div>
    </footer>
  );
}

