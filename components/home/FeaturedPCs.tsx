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

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FeaturedPCs() {
  const [pcs, setPcs] = useState<ReadyPC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPCs() {
      const { data } = await supabase
        .from("ready_pcs")
        .select("id, name, price, badge, image, specs")
        .eq("active", true)
        .order("price", { ascending: true });

      setPcs((data ?? []) as ReadyPC[]);
      setLoading(false);
    }

    fetchPCs();
  }, []);

  if (loading || pcs.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-12 text-center">
        <p className="mb-3 font-semibold uppercase tracking-[4px] text-red-500">
          Featured Systems
        </p>

        <h2 className="text-4xl font-bold">
          Ready To Ship Gaming PCs
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {pcs.map((pc) => (
          <div
            key={pc.id}
            className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:-translate-y-2 hover:border-red-500"
          >
            <div className="relative flex h-80 items-center justify-center overflow-hidden border-b border-zinc-800 bg-black">
              {pc.badge && (
                <span className="absolute right-4 top-4 z-20 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  {pc.badge}
                </span>
              )}

              <div className="absolute h-56 w-56 rounded-full bg-red-600/20 blur-3xl" />

              {pc.image && (
                <Image
                  src={pc.image}
                  alt={pc.name}
                  fill
                  className="relative z-10 object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>

            <div className="p-6">
              <h3 className="mb-2 text-2xl font-bold">
                {pc.name}
              </h3>

              <p className="mb-6 text-3xl font-black text-red-500">
                {formatPrice(pc.price)}
              </p>

              <ul className="mb-6 space-y-2 text-gray-300">
                {pc.specs.map((spec) => (
                  <li key={spec}>✓ {spec}</li>
                ))}
              </ul>

              <Link
                href="/ready-pcs"
                className="block w-full rounded-xl bg-red-600 py-3 text-center font-semibold transition hover:bg-red-700"
              >
                View Build
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}