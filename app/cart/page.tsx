// app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const supabase = createClient();

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchCart() {
      const { data } = await supabase
        .from("cart_items")
        .select("id, name, price, quantity")
        .order("added_at", { ascending: true });

      setItems((data ?? []) as CartItem[]);
      setLoading(false);
    }

    fetchCart();
  }, [user, authLoading]);

  async function updateQuantity(id: number, newQty: number) {
    if (newQty < 1) return;
    await supabase.from("cart_items").update({ quantity: newQty }).eq("id", id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  }

  async function removeItem(id: number) {
    await supabase.from("cart_items").delete().eq("id", id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-8 py-24">
        <h1 className="mb-10 text-4xl font-black">
          Your <span className="text-red-500">Cart</span>
        </h1>

        {authLoading || loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : !user ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
            Please sign in to view your cart.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
            Your cart is empty.
            <div className="mt-4">
              <Link href="/pc-builder" className="text-red-500 hover:underline">
                Start building a PC →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b border-zinc-800 px-8 py-6 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 rounded-xl border border-zinc-700 px-3 py-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-gray-400 hover:text-white"
                      >
                        −
                      </button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-gray-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>

                    <p className="w-28 text-right font-semibold text-red-500">
                      {formatPrice(item.price * item.quantity)}
                    </p>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-gray-500 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-3xl border border-zinc-800 bg-zinc-900 px-8 py-6">
              <span className="text-lg text-gray-400">Total</span>
              <span className="text-3xl font-black text-red-500">{formatPrice(total)}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full rounded-xl bg-red-600 py-4 text-center font-semibold hover:bg-red-700"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}