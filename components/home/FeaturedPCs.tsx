// components/home/FeaturedPCs.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  Cpu,
  Tv,
  HardDrive,
  Layers,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const supabase = createClient();

interface ReadyPC {
  id: number;
  name: string;
  price: number;
  badge: string | null;
  image: string | null;
  specs: string[];
}

// Fallback high-fidelity builds if Supabase is offline
const FALLBACK_PCS: ReadyPC[] = [
  {
    id: 1,
    name: "Zen Apex 5090 Titan",
    price: 449999,
    badge: "Flagship Beast",
    image: "/images/pcs/zen-apex.png",
    specs: [
      "AMD Ryzen 7 9800X3D (Zen 5 3D V-Cache)",
      "NVIDIA GeForce RTX 5090 32GB GDDR7",
      "64GB DDR5 6000MHz CL30 EXPO",
      "2TB Gen5 NVMe SSD (12,400 MB/s)",
      "360mm ARGB AIO Liquid Cooler",
    ],
  },
  {
    id: 2,
    name: "Zen Ultra 5080 Pro",
    price: 289999,
    badge: "4K 240Hz Sweetspot",
    image: "/images/pcs/zen-ultra.png",
    specs: [
      "AMD Ryzen 7 7800X3D Processor",
      "NVIDIA GeForce RTX 5080 16GB GDDR7",
      "32GB DDR5 6000MHz CL30 Memory",
      "2TB PCIe 4.0 NVMe SSD",
      "850W ATX 3.0 Gold Certified PSU",
    ],
  },
  {
    id: 3,
    name: "Zen Pro 4070 Super",
    price: 154999,
    badge: "1440p Esports King",
    image: "/images/pcs/zen-pro.png",
    specs: [
      "AMD Ryzen 5 7600X AM5 Processor",
      "NVIDIA GeForce RTX 4070 Super 12GB",
      "32GB DDR5 5600MHz High-Speed RAM",
      "1TB Gen4 NVMe M.2 Solid State Drive",
      "750W 80+ Gold Power Supply",
    ],
  },
  {
    id: 4,
    name: "Zen Starter Esports Rig",
    price: 89999,
    badge: "Best Value 1080p",
    image: "/images/pcs/zen-starter.png",
    specs: [
      "AMD Ryzen 5 5600X Processor",
      "NVIDIA GeForce RTX 4060 8GB GDDR6",
      "16GB Dual Channel 3600MHz RAM",
      "1TB NVMe M.2 High-Speed SSD",
      "Airflow Mesh ARGB Case with 4 Fans",
    ],
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

export default function FeaturedPCs() {
  const [pcs, setPcs] = useState<ReadyPC[]>(FALLBACK_PCS);
  const [loading, setLoading] = useState(true);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    async function fetchPCs() {
      try {
        const { data, error } = await supabase
          .from("ready_pcs")
          .select("id, name, price, badge, image, specs")
          .eq("active", true)
          .order("price", { ascending: false });

        if (!error && data && data.length > 0) {
          setPcs(data as ReadyPC[]);
        }
      } catch (err) {
        console.warn("Using fallback ready systems:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPCs();
  }, []);

  function updateScrollButtons() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }

  useEffect(() => {
    updateScrollButtons();
  }, [pcs]);

  function scrollByCards(direction: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-card]")?.clientWidth ?? 380;
    const gap = 32;
    const amount = cardWidth + gap;

    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="relative overflow-hidden bg-black px-6 py-24 lg:px-8">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 h-96 w-96 -translate-y-1/2 rounded-full bg-red-600/10 blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-red-400">
              <Sparkles className="h-3 w-3 text-red-500" />
              Pre-Configured & Stress-Tested
            </div>

            <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">
              Ready-To-Ship <span className="text-red-500">Gaming Rigs</span>
            </h2>

            <p className="mt-2 text-sm sm:text-base text-zinc-400">
              Fully assembled, benchmarked, and boxed with dual-cushioning for safe doorstep arrival.
            </p>
          </div>

          {/* Scroller Controls */}
          <div className="flex items-center gap-3">
            <Link
              href="/ready-pcs"
              className="mr-3 hidden items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white sm:flex"
            >
              <span>View All Systems</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => scrollByCards("left")}
              disabled={!canScrollLeft}
              aria-label="Previous PCs"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-white transition hover:border-red-500 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards("right")}
              disabled={!canScrollRight}
              aria-label="Next PCs"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-white transition hover:border-red-500 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={scrollerRef}
          onScroll={updateScrollButtons}
          className="flex snap-x snap-mandatory gap-8 overflow-x-auto pb-6 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {pcs.map((pc) => (
            <div
              key={pc.id}
              data-card
              className="group relative w-[320px] shrink-0 snap-start overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black p-6 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-red-500/80 hover:shadow-red-950/20 sm:w-[380px]"
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
                {/* Internal Glow Circle */}
                <div className="absolute h-48 w-48 rounded-full bg-red-600/15 blur-2xl transition-all group-hover:scale-125 group-hover:bg-red-600/25" />

                <div className="relative h-60 w-60">
                  <Image
                    src={normalizeImagePath(pc.image)}
                    alt={pc.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-110 drop-shadow-xl"
                  />
                </div>
              </div>

              {/* Rig Title & Price */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                  {pc.name}
                </h3>

                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-2xl font-black text-red-500 sm:text-3xl">
                    {formatPrice(pc.price)}
                  </div>
                  <span className="text-[11px] font-medium text-zinc-400">
                    Incl. GST & White-Glove Setup
                  </span>
                </div>

                {/* Specs Pill List */}
                <ul className="mt-5 space-y-2 border-t border-zinc-800/80 pt-4 text-xs text-zinc-300">
                  {pc.specs.slice(0, 4).map((spec, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-400 text-[10px] font-bold">
                        ✓
                      </span>
                      <span className="truncate">{spec}</span>
                    </li>
                  ))}
                </ul>

                {/* Action CTA */}
                <div className="mt-6">
                  <Link
                    href="/ready-pcs"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 hover:shadow-red-600/40"
                  >
                    <span>View & Configure Rig</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
