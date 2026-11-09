// app/pc-builder/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Tv,
  Layers,
  HardDrive,
  Zap,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShoppingCart,
  Sliders,
  Gauge,
  ArrowRight,
} from "lucide-react";

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
  icon: any;
}

interface CompatibilityIssue {
  categories: CategoryKey[];
  message: string;
}

/* -------------------------------------------------------------------------- */
/*  Config & Helpers                                                         */
/* -------------------------------------------------------------------------- */

const CATEGORIES: CategoryConfig[] = [
  { key: "cpu", label: "Processor", icon: Cpu },
  { key: "motherboard", label: "Motherboard", icon: Layers },
  { key: "ram", label: "Memory (RAM)", icon: Sliders },
  { key: "gpu", label: "Graphics Card", icon: Tv },
  { key: "storage", label: "Primary Storage", icon: HardDrive },
  { key: "psu", label: "Power Supply", icon: Zap },
  { key: "cooling", label: "Thermal Cooling", icon: Sparkles },
  { key: "case", label: "Chassis / Case", icon: Layers },
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

function estimateSystemWattage(build: Build): {
  total: number;
  cpuWatts: number;
  gpuWatts: number;
  otherWatts: number;
} {
  const gpuWattsMap: Record<string, number> = {
    "RTX 4060": 115,
    "RTX 4070 Super": 220,
    "RTX 5080": 360,
    "RTX 5090": 575,
  };
  const cpuWattsMap: Record<string, number> = {
    "Ryzen 5 7600": 65,
    "Ryzen 7 7800X3D": 120,
    "Ryzen 9 9950X3D": 170,
  };

  const gpuName = build.gpu?.name || "";
  let gpuWatts = 0;
  for (const [key, val] of Object.entries(gpuWattsMap)) {
    if (gpuName.toLowerCase().includes(key.toLowerCase())) {
      gpuWatts = val;
      break;
    }
  }
  if (build.gpu && gpuWatts === 0) gpuWatts = 250;

  const cpuName = build.cpu?.name || "";
  let cpuWatts = 0;
  for (const [key, val] of Object.entries(cpuWattsMap)) {
    if (cpuName.toLowerCase().includes(key.toLowerCase())) {
      cpuWatts = val;
      break;
    }
  }
  if (build.cpu && cpuWatts === 0) cpuWatts = 105;

  const otherWatts = build.motherboard || build.ram || build.storage ? 75 : 0;
  const total = gpuWatts + cpuWatts + otherWatts;

  return { total, cpuWatts, gpuWatts, otherWatts };
}

function extractPsuCapacity(psuName?: string): number {
  if (!psuName) return 0;
  const match = psuName.match(/(\d{3,4})\s*[wW]/);
  if (match) return parseInt(match[1], 10);
  if (psuName.includes("1200")) return 1200;
  if (psuName.includes("1000")) return 1000;
  if (psuName.includes("850")) return 850;
  if (psuName.includes("750")) return 750;
  if (psuName.includes("650")) return 650;
  return 750;
}

function resolveSocket(item?: ComponentRow): string | null {
  if (!item) return null;
  if (item.socket && item.socket.trim()) {
    return item.socket.toUpperCase().trim();
  }
  const name = item.name.toLowerCase();
  if (
    name.includes("am5") ||
    name.includes("7600") ||
    name.includes("7700") ||
    name.includes("7800") ||
    name.includes("7900") ||
    name.includes("7950") ||
    name.includes("9600") ||
    name.includes("9700") ||
    name.includes("9800") ||
    name.includes("9900") ||
    name.includes("9950") ||
    name.includes("b650") ||
    name.includes("x670") ||
    name.includes("x870")
  ) {
    return "AM5";
  }
  if (
    name.includes("am4") ||
    name.includes("5600") ||
    name.includes("5700") ||
    name.includes("5800") ||
    name.includes("5900") ||
    name.includes("5950") ||
    name.includes("3600") ||
    name.includes("b550") ||
    name.includes("b450") ||
    name.includes("x570")
  ) {
    return "AM4";
  }
  if (
    name.includes("lga1700") ||
    name.includes("14600") ||
    name.includes("14700") ||
    name.includes("14900") ||
    name.includes("13600") ||
    name.includes("13700") ||
    name.includes("13900") ||
    name.includes("12400") ||
    name.includes("b760") ||
    name.includes("z790") ||
    name.includes("b660") ||
    name.includes("z690")
  ) {
    return "LGA1700";
  }
  return null;
}

function resolveRamGeneration(item?: ComponentRow): "DDR4" | "DDR5" | null {
  if (!item) return null;
  const combined = (item.name + " " + (item.speed || "") + " " + (item.capacity || "")).toLowerCase();
  if (combined.includes("ddr4")) return "DDR4";
  if (combined.includes("ddr5")) return "DDR5";
  return null;
}

function getCompatibilityIssues(build: Build): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];

  // 1. Physical Socket Architecture Match (CPU vs Motherboard)
  if (build.cpu && build.motherboard) {
    const cpuSocket = resolveSocket(build.cpu);
    const moboSocket = resolveSocket(build.motherboard);

    if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
      issues.push({
        categories: ["cpu", "motherboard"],
        message: `Incompatible Socket: ${build.cpu.name} uses the ${cpuSocket} socket, but ${build.motherboard.name} is designed for ${moboSocket}. These parts cannot physically mate.`,
      });
    }
  }

  // 2. RAM Generation Compatibility (DDR4 vs DDR5)
  if (build.ram) {
    const ramGen = resolveRamGeneration(build.ram);
    const cpuSocket = build.cpu ? resolveSocket(build.cpu) : null;
    const moboSocket = build.motherboard ? resolveSocket(build.motherboard) : null;

    // AM4 Platform: Strictly DDR4
    if (cpuSocket === "AM4" && ramGen === "DDR5") {
      issues.push({
        categories: ["cpu", "ram"],
        message: `Memory Conflict: AMD AM4 platform (${build.cpu?.name}) exclusively supports DDR4. ${build.ram.name} is DDR5 and cannot be used.`,
      });
    }
    if (moboSocket === "AM4" && ramGen === "DDR5") {
      issues.push({
        categories: ["motherboard", "ram"],
        message: `DIMM Slot Mismatch: ${build.motherboard?.name} (AM4) has DDR4 memory slots only. ${build.ram.name} (DDR5) cannot be inserted.`,
      });
    }

    // AM5 Platform: Strictly DDR5
    if (cpuSocket === "AM5" && ramGen === "DDR4") {
      issues.push({
        categories: ["cpu", "ram"],
        message: `Memory Conflict: AMD AM5 platform (${build.cpu?.name}) strictly requires DDR5 memory. ${build.ram.name} (DDR4) is not supported.`,
      });
    }
    if (moboSocket === "AM5" && ramGen === "DDR4") {
      issues.push({
        categories: ["motherboard", "ram"],
        message: `DIMM Slot Mismatch: AM5 motherboards (${build.motherboard?.name}) feature DDR5 slots only. DDR4 memory cannot physically fit.`,
      });
    }
  }

  // 3. Power Supply Headroom & Capacity
  if (build.psu) {
    const { total } = estimateSystemWattage(build);
    const psuCapacity = extractPsuCapacity(build.psu.name);

    if (psuCapacity > 0 && total > psuCapacity) {
      issues.push({
        categories: ["psu", "gpu"],
        message: `Critical Power Overdraw: Estimated peak draw is ~${total}W, exceeding the ${psuCapacity}W rating of ${build.psu.name}. Overcurrent tripping will occur.`,
      });
    } else if (psuCapacity > 0 && total > psuCapacity - 75) {
      issues.push({
        categories: ["psu", "gpu"],
        message: `Tight Power Headroom: Estimated draw is ~${total}W, leaving under 75W buffer for ${build.psu.name} (${psuCapacity}W). Recommended: ${total + 150}W+ PSU for transient power spikes.`,
      });
    }
  }

  // 4. Thermal Cooling Headroom
  if (build.cpu && build.cooling) {
    const cpuName = build.cpu.name.toLowerCase();
    const coolerName = build.cooling.name.toLowerCase();
    const isExtremeTdp =
      cpuName.includes("14900k") ||
      cpuName.includes("9950x") ||
      cpuName.includes("14700k") ||
      cpuName.includes("7950x");
    const isBasicAirCooler = coolerName.includes("ag400") || coolerName.includes("single-tower");

    if (isExtremeTdp && isBasicAirCooler) {
      issues.push({
        categories: ["cpu", "cooling"],
        message: `Thermal Dissipation Bottleneck: ${build.cpu.name} outputs up to 250W+ peak thermal load. ${build.cooling.name} will struggle under sustained load. A 240mm or 360mm Liquid AIO is recommended.`,
      });
    }
  }

  return issues;
}

