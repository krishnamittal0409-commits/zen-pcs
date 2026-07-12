// app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
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

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

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

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handlePlaceOrder() {
    if (!user) return;

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setFormError("Please fill in your name, phone, and address.");
      return;
    }

    setFormError(null);
    setPlacingOrder(true);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress.trim(),
      })
      .select()
      .single();

    if (orderError || !order) {
      setPlacingOrder(false);
      alert("Couldn't place order: " + (orderError?.message ?? "unknown error"));
      return;
    }

    const orderItemRows = items.map((item) => ({
      order_id: order.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemRows);

    if (itemsError) {
      setPlacingOrder(false);
      alert("Order created, but couldn't save items: " + itemsError.message);
      return;
    }

    const cartIds = items.map((item) => item.id);
    await supabase.from("cart_items").delete().in("id", cartIds);

    setPlacingOrder(false);
    router.push(`/order-confirmation?order=${order.id}`);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-3xl px-8 py-24">
        <h1 className="mb-10 text-4xl font-black">
          <span className="text-red-500">Checkout</span>
        </h1>

        {authLoading || loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : !user ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
            Please sign in to checkout.
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
          <div className="space-y-8">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                <span className="h-6 w-1 rounded-full bg-red-600" />
                Order Summary
              </h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-gray-400">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-4 border-t border-zinc-800" />

              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-red-500">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                <span className="h-6 w-1 rounded-full bg-red-600" />
                Your Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-400">Full name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">Phone number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">Delivery address</label>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {formError && <p className="mt-4 text-sm text-red-500">{formError}</p>}
            </div>

            <div className="rounded-3xl border border-red-900/60 bg-zinc-900 p-8">
              <h2 className="mb-3 flex items-center gap-3 text-xl font-bold">
                <span className="h-5 w-1 rounded-full bg-red-600" />
                Payment
              </h2>
              <p className="text-sm text-gray-400">
                No payment is needed online. Our technician will come set up
                your PC and show you how everything works — you can pay them
                directly at that time, either in cash or online (UPI).
              </p>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full rounded-xl bg-red-600 py-4 font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}