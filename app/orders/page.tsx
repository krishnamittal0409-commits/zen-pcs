// app/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle2,
  Cpu,
  Truck,
  Wrench,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

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
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const BUILD_STAGES = [
  { key: "confirmed", label: "Confirmed", desc: "Parts Reserved", icon: CheckCircle2 },
  { key: "assembly", label: "Assembly", desc: "Cleanroom Wiring", icon: Wrench },
  { key: "burnin", label: "Stress Test", desc: "48h Thermal Run", icon: Cpu },
  { key: "transit", label: "Doorstep Transit", desc: "White-Glove Van", icon: Truck },
  { key: "completed", label: "Completed", desc: "Setup & Benchmarked", icon: ShieldCheck },
];

export default function OrdersPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
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
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Cyber Header */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-black to-black py-16">
        <div className="absolute top-0 right-1/3 h-80 w-80 rounded-full bg-red-600/10 blur-[130px] pointer-events-none" />

        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400">
            <Package className="h-4 w-4" />
            <span>Customer Hardware Portal</span>
          </div>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">
            Order & <span className="text-red-500">Build Tracking</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Monitor real-time assembly progress, thermal stress-test telemetry, and delivery status.
          </p>
        </div>
      </section>

      {/* Main Orders List */}
      <section className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        {authLoading || loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center text-zinc-400">
            Loading your order history...
          </div>
        ) : !user ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl">
            <Package className="mx-auto h-12 w-12 text-zinc-600" />
            <h2 className="mt-4 text-xl font-bold text-white">Sign In to Track Orders</h2>
            <p className="mt-2 text-xs text-zinc-400 max-w-sm mx-auto">
              Please sign in with your account to view live build updates and past invoices.
            </p>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="mt-6 rounded-xl bg-red-600 px-6 py-3 text-xs font-bold text-white transition hover:bg-red-700"
            >
              Sign In with Google
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-16 text-center shadow-xl">
            <Package className="mx-auto h-14 w-14 text-zinc-700" />
            <h2 className="mt-4 text-2xl font-bold text-white">No active orders placed yet</h2>
            <p className="mt-2 text-xs text-zinc-400 max-w-md mx-auto">
              Ready to construct your battlestation? Select a pre-configured ready PC or assemble
              your custom components in the PC Builder.
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
                Launch Builder
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-xl"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                      Order #{order.id}
                    </span>
                    <h3 className="mt-1 text-2xl font-black text-white">
                      {formatPrice(order.total)}
                    </h3>
                    <span className="text-xs text-zinc-500">Placed on {formatDate(order.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                      {order.status || "Active Order"}
                    </span>
                  </div>
                </div>

                {/* Visual 5-Stage Build Pipeline Stepper */}
                <div className="py-8 border-b border-zinc-800/80">
                  <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-6">
                    Boutique Assembly Pipeline
                  </span>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                    {BUILD_STAGES.map((stage, idx) => {
                      const StageIcon = stage.icon;
                      const isComplete = idx <= 2; // Simulated stage for test order
                      const isCurrent = idx === 2;

                      return (
                        <div
                          key={stage.key}
                          className={`flex flex-col items-center rounded-2xl border p-3.5 text-center transition ${
                            isCurrent
                              ? "border-red-500 bg-red-600/15 shadow-md shadow-red-950/40"
                              : isComplete
                              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                              : "border-zinc-800/80 bg-zinc-900/40 opacity-50"
                          }`}
                        >
                          <StageIcon
                            className={`h-5 w-5 ${
                              isCurrent ? "text-red-400 animate-pulse" : isComplete ? "text-emerald-400" : "text-zinc-600"
                            }`}
                          />
                          <span className="mt-2 text-xs font-bold text-white">{stage.label}</span>
                          <span className="text-[10px] text-zinc-400">{stage.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                    Components & Systems in Build
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4 text-xs"
                      >
                        <div>
                          <strong className="text-white block text-sm">{item.name}</strong>
                          <span className="text-zinc-500">Qty: {item.quantity}</span>
                        </div>
                        <span className="font-extrabold text-red-400">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer note */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800/60 pt-4 text-xs text-zinc-500">
                  <span>Assigned Assembly Engineer: Senior Hardware Specialist (Lab Bay 04)</span>
                  <Link href="/support" className="text-red-400 hover:underline">
                    Need Help with this Order? Contact Support →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
