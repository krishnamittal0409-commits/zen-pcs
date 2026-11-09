// app/ready-pcs/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Cpu,
  Tv,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  X,
  ShoppingCart,
  Info,
  MapPin,
  Gauge,
  Thermometer,
} from "lucide-react";

const supabase = createClient();

interface ReadyPC {
  id: number;
  name: string;
  price: number;
  badge: string | null;
  image: string | null;
  specs: string[];
  category?: "flagship" | "1440p" | "1080p" | "creator";
  detailedSpecs?: {
    cpu: string;
    gpu: string;
    ram: string;
    motherboard: string;
    storage: string;
    cooler: string;
    psu: string;
    case: string;
    cs2Fps: number;
    cyberpunkFps: number;
    thermalMax: string;
  };
}

const FALLBACK_PCS: ReadyPC[] = [
  {
    id: 101,
    name: "Zen Apex 5090 Titan",
    price: 449999,
    badge: "Flagship Titan",
    image: "/images/pcs/zen-apex.png",
    category: "flagship",
    specs: [
      "AMD Ryzen 7 9800X3D (Zen 5 3D V-Cache)",
      "NVIDIA GeForce RTX 5090 32GB GDDR7",
      "64GB DDR5 6000MHz CL30 EXPO",
      "2TB Gen5 NVMe SSD (12,400 MB/s)",
      "360mm ARGB AIO Liquid Cooler",
      "1000W ATX 3.0 Platinum PSU",
    ],
    detailedSpecs: {
      cpu: "AMD Ryzen 7 9800X3D (8C/16T, 5.2 GHz, 96MB 3D V-Cache)",
      gpu: "NVIDIA GeForce RTX 5090 32GB GDDR7 (21,760 CUDA Cores)",
      ram: "64GB (2x32GB) DDR5 6000MHz CL30 Low-Latency EXPO",
      motherboard: "ASUS ROG Strix X870E-E Gaming WiFi (PCIe 5.0)",
      storage: "2TB Crucial T705 Gen5 NVMe (14,500 MB/s Read)",
      cooler: "Corsair iCUE LINK H150i RGB 360mm AIO Liquid Cooler",
      psu: "Corsair RM1000x 1000W ATX 3.0 80+ Platinum",
      case: "NZXT H9 Flow Dual-Chamber Tempered Glass Case",
      cs2Fps: 910,
      cyberpunkFps: 145,
      thermalMax: "68°C GPU / 72°C CPU Under Full Load",
    },
  },
  {
    id: 102,
    name: "Zen Ultra 5080 Pro",
    price: 289999,
    badge: "4K 240Hz Sweetspot",
    image: "/images/pcs/zen-ultra.png",
    category: "flagship",
    specs: [
      "AMD Ryzen 7 7800X3D Processor",
      "NVIDIA GeForce RTX 5080 16GB GDDR7",
      "32GB DDR5 6000MHz CL30 RAM",
      "2TB PCIe 4.0 NVMe SSD",
      "240mm Liquid AIO Cooler",
      "850W ATX 3.0 Gold Certified PSU",
    ],
    detailedSpecs: {
      cpu: "AMD Ryzen 7 7800X3D (8C/16T, 5.0 GHz 3D V-Cache)",
      gpu: "NVIDIA GeForce RTX 5080 16GB GDDR7 (10,752 CUDA Cores)",
      ram: "32GB (2x16GB) DDR5 6000MHz CL30 EXPO",
      motherboard: "MSI MAG B650 Tomahawk WiFi",
      storage: "2TB Samsung 990 Pro PCIe 4.0 NVMe (7,450 MB/s)",
      cooler: "DeepCool LS520 SE 240mm Liquid Cooler",
      psu: "Corsair RM850e 850W ATX 3.0 80+ Gold",
      case: "Lian Li Lancool 216 RGB High Airflow",
      cs2Fps: 720,
      cyberpunkFps: 115,
      thermalMax: "66°C GPU / 74°C CPU Under Full Load",
    },
  },
  {
    id: 103,
    name: "Zen Pro 4070 Super",
    price: 154999,
    badge: "1440p Esports King",
    image: "/images/pcs/zen-pro.png",
    category: "1440p",
    specs: [
      "AMD Ryzen 5 7600X AM5 Processor",
      "NVIDIA GeForce RTX 4070 Super 12GB",
      "32GB DDR5 5600MHz RAM",
      "1TB Gen4 NVMe M.2 Solid State Drive",
      "Dual-Tower Air Cooler (220W TDP)",
      "750W 80+ Gold Power Supply",
    ],
    detailedSpecs: {
      cpu: "AMD Ryzen 5 7600X (6C/12T, 5.3 GHz AM5)",
      gpu: "NVIDIA GeForce RTX 4070 Super 12GB GDDR6X",
      ram: "32GB (2x16GB) DDR5 5600MHz High-Speed RAM",
      motherboard: "MSI B650 Gaming Plus WiFi",
      storage: "1TB WD Black SN850X Gen4 NVMe M.2 SSD",
      cooler: "DeepCool AK620 Dual-Tower High Performance Cooler",
      psu: "Corsair RM750e 750W 80+ Gold Certified",
      case: "Lian Li Lancool 216 Mesh Airflow",
      cs2Fps: 540,
      cyberpunkFps: 82,
      thermalMax: "64°C GPU / 71°C CPU Under Full Load",
    },
  },
  {
    id: 104,
    name: "Zen Starter Esports Rig",
    price: 89999,
    badge: "Best Value 1080p",
    image: "/images/pcs/zen-starter.png",
    category: "1080p",
    specs: [
      "AMD Ryzen 5 5600X Processor",
      "NVIDIA GeForce RTX 4060 8GB GDDR6",
      "16GB Dual Channel 3600MHz RAM",
      "1TB NVMe M.2 High-Speed SSD",
      "Airflow Mesh ARGB Case with 4 Fans",
      "650W 80+ Bronze Certified PSU",
    ],
    detailedSpecs: {
      cpu: "AMD Ryzen 5 5600X (6C/12T, 4.6 GHz)",
      gpu: "NVIDIA GeForce RTX 4060 8GB GDDR6",
      ram: "16GB (2x8GB) DDR4 3600MHz Dual Channel",
      motherboard: "Gigabyte B550M DS3H AC",
      storage: "1TB Kingston NV2 PCIe 4.0 NVMe SSD",
      cooler: "DeepCool AG400 ARGB Tower Cooler",
      psu: "Cooler Master MWE 650W 80+ Bronze",
      case: "Ant Esports ICE-200TG Mid Tower ARGB",
      cs2Fps: 380,
      cyberpunkFps: 55,
      thermalMax: "62°C GPU / 68°C CPU Under Full Load",
    },
  },
];

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizeImagePath(path: string | null): string {
  if (!path) return "/images/zen-pc.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const withForward = path.replace(/\\/g, "/");
  return withForward.startsWith("/") ? withForward : `/${withForward}`;
}

