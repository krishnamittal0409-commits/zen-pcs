// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { Search, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function Navbar() {
  const { user, loading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      setFullName(null);
      return;
    }

    let cancelled = false;

    async function fetchProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", user!.id)
        .maybeSingle();

      if (!cancelled) {
        setAvatarUrl(data?.avatar_url ?? null);
        setFullName(data?.full_name ?? null);
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-lg font-bold text-white">
            Z
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-white">
            Zen PCs
          </h1>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 text-sm font-medium text-white md:flex">
          <Link href="/" className="transition hover:text-red-500">Home</Link>
          <Link href="/ready-pcs" className="transition hover:text-red-500">Ready PCs</Link>
          <Link href="/pc-builder" className="transition hover:text-red-500">Custom Builder</Link>
          <Link href="/bring-your-parts" className="transition hover:text-red-500">Bring Your Own Parts</Link>
          <Link href="/fps-calculator" className="transition hover:text-red-500">FPS Calculator</Link>
          <Link href="/support" className="transition hover:text-red-500">Support</Link>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-5 text-white">
          <Link href="/search">
            <Search size={20} className="cursor-pointer transition hover:text-red-500" />
          </Link>

          <Link href="/cart" className="relative">
            <ShoppingCart size={20} className="cursor-pointer transition hover:text-red-500" />
          </Link>

          {/* Account */}
          <Link href="/account" className="flex items-center gap-2">
            {loading ? (
              <User size={20} className="opacity-40" />
            ) : user && avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Your profile"
                className="h-6 w-6 rounded-full border border-zinc-700 object-cover transition hover:border-red-500"
              />
            ) : (
              <User size={20} className="cursor-pointer transition hover:text-red-500" />
            )}

            {user && fullName && (
              <span className="hidden text-sm font-medium text-white transition hover:text-red-500 sm:inline">
                {fullName}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}