function categoryHasIssue(issues: CompatibilityIssue[], key: CategoryKey): boolean {
  return issues.some((i) => i.categories.includes(key));
}

/* -------------------------------------------------------------------------- */
/*  Main Custom PC Builder Component                                          */
/* -------------------------------------------------------------------------- */

export default function PCBuilderPage() {
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [build, setBuild] = useState<Build>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const wattageTelemetry = useMemo(() => estimateSystemWattage(build), [build]);
  const psuCapacity = extractPsuCapacity(build.psu?.name);
  const psuLoadPercent = psuCapacity > 0 ? Math.round((wattageTelemetry.total / psuCapacity) * 100) : 0;

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

    const item = components.find((c) => c.id === Number(componentId));
    if (!item) return;

    setBuild((prev) => ({
      ...prev,
      [category]: item,
    }));
  }

  // Preload Curated Presets
  function handlePreloadPreset(tier: "titan5090" | "sweetspot5080" | "value4070") {
    const newBuild: Build = {};

    if (tier === "titan5090") {
      newBuild.cpu =
        components.find((c) => c.category === "cpu" && c.name.includes("9950X")) ||
        components.find((c) => c.category === "cpu" && c.name.includes("9800X3D")) ||
        components.find((c) => c.category === "cpu" && c.name.includes("7800X3D"));
      newBuild.gpu =
        components.find((c) => c.category === "gpu" && c.name.includes("5090")) ||
        components.find((c) => c.category === "gpu" && c.name.includes("4090"));
      newBuild.motherboard =
        components.find((c) => c.category === "motherboard" && c.name.includes("X870E")) ||
        components.find((c) => c.category === "motherboard" && c.name.includes("B650"));
      newBuild.ram =
        components.find((c) => c.category === "ram" && c.name.includes("DDR5") && c.name.includes("128GB")) ||
        components.find((c) => c.category === "ram" && c.name.includes("DDR5") && c.name.includes("64GB")) ||
        components.find((c) => c.category === "ram" && c.name.includes("DDR5") && c.name.includes("32GB"));
      newBuild.storage =
        components.find((c) => c.category === "storage" && c.name.includes("4TB")) ||
        components.find((c) => c.category === "storage" && c.name.includes("Crucial T705")) ||
        components.find((c) => c.category === "storage" && c.name.includes("2TB"));
      newBuild.psu =
        components.find((c) => c.category === "psu" && c.name.includes("1200")) ||
        components.find((c) => c.category === "psu" && c.name.includes("1000"));
      newBuild.cooling =
        components.find((c) => c.category === "cooling" && c.name.includes("LCD")) ||
        components.find((c) => c.category === "cooling" && c.name.includes("360mm"));
      newBuild.case =
        components.find((c) => c.category === "case" && c.name.includes("O11")) ||
        components.find((c) => c.category === "case" && c.name.includes("H9")) ||
        components.find((c) => c.category === "case" && c.name.includes("216"));
    } else if (tier === "sweetspot5080") {
      newBuild.cpu =
        components.find((c) => c.category === "cpu" && c.name.includes("7800X3D")) ||
        components.find((c) => c.category === "cpu" && c.name.includes("9800X3D"));
      newBuild.gpu =
        components.find((c) => c.category === "gpu" && c.name.includes("5080")) ||
        components.find((c) => c.category === "gpu" && c.name.includes("4080"));
      newBuild.motherboard =
        components.find((c) => c.category === "motherboard" && c.name.includes("TUF Gaming B650")) ||
        components.find((c) => c.category === "motherboard" && c.name.includes("B650"));
      // Strictly select DDR5 memory for AM5 platform (G.Skill Trident Z5 Neo RGB 32GB DDR5 6000MHz or Corsair Vengeance DDR5)
      newBuild.ram =
        components.find((c) => c.category === "ram" && c.name.includes("DDR5") && c.name.includes("Trident Z5")) ||
        components.find((c) => c.category === "ram" && c.name.includes("DDR5") && c.name.includes("32GB")) ||
        components.find((c) => c.category === "ram" && c.name.includes("DDR5"));
      newBuild.storage =
        components.find((c) => c.category === "storage" && c.name.includes("2TB")) ||
        components.find((c) => c.category === "storage" && c.name.includes("1TB"));
      newBuild.psu =
        components.find((c) => c.category === "psu" && c.name.includes("850")) ||
        components.find((c) => c.category === "psu" && c.name.includes("750"));
      newBuild.cooling =
        components.find((c) => c.category === "cooling" && c.name.includes("H150")) ||
        components.find((c) => c.category === "cooling" && c.name.includes("360mm")) ||
        components.find((c) => c.category === "cooling" && c.name.includes("AK620"));
      newBuild.case =
        components.find((c) => c.category === "case" && c.name.includes("216")) ||
        components.find((c) => c.category === "case" && c.name.includes("4000D"));
    } else {
      newBuild.cpu =
        components.find((c) => c.category === "cpu" && c.name.includes("7600") && !c.name.includes("7600X")) ||
        components.find((c) => c.category === "cpu" && c.name.includes("7600"));
      newBuild.gpu =
        components.find((c) => c.category === "gpu" && c.name.includes("4060") && !c.name.includes("Ti")) ||
        components.find((c) => c.category === "gpu" && c.name.includes("4060"));
      newBuild.motherboard =
        components.find((c) => c.category === "motherboard" && c.name.includes("Pro B650M-P")) ||
        components.find((c) => c.category === "motherboard" && c.name.includes("B650"));
      // Strictly select DDR5 memory for AM5 platform (Kingston Fury Beast 16GB DDR5 5600MHz)
      newBuild.ram =
        components.find((c) => c.category === "ram" && c.name.includes("DDR5") && c.name.includes("16GB")) ||
        components.find((c) => c.category === "ram" && c.name.includes("DDR5"));
      newBuild.storage = components.find((c) => c.category === "storage" && c.name.includes("1TB"));
      newBuild.psu = components.find((c) => c.category === "psu" && c.name.includes("650"));
      newBuild.cooling = components.find((c) => c.category === "cooling" && c.name.includes("AG400"));
      newBuild.case = components.find((c) => c.category === "case" && c.name.includes("ICE-112"));
    }

    // Platform Architecture Safeguard: Guarantee RAM generation strictly matches Socket architecture
    const resolvedSocket =
      (newBuild.cpu && resolveSocket(newBuild.cpu)) ||
      (newBuild.motherboard && resolveSocket(newBuild.motherboard));

    if (resolvedSocket === "AM5") {
      const ramGen = resolveRamGeneration(newBuild.ram);
      if (ramGen !== "DDR5") {
        newBuild.ram =
          components.find((c) => c.category === "ram" && c.name.includes("DDR5") && c.name.includes("32GB")) ||
          components.find((c) => c.category === "ram" && c.name.includes("DDR5"));
      }
    } else if (resolvedSocket === "AM4") {
      const ramGen = resolveRamGeneration(newBuild.ram);
      if (ramGen !== "DDR4") {
        newBuild.ram =
          components.find((c) => c.category === "ram" && c.name.includes("DDR4") && c.name.includes("32GB")) ||
          components.find((c) => c.category === "ram" && c.name.includes("DDR4"));
      }
    }

    setBuild(newBuild);
    setToastMessage(`Preloaded ${tier === "titan5090" ? "RTX 5090 Titan" : tier === "sweetspot5080" ? "Zen Horizon (RTX 5080)" : "Value Esports"} Build!`);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function handleReset() {
    setBuild({});
  }

  async function handleAddToCart() {
    if (!complete || hasBlockingIssues) return;

    if (!user) {
      setShowSignInPrompt(true);
      return;
    }

    const buildSummary = CATEGORIES.map((c) => `${c.label}: ${build[c.key]?.name}`).join(", ");

    const { error: insertError } = await supabase.from("cart_items").insert({
      user_id: user.id,
      name: `Custom PC Build (${build.cpu?.name} + ${build.gpu?.name})`,
      price: total,
      quantity: 1,
    });

    if (insertError) {
      alert("Couldn't add to cart: " + insertError.message);
      return;
    }

    setToastMessage("Custom PC build successfully added to cart!");
    setTimeout(() => setToastMessage(null), 4000);
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Cyberpunk Header */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-black to-black py-16">
        <div className="absolute top-0 right-1/3 h-96 w-96 rounded-full bg-red-600/10 blur-[130px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-red-400">
                <Sparkles className="h-3.5 w-3.5 text-red-500" />
                Live Architecture & Compatibility Engine
              </div>

              <h1 className="mt-4 text-4xl font-black text-white sm:text-6xl">
                Custom <span className="text-red-500">PC Builder</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm sm:text-base text-zinc-400">
                Configure your dream gaming rig with real-time socket verification,
                thermal dissipation calculations, and power supply headroom analysis.
              </p>
            </div>

            {/* Quick Action Reset & Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handlePreloadPreset("titan5090")}
                className="rounded-xl border border-red-500/40 bg-red-600/15 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-600 hover:text-white"
              >
                🔥 RTX 5090 Titan Preset
              </button>
              <button
                type="button"
                onClick={() => handlePreloadPreset("sweetspot5080")}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-red-500 hover:text-white"
              >
                ⚡ Zen Horizon (RTX 5080)
              </button>
              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Build Completion Bar */}
          <div className="mt-10 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Build Configuration Progress ({selectedCount} of {CATEGORIES.length} parts)
              </span>
              <span className="text-red-500">{percent}% Complete</span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-zinc-800/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-500 shadow-sm shadow-red-600/50"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Builder Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Component Pickers (7 Cols) */}
          <div className="space-y-4 lg:col-span-8">
            <div className="rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-950 via-zinc-900/60 to-zinc-950 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <h2 className="text-xl font-bold text-white">Select Your Hardware Components</h2>
                <span className="text-xs text-zinc-400">All prices include assembly & testing</span>
              </div>

              <div className="mt-6 space-y-4">
                {CATEGORIES.map((cat, idx) => {
                  const options = optionsFor(cat.key);
                  const selected = build[cat.key];
                  const conflict = categoryHasIssue(issues, cat.key);
                  const Icon = cat.icon;

                  return (
                    <div
                      key={cat.key}
                      className={`relative rounded-2xl border p-4 transition-all duration-200 ${
                        conflict
                          ? "border-red-600/80 bg-red-950/20 shadow-md shadow-red-950/30"
                          : selected
                          ? "border-zinc-700 bg-zinc-900/90"
                          : "border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        {/* Category Label */}
                        <div className="flex items-center gap-3 sm:w-48 shrink-0">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold ${
                              selected
                                ? "border-red-500/40 bg-red-600/20 text-red-400"
                                : "border-zinc-800 bg-zinc-900 text-zinc-400"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-white">
                              {cat.label}
                            </span>
                            <div className="text-[10px] text-zinc-400">
                              {selected ? selected.brand || "Selected" : "Required"}
                            </div>
                          </div>
                        </div>

                        {/* Dropdown Selector */}
                        <div className="flex-1">
                          <select
                            value={selected ? selected.id : ""}
                            onChange={(e) => handleChange(cat.key, e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-black/80 px-4 py-2.5 text-xs font-medium text-white shadow-inner focus:border-red-500 focus:outline-none"
                          >
                            <option value="">-- Choose {cat.label} --</option>
                            {options.map((opt) => (
                              <option key={opt.id} value={opt.id} disabled={opt.stock <= 0}>
                                {opt.name} ({formatPrice(opt.price)}){opt.stock <= 0 ? " • Out of stock" : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Price Badge */}
                        <div className="flex items-center justify-between sm:w-28 sm:justify-end">
                          <span className="text-sm font-black text-red-500">
                            {selected ? formatPrice(selected.price) : "₹0"}
                          </span>
                        </div>
                      </div>

                      {/* Component Specs Details Pill */}
                      {selected && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-800/60 pt-2 text-[11px] text-zinc-400">
                          {selected.socket && (
                            <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5">
                              Socket: <strong className="text-zinc-200">{selected.socket}</strong>
                            </span>
                          )}
                          {selected.form_factor && (
                            <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5">
                              Form Factor: <strong className="text-zinc-200">{selected.form_factor}</strong>
                            </span>
                          )}
                          {selected.wattage && (
                            <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5">
                              Power: <strong className="text-zinc-200">{selected.wattage}</strong>
                            </span>
                          )}
                          {selected.capacity && (
                            <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5">
                              Capacity: <strong className="text-zinc-200">{selected.capacity}</strong>
                            </span>
                          )}
                          {cat.key === "ram" && (
                            <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5">
                              Standard: <strong className="text-emerald-400">{resolveRamGeneration(selected) || "DDR"}</strong>
                            </span>
                          )}
                        </div>
                      )}

                      {/* Explicit Conflict Alert on Component Card */}
                      {conflict && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/50 p-3 text-xs text-red-300">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                          <div className="leading-relaxed">
                            <strong className="block text-red-200 font-semibold mb-0.5">
                              Compatibility Issue
                            </strong>
                            {issues.find((i) => i.categories.includes(cat.key))?.message}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Telemetry, Power & Checkout Summary (4 Cols) */}
          <div className="space-y-6 lg:col-span-4">
            {/* Live System Power & Wattage Telemetry Card */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <Zap className="h-4 w-4 text-amber-400" />
                  System Power Telemetry
                </span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-400">
                  {wattageTelemetry.total}W Peak
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>GPU Estimated Load:</span>
                  <span className="font-bold text-zinc-200">{wattageTelemetry.gpuWatts}W</span>
                </div>
                <div className="flex justify-between">
                  <span>CPU Estimated Load:</span>
                  <span className="font-bold text-zinc-200">{wattageTelemetry.cpuWatts}W</span>
                </div>
                <div className="flex justify-between">
                  <span>Motherboard, RAM & Fans:</span>
                  <span className="font-bold text-zinc-200">{wattageTelemetry.otherWatts}W</span>
                </div>

                {psuCapacity > 0 && (
                  <div className="pt-2 border-t border-zinc-800/60">
                    <div className="flex justify-between text-xs">
                      <span>PSU Utilization ({psuCapacity}W):</span>
                      <span className={`font-bold ${psuLoadPercent > 85 ? "text-red-500" : "text-emerald-400"}`}>
                        {psuLoadPercent}% Load
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          psuLoadPercent > 85 ? "bg-red-600" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, psuLoadPercent)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Build Summary & Checkout Card */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <h3 className="flex items-center gap-2.5 text-lg font-bold text-white border-b border-zinc-800/80 pb-4">
                <ShieldCheck className="h-5 w-5 text-red-500" />
                Build Summary & Total
              </h3>

              {/* Itemized Hardware Checklist */}
              <div className="mt-4 space-y-2.5 text-xs border-b border-zinc-800/80 pb-4">
                {CATEGORIES.map((cat) => {
                  const item = build[cat.key];
                  return (
                    <div key={cat.key} className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-zinc-400 shrink-0">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item ? "bg-red-500 shadow-xs shadow-red-500" : "bg-zinc-700"
                          }`}
                        />
                        {cat.label}
                      </span>
                      <span
                        className={`truncate text-right text-[11px] font-medium ${
                          item ? "text-white" : "text-zinc-600"
                        }`}
                      >
                        {item ? item.name : "Not selected"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Compatibility Status Box */}
              <div
                className={`mt-4 flex items-start gap-2.5 rounded-2xl border p-4 text-xs font-medium ${
                  isVerified
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : hasBlockingIssues
                    ? "border-red-500/40 bg-red-950/40 text-red-400"
                    : "border-zinc-800 bg-zinc-900/60 text-zinc-400"
                }`}
              >
                {isVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                    <div>
                      <strong className="block text-emerald-300">100% Architecture Compatible</strong>
                      All components matched for physical clearance, socket synergy, and thermal headroom.
                    </div>
                  </>
                ) : hasBlockingIssues ? (
                  <div className="space-y-2.5 w-full">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                      <strong className="block text-red-300 font-bold uppercase tracking-wider text-[11px]">
                        Compatibility Alert ({issues.length} {issues.length === 1 ? "Issue" : "Issues"} Found)
                      </strong>
                    </div>
                    <ul className="space-y-2 border-t border-red-500/20 pt-2 text-[11px] text-red-200/90">
                      {issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-red-500 font-bold mt-0.5">•</span>
                          <span>{issue.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <>
                    <Sliders className="h-4 w-4 shrink-0 mt-0.5 text-zinc-400" />
                    <span>Select all 8 components to run automated hardware clearance verification.</span>
                  </>
                )}
              </div>

              {/* Price Details */}
              <div className="mt-6 border-t border-zinc-800/80 pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                    Total Build Cost:
                  </span>
                  <span className="text-3xl font-black text-red-500">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Includes assembly, thermal paste, 48h stress-testing, and GST.
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={!complete || hasBlockingIssues}
                onClick={handleAddToCart}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition shadow-lg ${
                  !complete || hasBlockingIssues
                    ? "cursor-not-allowed border border-zinc-800 bg-zinc-900 text-zinc-500 opacity-60"
                    : "bg-red-600 text-white shadow-red-600/30 hover:bg-red-700"
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{complete ? "Add Custom Build To Cart" : `Select Remaining Parts (${selectedCount}/8)`}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Alert */}
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
              <p className="text-[11px] text-zinc-400">Ready in cart for card or bank transfer checkout.</p>
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
              Sign In to Continue
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Sign in with your Google account to save this custom configuration and place your order.
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