export default function ReadyPCsPage() {
  const { user, signInWithGoogle } = useAuth();
  const [pcs, setPcs] = useState<ReadyPC[]>(FALLBACK_PCS);
  const [loading, setLoading] = useState(true);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedNotification, setAddedNotification] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  // Inspect Modal State
  const [inspectingPc, setInspectingPc] = useState<ReadyPC | null>(null);

  // Delivery Pincode Checker State
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPCs() {
      try {
        const { data, error } = await supabase
          .from("ready_pcs")
          .select("id, name, price, badge, image, specs")
          .eq("active", true)
          .order("price", { ascending: false });

        if (!error && data && data.length > 0) {
          // Merge with detailed specs
          const merged = data.map((d) => {
            const match = FALLBACK_PCS.find((f) => f.name.toLowerCase() === d.name.toLowerCase());
            return {
              ...d,
              detailedSpecs: match?.detailedSpecs || FALLBACK_PCS[0].detailedSpecs,
            };
          });
          setPcs(merged as ReadyPC[]);
        }
      } catch (err) {
        console.warn("Using fallback pre-configured builds:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPCs();
  }, []);

  async function handleAddToCart(pc: ReadyPC) {
    if (!user) {
      setShowSignInPrompt(true);
      return;
    }

    setAddingId(pc.id);

    try {
      const { error: insertError } = await supabase.from("cart_items").insert({
        user_id: user.id,
        name: pc.name,
        price: pc.price,
        quantity: 1,
      });

      if (insertError) {
        alert("Couldn't add to cart: " + insertError.message);
        return;
      }

      setAddedNotification(`${pc.name} added to cart!`);
      setTimeout(() => setAddedNotification(null), 4000);
      if (inspectingPc) setInspectingPc(null);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  }

  function handleCheckPincode() {
    const clean = pincode.trim();
    if (clean.length === 6 && /^\d+$/.test(clean)) {
      setPincodeStatus(`✓ Eligible for Free Doorstep Setup & 48h Delivery to PIN ${clean}`);
    } else {
      setPincodeStatus("Please enter a valid 6-digit Indian PIN code");
    }
  }

  const displayedPCs = useMemo(() => {
    let list = [...pcs];

    if (selectedFilter === "flagship") {
      list = list.filter((p) => p.price >= 250000 || p.name.includes("5090") || p.name.includes("5080"));
    } else if (selectedFilter === "1440p") {
      list = list.filter((p) => (p.price >= 120000 && p.price < 250000) || p.name.includes("4070"));
    } else if (selectedFilter === "1080p") {
      list = list.filter((p) => p.price < 120000 || p.name.includes("4060"));
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [pcs, selectedFilter, sortBy]);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Hero Header with Cyber Lighting */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-black to-black py-16">
        <div className="absolute top-0 left-1/3 h-96 w-96 rounded-full bg-red-600/10 blur-[140px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-red-400">
                <Sparkles className="h-3.5 w-3.5 text-red-500" />
                Dual Burn-In Tested • Ready To Ship
              </div>

              <h1 className="mt-4 text-4xl font-black text-white sm:text-6xl">
                Ready-To-Ship <span className="text-red-500">Gaming PCs</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm sm:text-base text-zinc-400">
                Boutique desktop configurations handcrafted with surgical cable routing,
                48-hour thermal stress-testing, and white-glove doorstep delivery.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-zinc-300">3-Year On-Site Comprehensive Warranty</span>
            </div>
          </div>

          {/* Filter & Sort Bar */}
          <div className="mt-10 flex flex-col gap-4 border-t border-zinc-800/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All Systems" },
                { key: "flagship", label: "🔥 Flagship 4K Titans" },
                { key: "1440p", label: "⚡ 1440p High Refresh" },
                { key: "1080p", label: "🎯 1080p Esports Value" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedFilter(tab.key)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    selectedFilter === tab.key
                      ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                      : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-semibold text-zinc-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white focus:border-red-500 focus:outline-none"
              >
                <option value="featured">Featured Builds</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of Ready PCs */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayedPCs.map((pc) => (
            <div
              key={pc.id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-black p-6 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-red-500/80 hover:shadow-red-950/20"
            >
              {/* Badge Tag */}
              {pc.badge && (
                <div className="absolute top-5 right-5 z-20">
                  <span className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md shadow-red-900/50">
                    {pc.badge}
                  </span>
                </div>
              )}

              {/* Hardware Preview Card */}
              <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-2xl border border-zinc-800/60 bg-black/60">
                <div className="absolute h-52 w-52 rounded-full bg-red-600/15 blur-2xl transition-all group-hover:scale-125 group-hover:bg-red-600/25" />

                <div className="relative h-64 w-64">
                  <Image
                    src={normalizeImagePath(pc.image)}
                    alt={pc.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105 drop-shadow-xl"
                  />
                </div>
              </div>

              {/* Rig Title & Price */}
              <div className="mt-6 flex flex-1 flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                    {pc.name}
                  </h2>

                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-red-500">
                      {formatPrice(pc.price)}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-400">
                      Doorstep Setup Free
                    </span>
                  </div>

                  {/* Specs List */}
                  <ul className="mt-5 space-y-2 border-t border-zinc-800/80 pt-4 text-xs text-zinc-300">
                    {pc.specs.map((spec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-400 text-[10px] font-bold mt-0.5">
                          ✓
                        </span>
                        <span className="leading-snug">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dual Action Buttons */}
                <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800/60">
                  <button
                    type="button"
                    onClick={() => setInspectingPc(pc)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/80 py-3 text-xs font-bold text-zinc-200 transition hover:border-red-500 hover:text-white"
                  >
                    <Info className="h-3.5 w-3.5 text-red-500" />
                    <span>Inspect Specs</span>
                  </button>

                  <button
                    type="button"
                    disabled={addingId === pc.id}
                    onClick={() => handleAddToCart(pc)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 hover:shadow-red-600/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>{addingId === pc.id ? "Adding..." : "Add to Cart"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inspect Rig Specs & Benchmark Modal */}
      <AnimatePresence>
        {inspectingPc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setInspectingPc(null)}
                className="absolute right-6 top-6 rounded-full border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {inspectingPc.badge || "System Specs"}
                </span>
                <span className="text-xs text-zinc-400">Architecture Spec Sheet</span>
              </div>

              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                {inspectingPc.name}
              </h2>

              <div className="mt-1 text-2xl font-black text-red-500">
                {formatPrice(inspectingPc.price)}
              </div>

              {/* Hardware Details Table */}
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 text-xs space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 pb-2">
                  Part-by-Part Component Hardware
                </h4>
                {inspectingPc.detailedSpecs && (
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">Processor:</span>
                      <strong className="text-white text-right">{inspectingPc.detailedSpecs.cpu}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">Graphics Card:</span>
                      <strong className="text-white text-right">{inspectingPc.detailedSpecs.gpu}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">System Memory:</span>
                      <strong className="text-white text-right">{inspectingPc.detailedSpecs.ram}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">Motherboard:</span>
                      <strong className="text-white text-right">{inspectingPc.detailedSpecs.motherboard}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">Storage NVMe:</span>
                      <strong className="text-white text-right">{inspectingPc.detailedSpecs.storage}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">Thermal Cooler:</span>
                      <strong className="text-white text-right">{inspectingPc.detailedSpecs.cooler}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-800/40">
                      <span className="text-zinc-400">Power Supply:</span>
                      <strong className="text-white text-right">{inspectingPc.detailedSpecs.psu}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-zinc-400">Chassis:</span>
                      <strong className="text-white text-right">{inspectingPc.detailedSpecs.case}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Benchmarks & Thermal Strip */}
              {inspectingPc.detailedSpecs && (
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                    <span className="block text-[10px] uppercase tracking-wider text-zinc-400">CS2 Comp FPS</span>
                    <span className="text-xl font-black text-red-500">{inspectingPc.detailedSpecs.cs2Fps} FPS</span>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                    <span className="block text-[10px] uppercase tracking-wider text-zinc-400">Cyberpunk RT</span>
                    <span className="text-xl font-black text-amber-400">{inspectingPc.detailedSpecs.cyberpunkFps} FPS</span>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                    <span className="block text-[10px] uppercase tracking-wider text-zinc-400">Acoustics / Thermals</span>
                    <span className="text-xs font-bold text-emerald-400">{inspectingPc.detailedSpecs.thermalMax.split(" ")[0]}</span>
                  </div>
                </div>
              )}

              {/* Pincode Availability Checker Widget */}
              <div className="mt-6 rounded-2xl border border-zinc-800 bg-black/60 p-4">
                <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                  <MapPin className="h-3.5 w-3.5 text-red-500" />
                  Check Doorstep Technician Availability
                </span>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter 6-digit PIN code (e.g. 110001, 131001)"
                    maxLength={6}
                    className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCheckPincode}
                    className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700"
                  >
                    Check PIN
                  </button>
                </div>
                {pincodeStatus && (
                  <p className="mt-2 text-xs font-medium text-emerald-400">{pincodeStatus}</p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setInspectingPc(null)}
                  className="rounded-xl border border-zinc-800 px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(inspectingPc)}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add To Cart ({formatPrice(inspectingPc.price)})</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Added Notification Toast */}
      <AnimatePresence>
        {addedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-zinc-950 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="rounded-full bg-emerald-500/20 p-1.5 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{addedNotification}</h4>
              <p className="text-[11px] text-zinc-400">Item ready in your cart for checkout.</p>
            </div>
            <a
              href="/cart"
              className="ml-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
            >
              View Cart
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign-In Prompt Modal */}
      {showSignInPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
            <h3 className="flex items-center gap-3 text-lg font-bold text-white">
              <span className="h-5 w-1 rounded-full bg-red-600" />
              Sign in to continue
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Sign in with your Google account to add items to your cart, track live build telemetry,
              and manage doorstep installation.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSignInPrompt(false)}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  signInWithGoogle();
                  setShowSignInPrompt(false);
                }}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Sign In with Google
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
