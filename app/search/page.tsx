// app/search/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Cpu,
  Tv,
  Layers,
  HardDrive,
  Zap,
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient();

interface SearchResultItem {
  id: number;
  name: string;
  category: string;
  price: number;
  stock?: number;
  type: "component" | "ready_pc";
  specs?: string[];
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const CATEGORY_TABS = [
  { key: "all", label: "All Hardware" },
  { key: "ready_pc", label: "Ready Systems" },
  { key: "gpu", label: "Graphics Cards" },
  { key: "cpu", label: "Processors" },
  { key: "motherboard", label: "Motherboards" },
  { key: "ram", label: "Memory (RAM)" },
  { key: "storage", label: "Storage" },
  { key: "psu", label: "Power Supplies" },
  { key: "cooling", label: "Cooling" },
  { key: "case", label: "Cases" },
];

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"relevance" | "price-asc" | "price-desc">("relevance");
  const [allItems, setAllItems] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const [compRes, pcRes] = await Promise.all([
          supabase
            .from("components")
            .select("id, name, category, price, stock")
            .eq("active", true),
          supabase
            .from("ready_pcs")
            .select("id, name, price, specs")
            .eq("active", true),
        ]);

        const combined: SearchResultItem[] = [];

        if (pcRes.data) {
          pcRes.data.forEach((p) => {
            combined.push({
              id: p.id,
              name: p.name,
              category: "ready_pc",
              price: p.price,
              type: "ready_pc",
              specs: p.specs,
            });
          });
        }

        if (compRes.data) {
          compRes.data.forEach((c) => {
            combined.push({
              id: c.id,
              name: c.name,
              category: c.category,
              price: c.price,
              stock: c.stock ?? 10,
              type: "component",
            });
          });
        }

        setAllItems(combined);
      } catch (err) {
        console.error("Failed loading search catalog:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...allItems];
    const q = query.trim().toLowerCase();

    if (q) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.specs && item.specs.some((s) => s.toLowerCase().includes(q)))
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [allItems, query, selectedCategory, sortBy]);

  async function handleAddToCart(item: SearchResultItem) {
    if (!user) {
      alert("Please sign in from the Account menu to add items to your cart.");
      return;
    }

    const { error: insertError } = await supabase.from("cart_items").insert({
      user_id: user.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });

    if (insertError) {
      alert("Could not add to cart: " + insertError.message);
      return;
    }

    setToastMessage(`${item.name} added to cart!`);
    setTimeout(() => setToastMessage(null), 3500);
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Cyberpunk Header with Live Search Input */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-black to-black py-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400">
              <Sparkles className="h-3.5 w-3.5 text-red-500" />
              Live Hardware Inventory Catalog
            </div>

            <h1 className="mt-4 text-4xl font-black text-white sm:text-6xl">
              Search <span className="text-red-500">Components & Systems</span>
            </h1>

            <p className="mt-3 text-sm text-zinc-400 sm:text-base">
              Find processors, RTX 50-Series GPUs, DDR5 memory, PCIe Gen5 NVMe storage,
              and pre-configured gaming battlestations.
            </p>

            {/* Big Search Bar */}
            <div className="relative mt-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search RTX 5090, Ryzen 9800X3D, DDR5, Lian Li, Ready PCs..."
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-4 pl-14 pr-12 text-sm font-medium text-white shadow-2xl backdrop-blur-xl transition placeholder:text-zinc-500 focus:border-red-500 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-zinc-800 p-1 text-xs text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800/80 pt-6">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    selectedCategory === tab.key
                      ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                      : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white focus:border-red-500 focus:outline-none"
              >
                <option value="relevance">Default Catalog</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-6 flex items-center justify-between text-xs text-zinc-400">
          <span>
            Found <strong className="text-white">{filteredItems.length}</strong> matches
            {query && <span> for &ldquo;{query}&rdquo;</span>}
          </span>
          <span>Verified In-Stock at Delhi NCR Assembly Hub</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center">
            <h3 className="text-lg font-bold text-white">No components matched your search</h3>
            <p className="mt-2 text-xs text-zinc-400">
              Try searching for &quot;5090&quot;, &quot;Ryzen&quot;, &quot;DDR5&quot;, or clear your filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedCategory("all");
              }}
              className="mt-6 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-black p-6 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-red-500/80 hover:shadow-red-950/20"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                      {item.type === "ready_pc" ? "Pre-Built PC" : item.category.toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-white group-hover:text-red-400 transition-colors">
                    {item.name}
                  </h3>

                  {item.specs && (
                    <ul className="mt-3 space-y-1 text-xs text-zinc-400">
                      {item.specs.slice(0, 3).map((s, i) => (
                        <li key={i} className="truncate">✓ {s}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-6 border-t border-zinc-800/60 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-red-500">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-[10px] text-zinc-400">Incl. Taxes</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    {item.type === "ready_pc" ? (
                      <Link
                        href="/ready-pcs"
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
                      >
                        <span>View System</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Add To Cart</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-zinc-950 p-4 shadow-2xl backdrop-blur-xl"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <div>
              <h4 className="text-xs font-bold text-white">{toastMessage}</h4>
              <p className="text-[11px] text-zinc-400">Ready in cart for checkout.</p>
            </div>
            <Link
              href="/cart"
              className="ml-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
            >
              View Cart
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
