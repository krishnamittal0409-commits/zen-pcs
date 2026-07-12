// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const supabase = createClient();

type Tab = "orders" | "byop" | "components" | "users" | "tickets";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  user_id: string;
  status: string;
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  created_at: string;
  items: OrderItem[];
}

interface SubmissionPart {
  id: number;
  category: string;
  raw_text: string;
}

interface Submission {
  id: number;
  user_id: string;
  status: string;
  wants_os: boolean;
  os_choice: string | null;
  os_fee: number;
  assembly_fee: number;
  total_fee: number;
  created_at: string;
  parts: SubmissionPart[];
}

const ORDER_STATUSES = ["Pending", "Confirmed", "Shipped", "Completed", "Cancelled"];
const SUBMISSION_STATUSES = ["pending review", "approved", "rejected", "completed"];

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

function orderStatusColor(status: string): string {
  switch (status) {
    case "Pending":
      return "border-yellow-900 bg-yellow-950/40 text-yellow-400";
    case "Confirmed":
      return "border-blue-900 bg-blue-950/40 text-blue-400";
    case "Shipped":
      return "border-purple-900 bg-purple-950/40 text-purple-400";
    case "Completed":
      return "border-green-900 bg-green-950/40 text-green-400";
    case "Cancelled":
      return "border-red-900 bg-red-950/40 text-red-400";
    default:
      return "border-zinc-800 bg-zinc-900 text-gray-400";
  }
}

function submissionStatusColor(status: string): string {
  switch (status) {
    case "pending review":
      return "border-yellow-900 bg-yellow-950/40 text-yellow-400";
    case "approved":
      return "border-green-900 bg-green-950/40 text-green-400";
    case "rejected":
      return "border-red-900 bg-red-950/40 text-red-400";
    case "completed":
      return "border-blue-900 bg-blue-950/40 text-blue-400";
    default:
      return "border-zinc-800 bg-zinc-900 text-gray-400";
  }
}

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // BYOP submissions
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();
    fetchSubmissions();
  }, [isAdmin]);

  async function fetchOrders() {
    setOrdersLoading(true);

    const { data: ordersData } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!ordersData || ordersData.length === 0) {
      setOrders([]);
      setOrdersLoading(false);
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
    setOrdersLoading(false);
  }

  async function updateOrderStatus(orderId: number, newStatus: string) {
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  }

  async function fetchSubmissions() {
    setSubmissionsLoading(true);

    const { data: submissionsData } = await supabase
      .from("custom_build_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!submissionsData || submissionsData.length === 0) {
      setSubmissions([]);
      setSubmissionsLoading(false);
      return;
    }

    const submissionIds = submissionsData.map((s) => s.id);
    const { data: partsData } = await supabase
      .from("custom_build_parts")
      .select("id, submission_id, category, raw_text")
      .in("submission_id", submissionIds);

    const combined: Submission[] = submissionsData.map((submission) => ({
      ...submission,
      parts: (partsData ?? []).filter((p) => p.submission_id === submission.id),
    }));

    setSubmissions(combined);
    setSubmissionsLoading(false);
  }

  async function updateSubmissionStatus(submissionId: number, newStatus: string) {
    await supabase
      .from("custom_build_submissions")
      .update({ status: newStatus })
      .eq("id", submissionId);
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, status: newStatus } : s))
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-6xl px-8 py-16">
        <h1 className="mb-8 text-4xl font-black">
          Admin <span className="text-red-500">Panel</span>
        </h1>

        {authLoading ? (
          <p className="text-gray-400">Loading…</p>
        ) : !user || !isAdmin ? (
          <div className="rounded-3xl border border-red-900 bg-red-950/20 p-8 text-center text-red-400">
            You don&apos;t have access to this page.
            <div className="mt-4">
              <Link href="/" className="text-red-500 hover:underline">
                ← Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-8 flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
              {(
                [
                  { key: "orders", label: "Orders" },
                  { key: "byop", label: "BYOP Submissions" },
                  { key: "components", label: "Components" },
                  { key: "users", label: "Users" },
                  { key: "tickets", label: "Support Tickets" },
                ] as { key: Tab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "bg-red-600 text-white"
                      : "bg-zinc-900 text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders tab */}
            {activeTab === "orders" && (
              <div className="space-y-5">
                {ordersLoading ? (
                  <p className="text-gray-400">Loading orders…</p>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500">No orders yet.</p>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-6 py-4">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.created_at)} · {order.customer_name} ·{" "}
                            {order.customer_phone}
                          </p>
                        </div>

                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`rounded-full border px-4 py-1.5 text-xs font-medium ${orderStatusColor(
                            order.status
                          )}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-black text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="px-6 py-4">
                        <p className="mb-2 text-xs uppercase tracking-widest text-gray-500">
                          Delivery Address
                        </p>
                        <p className="mb-4 text-sm text-gray-400">{order.customer_address}</p>

                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-300">
                                {item.name} × {item.quantity}
                              </span>
                              <span className="text-gray-500">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3 font-semibold">
                          <span>Total</span>
                          <span className="text-red-500">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* BYOP Submissions tab */}
            {activeTab === "byop" && (
              <div className="space-y-5">
                {submissionsLoading ? (
                  <p className="text-gray-400">Loading submissions…</p>
                ) : submissions.length === 0 ? (
                  <p className="text-gray-500">No submissions yet.</p>
                ) : (
                  submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-6 py-4">
                        <div>
                          <p className="font-semibold">Submission #{submission.id}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(submission.created_at)}
                          </p>
                        </div>

                        <select
                          value={submission.status}
                          onChange={(e) =>
                            updateSubmissionStatus(submission.id, e.target.value)
                          }
                          className={`rounded-full border px-4 py-1.5 text-xs font-medium ${submissionStatusColor(
                            submission.status
                          )}`}
                        >
                          {SUBMISSION_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-black text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="px-6 py-4">
                        <p className="mb-2 text-xs uppercase tracking-widest text-gray-500">
                          Parts Listed
                        </p>
                        <div className="mb-4 space-y-1">
                          {submission.parts.map((part) => (
                            <p key={part.id} className="text-sm text-gray-300">
                              <span className="text-gray-500">{part.category}:</span>{" "}
                              {part.raw_text}
                            </p>
                          ))}
                        </div>

                        <div className="space-y-1 border-t border-zinc-800 pt-3 text-sm text-gray-400">
                          <div className="flex items-center justify-between">
                            <span>Operating System</span>
                            <span>
                              {submission.wants_os ? submission.os_choice : "Not requested"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>OS Fee</span>
                            <span>{formatPrice(submission.os_fee)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Assembly Fee</span>
                            <span>{formatPrice(submission.assembly_fee)}</span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-3 font-semibold">
                          <span>Total Fee</span>
                          <span className="text-red-500">
                            {formatPrice(submission.total_fee)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "components" && (
              <p className="text-gray-500">Components — coming next.</p>
            )}
            {activeTab === "users" && (
              <p className="text-gray-500">Users — coming next.</p>
            )}
            {activeTab === "tickets" && (
              <p className="text-gray-500">Support Tickets — coming next.</p>
            )}
          </>
        )}
      </section>
    </main>
  );
}