// app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

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
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

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

  function handleApplyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (code === "ZEN5000" || code === "ZENPRO") {
      setPromoDiscount(2500);
      setPromoMessage("✓ Promo code applied! ₹2,500 off your assembly.");
    } else {
      setPromoDiscount(0);
      setPromoMessage("Invalid promo code. Try 'ZENPRO'.");
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = Math.max(0, subtotal - promoDiscount);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Cyber Header */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-black to-black py-16">
        <div className="absolute top-0 right-1/4 h-80 w-80 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400">
            <ShoppingCart className="h-4 w-4" />
            <span>Order Staging & Review</span>
          </div>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
            Shopping <span className="text-red-500">Cart</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Review your selected gaming hardware rigs and custom configurations before checkout.
          </p>
        </div>
      </section>

      {/* Main Cart Body */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {authLoading || loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center text-zinc-400">
            Loading your cart items...
          </div>
        ) : !user ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl">
            <ShoppingCart className="mx-auto h-12 w-12 text-zinc-600" />
            <h2 className="mt-4 text-xl font-bold text-white">Your Cart is Waiting</h2>
            <p className="mt-2 text-xs text-zinc-400 max-w-sm mx-auto">
              Please sign in with your Google account to access your saved hardware builds and cart.
            </p>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="mt-6 rounded-xl bg-red-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-red-700"
            >
              Sign In with Google
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-16 text-center shadow-xl">
            <ShoppingCart className="mx-auto h-14 w-14 text-zinc-700" />
            <h2 className="mt-4 text-2xl font-bold text-white">Your cart is currently empty</h2>
            <p className="mt-2 text-xs text-zinc-400 max-w-md mx-auto">
              Explore our ready-to-ship high-refresh rigs or configure your bespoke gaming computer
              with our interactive 3D PC Builder.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/ready-pcs"
                className="rounded-xl bg-red-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Browse Ready PCs
              </Link>
              <Link
                href="/pc-builder"
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-xs font-bold text-zinc-300 transition hover:border-red-500 hover:text-white"
              >
                Launch PC Builder
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Items Column (8 Cols) */}
            <div className="space-y-4 lg:col-span-8">
              <div className="overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950 p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <h3 className="text-base font-bold text-white">Selected Build Items ({items.length})</h3>
                  <span className="text-xs text-zinc-400">All prices inclusive of 18% GST</span>
                </div>

                <div className="divide-y divide-zinc-800/80">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="max-w-md">
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <span className="mt-1 block text-xs text-zinc-500">
                          {formatPrice(item.price)} each • 3-Year On-Site Warranty
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-6 sm:justify-end">
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-zinc-400 hover:text-white transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-zinc-400 hover:text-white transition"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <span className="w-28 text-right text-base font-black text-red-500">
                          {formatPrice(item.price * item.quantity)}
                        </span>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-red-500 transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping Link */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/ready-pcs"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Continue Browsing Systems</span>
                </Link>
                <Link
                  href="/pc-builder"
                  className="text-xs font-semibold text-red-400 hover:underline"
                >
                  Add Another Custom PC Build →
                </Link>
              </div>
            </div>

            {/* Order Summary Column (4 Cols) */}
            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
                <h3 className="text-base font-bold text-white border-b border-zinc-800/80 pb-4">
                  Summary & Checkout
                </h3>

                {/* Promo Code Input */}
                <div className="mt-5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Promo / Partner Code
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code (e.g. ZENPRO)"
                      className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white uppercase focus:border-red-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700 transition"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p className={`mt-2 text-xs font-medium ${promoDiscount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>

                {/* Cost Breakdown */}
                <div className="mt-6 space-y-3 border-t border-zinc-800/80 pt-4 text-xs text-zinc-400">
                  <div className="flex justify-between">
                    <span>Hardware Subtotal:</span>
                    <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Promo Discount:</span>
                      <span>- {formatPrice(promoDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Doorstep Setup & Transit:</span>
                    <span className="font-semibold text-emerald-400">FREE (White-Glove)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3-Year On-Site Warranty:</span>
                    <span className="font-semibold text-emerald-400">INCLUDED</span>
                  </div>

                  <div className="border-t border-zinc-800/80 pt-4 flex items-baseline justify-between">
                    <span className="text-sm font-bold uppercase tracking-wider text-white">Total:</span>
                    <span className="text-3xl font-black text-red-500">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-4 text-center text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {/* Security badges */}
                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-zinc-800/60 pt-4 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Cards & NetBanking</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-emerald-400" />
                    <span>256-Bit Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
