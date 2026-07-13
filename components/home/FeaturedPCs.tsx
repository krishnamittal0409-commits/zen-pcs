// components/home/FeaturedPCs.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  // Keeps the arrow buttons in sync with actual scroll position —
  // disables "left" at the start and "right" at the end.
  function updateScrollButtons() {
    const el = scrollerRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateScrollButtons();
  }, [pcs]);

  function scrollByCards(direction: "left" | "right") {
    const el = scrollerRef.current;
    if (!el) return;

    const cardWidth = el.querySelector("[data-card]")?.clientWidth ?? 360;
    const gap = 32; // matches gap-8
    const amount = cardWidth + gap;

    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  if (loading || pcs.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-3 font-semibold uppercase tracking-[4px] text-red-500">
            Featured Systems
          </p>

          <h2 className="text-4xl font-bold">
            Ready To Ship Gaming PCs
          </h2>
        </div>

        {/* Arrow controls — only meaningful once there's overflow to scroll */}
        <div className="hidden gap-3 sm:flex">
          <button
            type="button"
            onClick={() => scrollByCards("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 text-white transition hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-zinc-700 disabled:hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCards("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 text-white transition hover:border-red-500 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-zinc-700 disabled:hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={updateScrollButtons}
        className="flex snap-x snap-mandatory gap-8 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pcs.map((pc) => (
          <div
            key={pc.id}
            data-card
            className="group w-[320px] shrink-0 snap-start overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:-translate-y-2 hover:border-red-500 sm:w-[360px]"
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
