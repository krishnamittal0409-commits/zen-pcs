"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

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

export default function ReadyPCsPage() {
  const { user, signInWithGoogle } = useAuth();
  const [pcs, setPcs] = useState<ReadyPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

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

  async function handleAddToCart(pc: ReadyPC) {
    if (!user) {
      setShowSignInPrompt(true);
      return;
    }

    setAddingId(pc.id);

    const { error: insertError } = await supabase.from("cart_items").insert({
      user_id: user.id,
      name: pc.name,
      price: pc.price,
      quantity: 1,
    });

    setAddingId(null);

    if (insertError) {
      alert("Couldn't add to cart: " + insertError.message);
      return;
    }

    alert(`${pc.name} added to cart!`);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-8 py-24">
        <p className="mb-3 font-semibold uppercase tracking-[4px] text-red-500">
          Ready PCs
        </p>

        <h1 className="mb-6 text-5xl font-black">
          Pre-Built Gaming Systems
        </h1>

        <p className="max-w-2xl text-gray-400">
          Browse our professionally assembled gaming PCs designed for
          performance, reliability, and upgradeability.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-8 pb-24">
        {loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : pcs.length === 0 ? (
          <p className="text-gray-500">No PCs available right now.</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {pcs.map((pc) => (
              <div
                key={pc.id}
                className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:-translate-y-3 hover:border-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.15)]"
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
                  <h2 className="mb-2 text-2xl font-bold">
                    {pc.name}
                  </h2>

                  <p className="mb-6 text-3xl font-black text-red-500">
                    {formatPrice(pc.price)}
                  </p>

                  <ul className="mb-6 space-y-2 text-gray-300">
                    {pc.specs.map((spec) => (
                      <li key={spec}>✓ {spec}</li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    disabled={addingId === pc.id}
                    onClick={() => handleAddToCart(pc)}
                    className="w-full rounded-xl bg-red-600 py-3 font-semibold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {addingId === pc.id ? "Adding..." : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
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
              Sign in to add this PC to your cart.
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
    </main>
  );
}