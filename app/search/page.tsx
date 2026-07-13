// app/search/page.tsx
"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { readyPCs, ReadyPC } from "@/lib/ready-pcs-data";

const supabase = createClient();

interface ComponentResult {
  id: number;
  name: string;
  category: string;
  price: number;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const [matchedPCs, setMatchedPCs] = useState<ReadyPC[]>([]);
  const [matchedComponents, setMatchedComponents] = useState<ComponentResult[]>([]);

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);

    const lower = trimmed.toLowerCase();
    const pcMatches = readyPCs.filter(
      (pc) =>
        pc.name.toLowerCase().includes(lower) ||
        pc.specs.some((spec) => spec.toLowerCase().includes(lower))
    );

    const { data } = await supabase
      .from("components")
      .select("id, name, category, price")
      .ilike("name", `%${trimmed}%`)
      .eq("active", true)
      .limit(20);

    setMatchedPCs(pcMatches);
    setMatchedComponents((data ?? []) as ComponentResult[]);
    setLoading(false);
  }

  const totalResults = matchedPCs.length + matchedComponents.length;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-8 py-24">
        <h1 className="mb-8 text-4xl font-black">
          Search <span className="text-red-500">Zen PCs</span>
        </h1>

        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Search for a PC or part, e.g. Ryzen, RTX 4070, Zen Pro"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-red-500"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="shrink-0 rounded-xl bg-red-600 px-6 py-3 font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {searched && !loading && (
          <div className="mt-10 space-y-10">
            {totalResults === 0 ? (
              <p className="text-gray-400">No results found for &quot;{query}&quot;.</p>
            ) : (
              <>
                {matchedPCs.length > 0 && (
                  <div>
                    <h2 className="mb-4 text-xl font-bold">Ready PCs</h2>
                    <div className="space-y-3">
                      {matchedPCs.map((pc) => (
                        <Link
                          key={pc.name}
                          href="/ready-pcs"
                          className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-red-500"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{pc.name}</span>
                            <span className="text-red-500">{formatPrice(pc.price)}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {pc.specs.join(" · ")}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {matchedComponents.length > 0 && (
                  <div>
                    <h2 className="mb-4 text-xl font-bold">Components</h2>
                    <div className="space-y-3">
                      {matchedComponents.map((comp) => (
                        <Link
                          key={comp.id}
                          href="/pc-builder"
                          className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-red-500"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold">{comp.name}</span>
                              <p className="text-xs uppercase tracking-wider text-gray-500">
                                {comp.category}
                              </p>
                            </div>
                            <span className="text-red-500">{formatPrice(comp.price)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </main>
  );
}