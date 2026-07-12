// app/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
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
  created_at: string;
  items: OrderItem[];
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchOrders() {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total, status, created_at")
        .order("created_at", { ascending: false });

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderIds = ordersData.map((o) => o.id);

      const { data: itemsData } = await supabase
        .from("order_items")
        .select("id, order_id, name, price, quantity")
        .in("order_id", orderIds);

      const combined: Order[] = ordersData.map((order) => ({
        ...order,
        items: (itemsData ?? []).filter((item) => item.order_id === order.id),
      }));

      setOrders(combined);
      setLoading(false);
    }

    fetchOrders();
  }, [user, authLoading]);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-8 py-24">
        <h1 className="mb-10 text-4xl font-black">
          Order <span className="text-red-500">History</span>
        </h1>

        {authLoading || loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : !user ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
            Please sign in to view your orders.
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
            You haven&apos;t placed any orders yet.
            <div className="mt-4">
              <Link href="/ready-pcs" className="text-red-500 hover:underline">
                Browse Ready PCs →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-8 py-5">
                  <div>
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <span className="rounded-full border border-green-900 bg-green-950/40 px-4 py-1.5 text-xs font-medium text-green-400">
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3 px-8 py-6">
                  {order.items.map((item) => (
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

                <div className="flex items-center justify-between border-t border-zinc-800 px-8 py-5 font-semibold">
                  <span>Total</span>
                  <span className="text-red-500">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}