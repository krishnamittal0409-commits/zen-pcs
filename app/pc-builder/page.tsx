// app/pc-builder/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";

const supabase = createClient();

/* -------------------------------------------------------------------------- */
/*  Types                                                                    */
/* -------------------------------------------------------------------------- */

type CategoryKey =
  | "cpu"
  | "motherboard"
  | "ram"
  | "gpu"
  | "storage"
  | "psu"
  | "cooling"
  | "case";

interface ComponentRow {
  id: number;
  name: string;
  category: CategoryKey;
  price: number;
  stock: number;
  active: boolean;
  created_at: string;
  brand: string | null;
  socket: string | null;
  chipset: string | null;
  capacity: string | null;
  speed: string | null;
  wattage: string | null;
  efficiency: string | null;
  form_factor: string | null;
  image_url: string | null;
}

type Build = Partial<Record<CategoryKey, ComponentRow>>;

interface CategoryConfig {
  key: CategoryKey;
  label: string;
}

interface CompatibilityIssue {
  categories: CategoryKey[];
  message: string;
}

/* -------------------------------------------------------------------------- */
/*  Config & helpers                                                        */
/* -------------------------------------------------------------------------- */

const CATEGORIES: CategoryConfig[] = [
  { key: "cpu", label: "Processor" },
  { key: "motherboard", label: "Motherboard" },
  { key: "ram", label: "Memory" },
  { key: "gpu", label: "Graphics Card" },
  { key: "storage", label: "Storage" },
  { key: "psu", label: "Power Supply" },
  { key: "cooling", label: "Cooling" },
  { key: "case", label: "Case" },
];

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateTotal(build: Build): number {
  return Object.values(build).reduce((sum, item) => sum + (item?.price ?? 0), 0);
}

function isBuildComplete(build: Build): boolean {
  return CATEGORIES.every((c) => build[c.key]);
}

function estimateSystemWattage(build: Build): number {
  const gpuWatts: Record<string, number> = {
    "RTX 4060": 115,
    "RTX 4070 Super": 220,
    "RTX 5080": 350,
    "RTX 5090": 575,
  };
  const cpuWatts: Record<string, number> = {
    "Ryzen 5 7600": 65,
    "Ryzen 7 7800X3D": 120,
    "Ryzen 9 9950X3D": 170,
  };

  const gpu = build.gpu ? gpuWatts[build.gpu.name] ?? 250 : 0;
  const cpu = build.cpu ? cpuWatts[build.cpu.name] ?? 100 : 0;
  const overhead = 150;

  return gpu + cpu + overhead;
}

function getCompatibilityIssues(build: Build): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];

  if (build.cpu && build.motherboard) {
    if (build.cpu.socket && build.motherboard.socket && build.cpu.socket !== build.motherboard.socket) {
      issues.push({
        categories: ["cpu", "motherboard"],
        message: `${build.cpu.name} uses ${build.cpu.socket}, but ${build.motherboard.name} is ${build.motherboard.socket}. Pick a matching socket.`,
      });
    }
  }

  if (build.psu && (build.gpu || build.cpu)) {
    const psuWatts = build.psu.wattage ? parseInt(build.psu.wattage, 10) : NaN;
    const needed = estimateSystemWattage(build);
    if (!Number.isNaN(psuWatts) && psuWatts < needed) {
      issues.push({
        categories: ["psu", "gpu", "cpu"],
        message: `${build.psu.name} (${build.psu.wattage}) may be undersized for this build. Estimated draw is ~${needed}W.`,
      });
    }
  }

  return issues;
}

function categoryHasIssue(issues: CompatibilityIssue[], key: CategoryKey): boolean {
  return issues.some((issue) => issue.categories.includes(key));
}

/* -------------------------------------------------------------------------- */
/*  Small inline icons                                                      */
/* -------------------------------------------------------------------------- */

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                     */
/* -------------------------------------------------------------------------- */

