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

function OrderConfirmationContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const paymentParam = searchParams.get("payment");
  const paymentIdParam = searchParams.get("payment_id");

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

  const isOnlinePaid =
    paymentParam === "online" ||
    order?.status?.toLowerCase().includes("paid") ||
    order?.status?.toLowerCase().includes("razorpay");

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
          {/* Header Card */}
          <div
            className={`rounded-3xl border p-8 text-center ${
              isOnlinePaid
                ? "border-emerald-800/80 bg-emerald-950/20"
                : "border-green-900 bg-green-950/20"
            }`}
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              {isOnlinePaid ? "✓ Paid via Razorpay (Test Mode)" : "✓ Cash on Delivery Confirmed"}
            </div>

            <h1 className="text-3xl font-black text-white">
              {isOnlinePaid ? "Payment Successful & Order Placed!" : "Order Placed Successfully!"}
            </h1>

            <p className="mt-2 text-sm font-medium text-gray-300">
              Order #{order.id} • Status: <span className="font-bold text-white">{order.status}</span>
            </p>

            {isOnlinePaid && paymentIdParam && (
              <p className="mt-1 text-xs font-mono text-emerald-400">
                Razorpay Payment ID: {paymentIdParam}
              </p>
            )}

            <p className="mx-auto mt-4 max-w-lg text-sm text-gray-300 leading-relaxed">
              {isOnlinePaid ? (
                <>
                  Your payment of <span className="font-bold text-emerald-400">{formatPrice(order.total)}</span> was
                  verified successfully. Our technician will contact you soon to schedule a visit, deliver, and set up your dream PC.
                </>
              ) : (
                <>
                  Our technician will contact you soon to schedule a visit, deliver and assemble your PC. You can pay
                  them directly at that time — either in cash or online (UPI).
                </>
              )}
            </p>
          </div>

          {/* Order Items */}
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
              <span>Total Amount</span>
              <span className="text-red-500">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Delivery & Payment Details */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h2 className="mb-4 flex items-center gap-3 text-xl font-bold">
              <span className="h-6 w-1 rounded-full bg-red-600" />
              Delivery Details
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">
                <span className="text-gray-500">Name: </span>
                {order.customer_name}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-500">Phone: </span>
                {order.customer_phone}
              </p>
              <div className="text-gray-300 whitespace-pre-line">
                <span className="text-gray-500">Address & Info: </span>
                {order.customer_address}
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="block w-full rounded-xl bg-red-600 py-4 text-center font-semibold transition hover:bg-red-700"
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
