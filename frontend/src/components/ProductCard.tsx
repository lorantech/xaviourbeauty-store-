"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { BACKEND_URL } from "@/lib/api";

export default function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart();
  const img = product.images?.[0]
    ? (product.images[0].startsWith("http") ? product.images[0] : product.images[0])
    : "/placeholder.svg";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-muted overflow-hidden">
          <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-brand">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-brand font-bold">₦{Number(product.price).toLocaleString()}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-zinc-400 line-through ml-2">₦{Number(product.originalPrice).toLocaleString()}</span>
            )}
          </div>
          <button
            onClick={() => addItem(product._id, 1)}
            className="p-2 rounded-full bg-brand text-white hover:bg-brand-dark transition"
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
        {product.stockQuantity <= 0 && (
          <p className="text-xs text-red-500 mt-1">Out of stock</p>
        )}
      </div>
    </motion.div>
  );
}
