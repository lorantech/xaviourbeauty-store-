"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export interface CartItem {
  _id: string;
  product: any;
  quantity: number;
  priceSnapshot: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  coupon?: any;
}

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  count: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/cart");
      setCart(data.cart);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [user]);

  const addItem = async (productId: string, quantity = 1) => {
    const { data } = await api.post("/cart/items", { productId, quantity });
    setCart(data.cart);
  };

  const updateItem = async (itemId: string, quantity: number) => {
    const { data } = await api.patch(`/cart/items/${itemId}`, { quantity });
    setCart(data.cart);
  };

  const removeItem = async (itemId: string) => {
    const { data } = await api.delete(`/cart/items/${itemId}`);
    setCart(data.cart);
  };

  const count = cart?.items?.reduce((a, i) => a + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, refresh, addItem, updateItem, removeItem, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
