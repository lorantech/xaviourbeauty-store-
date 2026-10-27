"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { count } = useCart();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/ceo-corner", label: "CEO Corner" },
    { href: "/testimonials", label: "Testimonials" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/xaviour logo.jpg" alt="Xaviourbeautystore" className="h-10 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm hover:text-brand transition ${pathname === l.href ? "text-brand font-medium" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/shop" className="p-2 hover:text-brand" aria-label="Search">
            <Search size={20} />
          </Link>
          <Link href="/cart" className="relative p-2 hover:text-brand" aria-label="Cart">
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {user.role === "admin" && (
                <Link href="/admin" className="text-sm hover:text-brand">Admin</Link>
              )}
              <Link href="/account" className="p-2 hover:text-brand" aria-label="Account">
                <User size={20} />
              </Link>
              <button onClick={logout} className="text-sm text-zinc-600 hover:text-brand">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="hidden md:inline text-sm hover:text-brand">
              Sign in
            </Link>
          )}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-4 py-3 flex flex-col gap-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" onClick={() => setOpen(false)}>Admin</Link>
              )}
              <Link href="/account" onClick={() => setOpen(false)}>Account</Link>
              <button onClick={() => { logout(); setOpen(false); }} className="text-left py-1">
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login" onClick={() => setOpen(false)}>Sign in</Link>
          )}
        </div>
      )}
    </header>
  );
}
