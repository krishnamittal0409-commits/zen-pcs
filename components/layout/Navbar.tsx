// components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
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
        console.warn("Failed fetching user navbar telemetry:", err);
      }
    }

    fetchProfileAndCart();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Brand Logo - Clean, balanced, vertically centered */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white">
            Z
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Zen PCs
          </span>
        </Link>

        {/* Navigation - Clean, perfectly aligned */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "font-semibold text-red-500"
                    : "text-zinc-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Tools - Balanced & Centered */}
        <div className="flex items-center gap-5 text-white">
          <div className="hidden sm:block">
            <InstallButton />
          </div>

          <Link
            href="/search"
            aria-label="Search catalog"
            className="text-zinc-300 transition-colors hover:text-white"
          >
            <Search size={19} />
          </Link>

          <Link
            href="/cart"
            aria-label="View shopping cart"
            className="relative text-zinc-300 transition-colors hover:text-white"
          >
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/account"
            className="flex items-center gap-2 text-zinc-300 transition-colors hover:text-white"
          >
            {loading ? (
              <User size={19} className="opacity-40" />
            ) : user && avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-6 w-6 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <User size={19} />
            )}
            {user && fullName && (
              <span className="hidden text-xs font-medium sm:inline">
                {fullName.split(" ")[0]}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="text-zinc-300 hover:text-white lg:hidden"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-zinc-800 bg-black/95 px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            <InstallButton />

            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium py-2 transition-colors ${
                    isActive ? "font-bold text-red-500" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
