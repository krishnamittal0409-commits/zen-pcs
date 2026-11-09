// app/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Package,
  ShoppingBag,
  Camera,
  ArrowRight,
  Check,
  Sparkles,
  Mail,
  Lock,
  Headphones,
  Sliders,
  ExternalLink,
} from "lucide-react";

const supabase = createClient();

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AccountPage() {
  const { user, loading: authLoading, signOut, signInWithGoogle, isAdmin } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ----- Email/password sign-in state -----
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function loadData() {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user!.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setNameInput(profileData.full_name ?? "");
      } else {
        setProfile({ full_name: null, avatar_url: null });
      }

      const { data: cartData } = await supabase
        .from("cart_items")
        .select("id, name, price, quantity")
        .order("added_at", { ascending: true });

      setCartItems((cartData ?? []) as CartItem[]);
      setLoading(false);
    }

    loadData();
  }, [user, authLoading]);

  async function handleSaveName() {
    if (!user) return;
    setSavingName(true);
    setSaveSuccess(false);

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: nameInput, updated_at: new Date().toISOString() });

    setSavingName(false);

    if (error) {
      alert("Couldn't save name: " + error.message);
      return;
    }

    setProfile((prev) => ({ ...(prev ?? { avatar_url: null }), full_name: nameInput }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploadingAvatar(false);
      alert("Couldn't upload picture: " + uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, avatar_url: avatarUrl, updated_at: new Date().toISOString() });

    setUploadingAvatar(false);

    if (updateError) {
      alert("Couldn't save picture: " + updateError.message);
      return;
    }

    setProfile((prev) => ({ ...(prev ?? { full_name: null }), avatar_url: avatarUrl }));
  }

  async function handleEmailAuth() {
    setAuthError(null);
    setAuthMessage(null);

    if (!email.trim() || !password.trim()) {
      setAuthError("Enter both your email and password.");
      return;
    }

    setAuthSubmitting(true);

    if (authMode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      setAuthSubmitting(false);

      if (error) {
        setAuthError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      setAuthSubmitting(false);

      if (error) {
        setAuthError(error.message);
        return;
      }

      setAuthMessage("Account created! Check your email to confirm, then sign in.");
      setAuthMode("signin");
    }
  }

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <Navbar />

      {/* Hero Ambient Header */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-black to-black py-16">
        <div className="absolute top-0 right-1/4 h-80 w-80 rounded-full bg-red-600/10 blur-[140px] pointer-events-none" />

        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Atelier Client Portal</span>
              </div>
              <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                Personal <span className="text-red-500">Dashboard</span>
              </h1>
              <p className="mt-1 text-xs text-zinc-400">
                Manage your hardware preferences, order telemetry, and verified atelier profile.
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/40 transition hover:bg-red-700"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </Link>
              )}

              {user && (
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-red-500 hover:text-red-400"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        {authLoading || loading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent mb-4" />
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Synchronizing Atelier Profile...
            </p>
          </div>
        ) : !user ? (
          /* Sign-in / Sign-up Luxury Box */
          <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-zinc-800/90 bg-zinc-950 p-8 shadow-2xl">
            {/* Header / Tabs */}
            <div className="mb-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-600/10 text-red-500 mb-3">
                <User className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-black text-white">
                {authMode === "signin" ? "Welcome Back" : "Join Zen PCs Atelier"}
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                {authMode === "signin"
                  ? "Access your saved builds, order pipeline, and concierge."
                  : "Create an account for personalized hardware assembly."}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="mb-6 grid grid-cols-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError(null);
                  setAuthMessage(null);
                }}
                className={`rounded-lg py-2 transition ${
                  authMode === "signin"
                    ? "bg-red-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError(null);
                  setAuthMessage(null);
                }}
                className={`rounded-lg py-2 transition ${
                  authMode === "signup"
                    ? "bg-red-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Email Form */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@battlestation.com"
                  className="w-full rounded-xl border border-zinc-800 bg-black/90 px-4 py-3 text-xs text-white placeholder-zinc-600 shadow-inner outline-none transition focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <Lock className="h-3.5 w-3.5 text-zinc-500" />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-zinc-800 bg-black/90 px-4 py-3 text-xs text-white placeholder-zinc-600 shadow-inner outline-none transition focus:border-red-500"
                />
              </div>

              {authError && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                  {authError}
                </div>
              )}
              {authMessage && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
                  {authMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleEmailAuth}
                disabled={authSubmitting}
                className="w-full rounded-xl bg-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-950/50 transition hover:bg-red-700 disabled:opacity-60"
              >
                {authSubmitting
                  ? "Authenticating…"
                  : authMode === "signin"
                  ? "Sign In to Account"
                  : "Register New Account"}
              </button>

              <div className="flex items-center gap-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                <div className="h-px flex-1 bg-zinc-800" />
                Secure Single Sign-On
                <div className="h-px flex-1 bg-zinc-800" />
              </div>

              <button
                type="button"
                onClick={signInWithGoogle}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 py-3 text-xs font-bold text-white transition hover:border-zinc-700 hover:bg-zinc-900"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        ) : (
          /* Signed In Client Dashboard View */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left 7 Columns: Profile Identity Card */}
            <div className="space-y-6 lg:col-span-7">
              {/* Profile Card */}
              <div className="rounded-3xl border border-zinc-800/90 bg-zinc-950 p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5 mb-6">
                  <h2 className="flex items-center gap-2.5 text-base font-bold text-white">
                    <User className="h-4 w-4 text-red-500" />
                    Identity & Security
                  </h2>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Verified Member
                  </span>
                </div>

                {/* Avatar & Email Block */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative group h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-900 shadow-md">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt="Profile avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-black text-red-500">
                        {user.email?.[0]?.toUpperCase() ?? "Z"}
                      </div>
                    )}

                    {/* Camera upload overlay */}
                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 backdrop-blur-xs transition group-hover:opacity-100">
                      <Camera className="h-5 w-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {profile?.full_name || "Zen Enthusiast"}
                      </span>
                      {isAdmin && (
                        <span className="rounded bg-red-600/20 px-1.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400 font-mono">{user.email}</p>
                    <label className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer">
                      <Camera className="h-3 w-3" />
                      <span>{uploadingAvatar ? "Uploading photo…" : "Update Profile Photo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                </div>

                {/* Edit Display Name */}
                <div className="mt-8 border-t border-zinc-800/80 pt-6">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Display Name
                  </label>
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter your name or gamer handle"
                      className="w-full rounded-xl border border-zinc-800 bg-black/90 px-4 py-2.5 text-xs text-white placeholder-zinc-600 shadow-inner outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60 shadow-md shadow-red-950/40"
                    >
                      {savingName ? (
                        "Saving…"
                      ) : saveSuccess ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Saved
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </div>

                {/* Atelier Security Guarantee Note */}
                <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-xs text-zinc-400">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                  <span className="leading-relaxed">
                    All hardware reservations and custom configuration designs are securely
                    associated with your verified credentials.
                  </span>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Hub Cards (Orders, Cart & Concierge) */}
            <div className="space-y-6 lg:col-span-5">
              {/* Order Tracking Quick Hub */}
              <div className="rounded-3xl border border-zinc-800/90 bg-zinc-950 p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                    <Package className="h-4 w-4 text-red-500" />
                    Build & Order Tracking
                  </h3>
                  <Link
                    href="/orders"
                    className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Track the 5-stage cleanroom assembly, 48-hour thermal stress tests, and courier transit.
                </p>

                <Link
                  href="/orders"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 text-xs font-bold text-white transition hover:border-red-500 hover:text-white"
                >
                  <Package className="h-3.5 w-3.5 text-red-400" />
                  Launch Live Order Tracker
                </Link>
              </div>

              {/* Cart Summary Card */}
              <div className="rounded-3xl border border-zinc-800/90 bg-zinc-950 p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                    <ShoppingBag className="h-4 w-4 text-red-500" />
                    Active Cart
                  </h3>
                  <span className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-[10px] font-bold text-zinc-300">
                    {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-500">
                    Your cart is currently empty.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="truncate pr-2 text-zinc-300 font-medium">
                          {item.name} <span className="text-zinc-500">×{item.quantity}</span>
                        </span>
                        <span className="shrink-0 font-bold text-white">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {cartItems.length > 3 && (
                      <p className="text-[10px] text-zinc-500 italic">
                        +{cartItems.length - 3} more items in cart...
                      </p>
                    )}

                    <div className="border-t border-zinc-800/80 pt-3 flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Subtotal:
                      </span>
                      <span className="text-base font-black text-red-500">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex gap-2">
                  <Link
                    href="/cart"
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-center text-xs font-bold text-white transition hover:bg-red-700 shadow-md shadow-red-950/40"
                  >
                    View Full Cart
                  </Link>
                  <Link
                    href="/pc-builder"
                    className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2.5 text-center text-xs font-bold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
                  >
                    <Sliders className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* VIP Concierge Card */}
              <div className="rounded-3xl border border-zinc-800/90 bg-zinc-950 p-6 shadow-xl">
                <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 mb-3 text-xs font-bold uppercase tracking-wider text-white">
                  <Headphones className="h-4 w-4 text-red-500" />
                  VIP Hardware Concierge
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Direct engineer assistance for custom watercooling loops, corporate workstations, or delivery questions.
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-3 text-xs">
                  <span className="text-zinc-500 font-mono text-[11px]">krishnamittal0409@gmail.com</span>
                  <Link
                    href="/support"
                    className="font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    Open Ticket <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
