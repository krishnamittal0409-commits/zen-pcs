// components/home/FeaturedPCs.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface ReadyPC {
  id: number;
  name: string;
  price: number;
  badge: string | null;
  image: string | null;
  specs: string[];
}

// Exactly matches your real Supabase `ready_pcs` table rows
const DATABASE_FALLBACK_PCS: ReadyPC[] = [
  {
    id: 1,
    name: "Zen Starter",
    price: 74999,
    badge: "Best Value",
    image: "/images/pcs/zen-starter.png",
    specs: ["Ryzen 5 7600", "RTX 4060 8GB", "16GB DDR5 5600MHz", "1TB Gen 4 NVMe SSD"],
  },
  {
    id: 2,
    name: "Zen Pro",
    price: 124999,
    badge: "Best Seller",
    image: "/images/pcs/zen-pro.png",
    specs: ["Ryzen 7 7800X3D", "RTX 4070 Super", "32GB DDR5 6000MHz", "2TB Gen 4 NVMe SSD"],
  },
  {
    id: 5,
    name: "Zen Horizon",
    price: 349999,
    badge: "4K Sweet Spot",
    image: "/images/pcs/zen-horizon.png",
    specs: ["Ryzen 7 7800X3D", "GeForce RTX 5080 16GB GDDR7", "32GB DDR5 6000MHz EXPO", "2TB Gen 4 NVMe SSD"],
  },
  {
    id: 3,
    name: "Zen Ultra",
    price: 949999,
    badge: "Flagship 4K",
    image: "/images/pcs/zen-ultra.png",
    specs: ["Ryzen 9 9900X", "RTX 4090 24GB", "64GB DDR5 RAM", "4TB Gen 5 NVMe SSD"],
  },
  {
    id: 4,
    name: "Zen Apex",
    price: 1499999,
    badge: "Apex Sovereign",
    image: "/images/pcs/zen-apex.png",
    specs: ["Ryzen 9 9950X", "Asus Astral RTX 5090", "128GB DDR5 RAM", "4TB PCIe 5.0 NVMe"],
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
  const [pcs, setPcs] = useState<ReadyPC[]>(DATABASE_FALLBACK_PCS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPCs() {
      try {
        const { data, error } = await supabase
          .from("ready_pcs")
          .select("id, name, price, badge, image, specs")
          .eq("active", true)
          .order("price", { ascending: true });

        if (!error && data && data.length > 0) {
          const existingIds = new Set(data.map((p) => p.id));
          const existingNames = new Set(
            data.map((p) => p.name.toLowerCase().replace(" titan", "").trim())
          );

          const missingFallbacks = DATABASE_FALLBACK_PCS.filter((fb) => {
            const cleanName = fb.name.toLowerCase().replace(" titan", "").trim();
            return !existingIds.has(fb.id) && !existingNames.has(cleanName);
          });

          const combined = [...data, ...missingFallbacks].sort((a, b) => a.price - b.price);
          setPcs(combined as ReadyPC[]);
        }
      } catch (err) {
        console.warn("Using database fallback builds:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPCs();
  }, []);

  return (
    <section className="bg-black px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[4px] text-red-500">
              Featured Systems
            </p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Ready-To-Ship Systems
            </h2>
          </div>
          <Link
            href="/ready-pcs"
            className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            View All Systems →
          </Link>
        </div>

        {/* Clean Responsive 4-Column Grid - Zero Overlapping */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pcs.map((pc) => (
            <div
              key={`${pc.id}-${pc.name}`}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-zinc-700"
            >
              <div>
                {/* Image Showcase */}
                <div className="relative mb-5 flex h-52 items-center justify-center overflow-hidden rounded-xl border border-zinc-800/80 bg-black">
                  {pc.badge && (
                    <span className="absolute right-3 top-3 z-10 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {pc.badge}
                    </span>
                  )}
                  <div className="relative h-44 w-44">
                    <Image
                      src={normalizeImagePath(pc.image)}
                      alt={pc.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 260px"
                      className="object-contain p-2"
                    />
                  </div>
                </div>

                {/* PC Info */}
                <h3 className="text-lg font-bold text-white">
                  {pc.name}
                </h3>

                <p className="mt-1 text-2xl font-black text-red-500">
                  {formatPrice(pc.price)}
                </p>

                {/* Specs List */}
                <ul className="mt-4 space-y-1.5 border-t border-zinc-800/80 pt-3 text-xs text-zinc-300">
                  {pc.specs.map((spec, i) => (
                    <li key={i} className="truncate text-zinc-400">
                      • {spec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-6">
                <Link
                  href="/ready-pcs"
                  className="block w-full rounded-xl bg-red-600 py-2.5 text-center text-xs font-bold text-white transition hover:bg-red-700"
                >
                  View Build
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
