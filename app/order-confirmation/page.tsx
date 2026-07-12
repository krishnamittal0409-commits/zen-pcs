// app/order-confirmation/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const supabase = createClient();

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  total: number;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  created_at: string;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

// This inner component is the one that actually calls useSearchParams().
// Next.js requires anything using that hook to be wrapped in <Suspense>
// during a production build, hence splitting it out from the page's
// default export below.
function OrderConfirmationContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !orderId) {
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      const { data: itemsData } = await supabase
        .from("order_items")
        .select("id, name, price, quantity")
        .eq("order_id", orderId);

      setOrder(orderData as Order);
      setItems((itemsData ?? []) as OrderItem[]);
      setLoading(false);
    }

    fetchOrder();
  }, [user, authLoading, orderId]);

  return (
    <section className="mx-auto max-w-3xl px-8 py-24">
      {authLoading || loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : !user ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
          Please sign in to view this order.
        </div>
      ) : !order ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
          Order not found.
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-3xl border border-green-900 bg-green-950/20 p-8 text-center">
            <h1 className="text-3xl font-black text-green-400">
              Order Placed!
            </h1>
            <p className="mt-3 text-gray-300">
              Order #{order.id} — {order.status}
            </p>
            <p className="mx-auto mt-4 max-w-lg text-sm text-gray-400">
              Our technician will contact you soon to schedule a visit,
              set up your PC, and walk you through how everything works.
              You can pay them then — cash or online (UPI).
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-bold">
              <span className="h-6 w-1 rounded-full bg-red-600" />
              Order Items
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
              <span className="text-red-500">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="mb-4 flex items-center gap-3 text-xl font-bold">
              <span className="h-6 w-1 rounded-full bg-red-600" />
              Delivery Details
            </h2>
            <p className="text-sm text-gray-400">{order.customer_name}</p>
            <p className="text-sm text-gray-400">{order.customer_phone}</p>
            <p className="text-sm text-gray-400">{order.customer_address}</p>
          </div>

          <Link
            href="/"
            className="block w-full rounded-xl bg-red-600 py-4 text-center font-semibold hover:bg-red-700"
          >
            Back to Home
          </Link>
        </div>
      )}
    </section>
  );
}

export default function OrderConfirmationPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Suspense fallback={<p className="px-8 py-24 text-gray-400">Loading…</p>}>
        <OrderConfirmationContent />
      </Suspense>
    </main>
  );
}