export default function PCBuilderPage() {
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [build, setBuild] = useState<Build>({});

  const { user, signInWithGoogle } = useAuth();
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchComponents() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("components")
        .select("*")
        .eq("active", true)
        .order("price", { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setComponents((data ?? []) as ComponentRow[]);
      setLoading(false);
    }

    fetchComponents();
    return () => {
      cancelled = true;
    };
  }, []);

  const issues = useMemo(() => getCompatibilityIssues(build), [build]);
  const total = calculateTotal(build);
  const complete = isBuildComplete(build);
  const hasBlockingIssues = issues.length > 0;
  const selectedCount = CATEGORIES.filter((c) => build[c.key]).length;
  const percent = Math.round((selectedCount / CATEGORIES.length) * 100);

  const isVerified = complete && !hasBlockingIssues;

  function optionsFor(category: CategoryKey): ComponentRow[] {
    return components.filter((c) => c.category === category);
  }

  function handleChange(category: CategoryKey, componentId: string) {
    if (!componentId) {
      setBuild((prev) => {
        const copy = { ...prev };
        delete copy[category];
        return copy;
      });
      return;
    }
    const chosen = components.find((c) => c.id === Number(componentId));
    if (!chosen) return;
    setBuild((prev) => ({ ...prev, [category]: chosen }));
  }

  async function handleAddToCart() {
    if (!user) {
      setShowSignInPrompt(true);
      return;
    }

    const { error: insertError } = await supabase.from("cart_items").insert({
      user_id: user.id,
      name: `Custom Build (${CATEGORIES.map((c) => build[c.key]?.name).filter(Boolean).join(", ")})`,
      price: total,
      quantity: 1,
    });

    if (insertError) {
      alert("Couldn't add to cart: " + insertError.message);
      return;
    }

    alert("Build added to cart!");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-8 py-24">
        <p className="mb-3 flex items-center gap-2 font-semibold uppercase tracking-[4px] text-red-500">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Custom Builder
        </p>

        <h1 className="mb-6 text-5xl font-black">
          Build Your <span className="text-red-500">Dream PC</span>
        </h1>

        <p className="mb-8 max-w-2xl text-gray-400">
          Select your preferred components and create a custom PC tailored to
          your gaming, streaming, editing, or workstation needs.
        </p>

        <div className="mb-12 max-w-2xl">
          <div className="mb-2 flex items-center justify-between text-xs font-medium">
            <span className="uppercase tracking-widest text-gray-500">Build Progress</span>
            <span className="text-red-500">{percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full border border-red-950/50 bg-zinc-800">
            <div
              className="h-full rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.6)] transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
            Loading components…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-900 bg-zinc-900 p-8 text-center text-red-500">
            Couldn't load components: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-zinc-800 border-t-2 border-t-red-600/60 bg-zinc-900">
              <h2 className="flex items-center gap-3 border-b border-zinc-800 px-8 py-6 text-2xl font-bold">
                <span className="h-6 w-1 rounded-full bg-red-600" />
                Select Components
              </h2>

              <div className="divide-y divide-zinc-800">
                {CATEGORIES.map((cat, idx) => {
                  const options = optionsFor(cat.key);
                  const selected = build[cat.key];
                  const conflict = categoryHasIssue(issues, cat.key);

                  return (
                    <div
                      key={cat.key}
                      className={[
                        "grid grid-cols-1 divide-y divide-zinc-800 border-l-2 sm:grid-cols-[180px_1fr_150px] sm:divide-x sm:divide-y-0",
                        conflict ? "border-l-red-500" : selected ? "border-l-red-600" : "border-l-transparent",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3 px-8 py-5">
                        <span
                          className={[
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                            selected
                              ? "border-red-600 bg-red-600/10 text-red-500"
                              : "border-zinc-700 text-gray-500",
                          ].join(" ")}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-300">{cat.label}</span>
                      </div>

                      <div className="flex items-center px-8 py-5">
                        <select
                          value={selected?.id ?? ""}
                          onChange={(e) => handleChange(cat.key, e.target.value)}
                          disabled={options.length === 0}
                          className={[
                            "w-full rounded-xl border bg-black px-4 py-3 text-white outline-none transition",
                            "focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-40",
                            conflict ? "border-red-500" : selected ? "border-red-600/50" : "border-zinc-700",
                          ].join(" ")}
                        >
                          <option value="">
                            {options.length === 0 ? "No options available" : "Select..."}
                          </option>
                          {options.map((opt) => (
                            <option key={opt.id} value={opt.id} disabled={opt.stock <= 0}>
                              {opt.name} — {formatPrice(opt.price)}
                              {opt.stock <= 0 ? " (out of stock)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-end px-8 py-5">
                        <span className={selected ? "font-semibold text-red-500" : "text-gray-600"}>
                          {selected ? formatPrice(selected.price) : "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasBlockingIssues && (
                <div className="space-y-2 border-t border-zinc-800 bg-black/40 px-8 py-6">
                  {issues.map((issue, i) => (
                    <p key={i} className="flex items-start gap-2 text-sm text-red-500">
                      <WarningIcon />
                      <span>{issue.message}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="h-fit rounded-3xl border border-zinc-800 border-t-2 border-t-red-600/60 bg-zinc-900 p-8">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                <span className="h-6 w-1 rounded-full bg-red-600" />
                Build Summary
              </h2>

              <div className="space-y-4 text-gray-300">
                {CATEGORIES.map((cat) => {
                  const item = build[cat.key];
                  return (
                    <div key={cat.key} className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2 text-gray-500">
                        <span className={`h-1.5 w-1.5 rounded-full ${item ? "bg-red-600" : "bg-zinc-700"}`} />
                        {cat.label}
                      </span>
                      <span className={item ? "text-right text-white" : "text-right text-gray-600"}>
                        {item ? item.name : "Not selected"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="my-6 border-t border-zinc-800" />

              <div
                className={[
                  "mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium",
                  isVerified
                    ? "border-green-900 bg-green-950/40 text-green-400"
                    : hasBlockingIssues
                    ? "border-red-900 bg-red-950/40 text-red-400"
                    : "border-zinc-800 bg-black/30 text-gray-500",
                ].join(" ")}
              >
                {isVerified ? (
                  <>
                    <CheckIcon />
                    <span>Compatibility Verified</span>
                  </>
                ) : hasBlockingIssues ? (
                  <>
                    <WarningIcon />
                    <span>Compatibility Issue Found</span>
                  </>
                ) : (
                  <>
                    <WarningIcon />
                    <span>Select all parts to verify compatibility</span>
                  </>
                )}
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-400">Estimated Price</p>
                <p className="text-4xl font-black text-red-500">{formatPrice(total)}</p>
              </div>

              <button
                type="button"
                disabled={!complete || hasBlockingIssues}
                onClick={handleAddToCart}
                className={[
                  "w-full rounded-xl py-3 font-semibold transition",
                  !complete || hasBlockingIssues
                    ? "cursor-not-allowed bg-zinc-800 text-gray-600"
                    : "bg-red-600 hover:bg-red-700",
                ].join(" ")}
              >
                {complete ? "Add To Cart" : "Complete Your Build"}
              </button>

              {!user && (
                <p className="mt-3 text-center text-xs text-gray-500">
                  Sign in required to add to cart
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {showSignInPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <h3 className="flex items-center gap-3 text-lg font-bold">
              <span className="h-5 w-1 rounded-full bg-red-600" />
              Sign in to continue
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Create an account or sign in to add this build to your cart.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowSignInPrompt(false)}
                className="text-sm font-medium text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  signInWithGoogle();
                  setShowSignInPrompt(false);
                }}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-700"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
          <Footer />
    </main>
  );
}