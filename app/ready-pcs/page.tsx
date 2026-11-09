// app/ready-pcs/page.tsx
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart } from "lucide-react";

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
    specs: ["Ryzen 5 7600", "RTX 4060", "16GB DDR5", "1TB Gen 4 NVMe SSD"],
  },
  {
    id: 2,
    name: "Zen Pro",
    price: 124999,
    badge: "Best Seller",
    image: "/images/pcs/zen-pro.png",
    specs: ["Ryzen 7 7800X3D", "RTX 4070 Super", "32GB DDR5", "2TB Gen 4 NVMe SSD"],
  },
  {
    id: 3,
    name: "Zen Ultra",
    price: 949999,
    badge: "Flagship",
    image: "/images/pcs/zen-ultra.png",
    specs: ["Ryzen 9 9900X3D", "RTX 4090", "64GB DDR5 RAM", "4TB Gen 5 NVMe SSD"],
  },
  {
    id: 4,
    name: "Zen Apex",
    price: 1499999,
    badge: "Apex",
    image: "/images/pcs/zen-apex.png",
    specs: ["Ryzen 9 9950X3D2", "Asus Astral RTX 5090", "128 GB DDR5 RAM", "4 TB NVMe Gen 5"],
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
  const [pcs, setPcs] = useState<ReadyPC[]>(DATABASE_FALLBACK_PCS);
  const [loading, setLoading] = useState(true);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPCs() {
      try {
        const { data, error } = await supabase
          .from("ready_pcs")
          .select("id, name, price, badge, image, specs")
          .eq("active", true)
          .order("price", { ascending: true });

        if (!error && data && data.length > 0) {
          setPcs(data as ReadyPC[]);
        }
      } catch (err) {
        console.warn("Using database fallback ready systems:", err);
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

      setToastMessage(`${pc.name} added to cart!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Header */}
      <section className="border-b border-zinc-900 bg-black px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[4px] text-red-500">
            Ready PCs
          </p>
          <h1 className="text-4xl font-black text-white sm:text-5xl">
            Pre-Built Gaming Systems
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Browse our professionally assembled gaming PCs designed for performance,
            reliability, and upgradeability. All systems are backed by our 3-year warranty.
          </p>
        </div>
      </section>

      {/* PC Grid - Clean, spacious, zero overlapping */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pcs.map((pc) => (
            <div
              key={pc.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-zinc-700"
            >
              <div>
                {/* Image Box */}
                <div className="relative mb-5 flex h-56 items-center justify-center overflow-hidden rounded-xl border border-zinc-800/80 bg-black">
                  {pc.badge && (
                    <span className="absolute right-3 top-3 z-10 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {pc.badge}
                    </span>
                  )}
                  <div className="relative h-48 w-48">
                    <Image
                      src={normalizeImagePath(pc.image)}
                      alt={pc.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 260px"
                      className="object-contain p-2"
                    />
                  </div>
                </div>

                {/* Info */}
                <h2 className="text-lg font-bold text-white">
                  {pc.name}
                </h2>

                <p className="mt-1 text-2xl font-black text-red-500">
                  {formatPrice(pc.price)}
                </p>

                {/* Specs */}
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
                <button
                  type="button"
                  disabled={addingId === pc.id}
                  onClick={() => handleAddToCart(pc)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>{addingId === pc.id ? "Adding..." : "Add to Cart"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Simple Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-xs font-bold text-white shadow-xl">
          {toastMessage}
        </div>
      )}

      {/* Sign-In Prompt Modal */}
      {showSignInPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-base font-bold text-white">
              Sign in to continue
            </h3>
            <p className="mt-2 text-xs text-zinc-400">
              Sign in with your Google account to add this system to your cart.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSignInPrompt(false)}
                className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  signInWithGoogle();
                  setShowSignInPrompt(false);
                }}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700"
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
