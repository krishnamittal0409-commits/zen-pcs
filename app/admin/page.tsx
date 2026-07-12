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

// Matches the real category values stored in your components table.
interface Component {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  brand: string | null;
  socket: string | null;
  chipset: string | null;
  capacity: string | null;
  speed: string | null;
  wattage: string | null;
  efficiency: string | null;
  form_factor: string | null;
  image_url: string | null;
  benchmark_score: number | null;
}

const CATEGORIES = ["cpu", "gpu", "motherboard", "ram", "storage", "psu", "cooling", "case"];

const EMPTY_COMPONENT_FORM = {
  name: "",
  category: CATEGORIES[0],
  price: "",
  stock: "",
  active: true,
  brand: "",
  socket: "",
  chipset: "",
  capacity: "",
  speed: "",
  wattage: "",
  efficiency: "",
  form_factor: "",
  image_url: "",
  benchmark_score: "",
};

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

  // Components
  const [components, setComponents] = useState<Component[]>([]);
  const [componentsLoading, setComponentsLoading] = useState(true);
  const [componentsError, setComponentsError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_COMPONENT_FORM });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_COMPONENT_FORM });
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();
    fetchSubmissions();
    fetchComponents();
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

  // ----- Components -----

  async function fetchComponents() {
    setComponentsLoading(true);
    setComponentsError(null);

    const { data, error } = await supabase
      .from("components")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      setComponentsError(error.message);
      setComponentsLoading(false);
      return;
    }

    setComponents((data ?? []) as Component[]);
    setComponentsLoading(false);
  }

  // Turns the empty-string form fields into the right types/nulls for
  // Supabase before inserting or updating.
  function buildComponentPayload(form: typeof EMPTY_COMPONENT_FORM) {
    return {
      name: form.name.trim(),
      category: form.category,
      price: form.price === "" ? 0 : Number(form.price),
      stock: form.stock === "" ? 0 : Number(form.stock),
      active: form.active,
      brand: form.brand.trim() || null,
      socket: form.socket.trim() || null,
      chipset: form.chipset.trim() || null,
      capacity: form.capacity.trim() || null,
      speed: form.speed.trim() || null,
      wattage: form.wattage.trim() || null,
      efficiency: form.efficiency.trim() || null,
      form_factor: form.form_factor.trim() || null,
      image_url: form.image_url.trim() || null,
      benchmark_score: form.benchmark_score === "" ? null : Number(form.benchmark_score),
    };
  }

  async function handleAddComponent() {
    if (!addForm.name.trim()) {
      setComponentsError("Component name is required.");
      return;
    }

    setAddSubmitting(true);
    setComponentsError(null);

    const { error } = await supabase
      .from("components")
      .insert(buildComponentPayload(addForm));

    setAddSubmitting(false);

    if (error) {
      setComponentsError(error.message);
      return;
    }

    setAddForm({ ...EMPTY_COMPONENT_FORM });
    setShowAddForm(false);
    fetchComponents();
  }

  function startEditing(component: Component) {
    setEditingId(component.id);
    setEditForm({
      name: component.name,
      category: component.category,
      price: String(component.price ?? ""),
      stock: String(component.stock ?? ""),
      active: component.active,
      brand: component.brand ?? "",
      socket: component.socket ?? "",
      chipset: component.chipset ?? "",
      capacity: component.capacity ?? "",
      speed: component.speed ?? "",
      wattage: component.wattage ?? "",
      efficiency: component.efficiency ?? "",
      form_factor: component.form_factor ?? "",
      image_url: component.image_url ?? "",
      benchmark_score: component.benchmark_score !== null ? String(component.benchmark_score) : "",
    });
  }

  async function handleSaveEdit(id: number) {
    setEditSubmitting(true);
    setComponentsError(null);

    const { error } = await supabase
      .from("components")
      .update(buildComponentPayload(editForm))
      .eq("id", id);

    setEditSubmitting(false);

    if (error) {
      setComponentsError(error.message);
      return;
    }

    setEditingId(null);
    fetchComponents();
  }

  async function handleDeleteComponent(id: number, name: string) {
    const confirmed = window.confirm(`Delete "${name}"? This can't be undone.`);
    if (!confirmed) return;

    const { error } = await supabase.from("components").delete().eq("id", id);

    if (error) {
      setComponentsError(error.message);
      return;
    }

    fetchComponents();
  }

  const visibleComponents =
    categoryFilter === "all"
      ? components
      : components.filter((c) => c.category === categoryFilter);

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
                          className={`rounded-full border px-4 py-1.5 text-xs font-medium capitalize ${submissionStatusColor(
                            submission.status
                          )}`}
                        >
                          {SUBMISSION_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-black text-white capitalize">
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

            {/* Components tab */}
            {activeTab === "components" && (
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-lg border border-zinc-700 bg-black px-4 py-2 text-sm text-white"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm((prev) => !prev);
                      setComponentsError(null);
                    }}
                    className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    {showAddForm ? "Cancel" : "+ Add Component"}
                  </button>
                </div>

                {componentsError && (
                  <p className="mb-4 text-sm text-red-500">{componentsError}</p>
                )}

                {/* Add form */}
                {showAddForm && (
                  <div className="mb-6 rounded-2xl border border-red-900/60 bg-zinc-900 p-6">
                    <h3 className="mb-4 text-lg font-bold">New Component</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      <input
                        placeholder="Name"
                        value={addForm.name}
                        onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      />
                      <select
                        value={addForm.category}
                        onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <input
                        placeholder="Price"
                        type="number"
                        value={addForm.price}
                        onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Stock"
                        type="number"
                        value={addForm.stock}
                        onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Brand"
                        value={addForm.brand}
                        onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Socket (CPU/Motherboard)"
                        value={addForm.socket}
                        onChange={(e) => setAddForm({ ...addForm, socket: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Chipset"
                        value={addForm.chipset}
                        onChange={(e) => setAddForm({ ...addForm, chipset: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Capacity (RAM/Storage)"
                        value={addForm.capacity}
                        onChange={(e) => setAddForm({ ...addForm, capacity: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Speed"
                        value={addForm.speed}
                        onChange={(e) => setAddForm({ ...addForm, speed: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Wattage (PSU)"
                        value={addForm.wattage}
                        onChange={(e) => setAddForm({ ...addForm, wattage: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Efficiency (PSU)"
                        value={addForm.efficiency}
                        onChange={(e) => setAddForm({ ...addForm, efficiency: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Form Factor"
                        value={addForm.form_factor}
                        onChange={(e) => setAddForm({ ...addForm, form_factor: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Benchmark Score (0-100)"
                        type="number"
                        value={addForm.benchmark_score}
                        onChange={(e) =>
                          setAddForm({ ...addForm, benchmark_score: e.target.value })
                        }
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                      />
                      <input
                        placeholder="Image URL"
                        value={addForm.image_url}
                        onChange={(e) => setAddForm({ ...addForm, image_url: e.target.value })}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white sm:col-span-2"
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          checked={addForm.active}
                          onChange={(e) => setAddForm({ ...addForm, active: e.target.checked })}
                          className="h-4 w-4 accent-red-600"
                        />
                        Active (visible to customers)
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddComponent}
                      disabled={addSubmitting}
                      className="mt-4 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {addSubmitting ? "Adding…" : "Add Component"}
                    </button>
                  </div>
                )}

                {/* Components list */}
                {componentsLoading ? (
                  <p className="text-gray-400">Loading components…</p>
                ) : visibleComponents.length === 0 ? (
                  <p className="text-gray-500">No components in this category.</p>
                ) : (
                  <div className="space-y-3">
                    {visibleComponents.map((component) => (
                      <div
                        key={component.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                      >
                        {editingId === component.id ? (
                          <div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                              <input
                                placeholder="Name"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, name: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              />
                              <select
                                value={editForm.category}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, category: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              >
                                {CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                              <input
                                placeholder="Price"
                                type="number"
                                value={editForm.price}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, price: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              />
                              <input
                                placeholder="Stock"
                                type="number"
                                value={editForm.stock}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, stock: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              />
                              <input
                                placeholder="Brand"
                                value={editForm.brand}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, brand: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              />
                              <input
                                placeholder="Socket"
                                value={editForm.socket}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, socket: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              />
                              <input
                                placeholder="Chipset"
                                value={editForm.chipset}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, chipset: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              />
                              <input
                                placeholder="Capacity"
                                value={editForm.capacity}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, capacity: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              />
                              <input
                                placeholder="Speed"
                                value={editForm.speed}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, speed: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              />
                              <input
                                placeholder="Wattage"
                                value={editForm.wattage}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, wattage: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              />
                              <input
                                placeholder="Efficiency"
                                value={editForm.efficiency}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, efficiency: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              />
                              <input
                                placeholder="Form Factor"
                                value={editForm.form_factor}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, form_factor: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              />
                              <input
                                placeholder="Benchmark Score"
                                type="number"
                                value={editForm.benchmark_score}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, benchmark_score: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                              />
                              <input
                                placeholder="Image URL"
                                value={editForm.image_url}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, image_url: e.target.value })
                                }
                                className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white sm:col-span-2"
                              />
                              <label className="flex items-center gap-2 text-sm text-gray-300">
                                <input
                                  type="checkbox"
                                  checked={editForm.active}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, active: e.target.checked })
                                  }
                                  className="h-4 w-4 accent-red-600"
                                />
                                Active
                              </label>
                            </div>

                            <div className="mt-4 flex gap-3">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(component.id)}
                                disabled={editSubmitting}
                                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                              >
                                {editSubmitting ? "Saving…" : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="rounded-lg border border-zinc-700 px-5 py-2 text-sm font-semibold text-gray-300 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold">
                                {component.name}{" "}
                                {!component.active && (
                                  <span className="ml-2 rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-gray-500">
                                    inactive
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {component.category} · {component.brand ?? "—"} · Stock:{" "}
                                {component.stock}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-semibold text-red-500">
                                {formatPrice(component.price)}
                              </span>
                              <button
                                type="button"
                                onClick={() => startEditing(component)}
                                className="text-xs uppercase tracking-widest text-gray-400 hover:text-white"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteComponent(component.id, component.name)
                                }
                                className="text-xs uppercase tracking-widest text-gray-500 hover:text-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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