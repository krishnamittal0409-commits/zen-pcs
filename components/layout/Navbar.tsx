// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, User, Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import InstallButton from "@/components/InstallButton";

const supabase = createClient();

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/ready-pcs", label: "Ready PCs" },
  { href: "/pc-builder", label: "Custom Builder" },
  { href: "/bring-your-parts", label: "Bring Your Own Parts" },
  { href: "/fps-calculator", label: "FPS Calculator" },
  { href: "/support", label: "Support" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      setFullName(null);
      setCartCount(0);
      return;
    }

    let cancelled = false;

    async function fetchProfileAndCart() {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url, full_name")
          .eq("id", user!.id)
          .maybeSingle();

        if (!cancelled && profile) {
          setAvatarUrl(profile?.avatar_url ?? null);
          setFullName(profile?.full_name ?? null);
        }

        const { count } = await supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user!.id);

        if (!cancelled && typeof count === "number") {
          setCartCount(count);
        }
      } catch (err) {
        console.warn("Failed fetching user telemetry:", err);
      }
    }

    fetchProfileAndCart();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand Logo with Red Glow */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-lg font-black text-white shadow-lg shadow-red-600/30 transition-transform duration-300 group-hover:scale-105">
            Z
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wider text-white">
              ZEN <span className="text-red-500">PCs</span>
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase -mt-1">
              Custom Gaming Atelier
            </span>
          </div>
        </Link>

        {/* Navigation — desktop only */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  isActive
                    ? "text-red-500"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-red-600 shadow-[0_0_8px_#dc2626]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Side Icons & Actions */}
        <div className="flex items-center gap-4 text-white">
          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <InstallButton />
          </div>

          <Link
            href="/search"
            aria-label="Search components"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/60 text-zinc-300 transition hover:border-red-500/50 hover:text-white"
          >
            <Search size={18} />
          </Link>

          {/* Cart Icon with Live Count */}
          <Link
            href="/cart"
            aria-label="Shopping Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800/60 bg-zinc-900/60 text-zinc-300 transition hover:border-red-500/50 hover:text-white"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white shadow-md shadow-red-900/60">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account Profile */}
          <Link
            href="/account"
            className="flex items-center gap-2.5 rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-3 py-2 transition hover:border-red-500/50"
          >
            {loading ? (
              <User size={18} className="opacity-40" />
            ) : user && avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-5 w-5 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <User size={18} className="text-zinc-300" />
            )}

            <span className="hidden text-xs font-bold text-zinc-200 sm:inline">
              {user && fullName ? fullName.split(" ")[0] : user ? "Account" : "Sign In"}
            </span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-white lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-zinc-800 bg-black/95 px-6 py-6 lg:hidden backdrop-blur-xl">
          <div className="flex flex-col gap-3">
            <InstallButton />

            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wider transition ${
                    isActive
                      ? "bg-red-600/10 text-red-500 border border-red-500/30"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
