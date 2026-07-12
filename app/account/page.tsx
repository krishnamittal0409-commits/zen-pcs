// app/account/page.tsx
"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

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

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

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

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: nameInput, updated_at: new Date().toISOString() });

    setSavingName(false);

    if (error) {
      alert("Couldn't save name: " + error.message);
      return;
    }

    setProfile((prev) => ({ ...(prev ?? { avatar_url: null }), full_name: nameInput }));
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

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="mx-auto max-w-4xl px-8 py-24">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-4xl font-black">
            Your <span className="text-red-500">Account</span>
          </h1>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Admin Panel
              </Link>
            )}

            {user && (
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-red-500 hover:text-red-500"
              >
                Log out
              </button>
            )}
          </div>
        </div>

        {authLoading || loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : !user ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
            <p className="mb-4">Please sign in to view your account.</p>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile section */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                <span className="h-6 w-1 rounded-full bg-red-600" />
                Profile
              </h2>

              <div className="flex items-center gap-6">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt="Profile picture"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-500">
                      {user.email?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="cursor-pointer text-sm font-medium text-red-500 hover:underline">
                    {uploadingAvatar ? "Uploading…" : "Change picture"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm text-gray-400">Display name</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={savingName}
                    className="shrink-0 rounded-xl bg-red-600 px-6 py-3 font-semibold hover:bg-red-700 disabled:opacity-60"
                  >
                    {savingName ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>

            {/* Cart summary section */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                <span className="h-6 w-1 rounded-full bg-red-600" />
                Cart Summary
              </h2>

              {cartItems.length === 0 ? (
                <p className="text-gray-500">Your cart is empty.</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-gray-400">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="my-4 border-t border-zinc-800" />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-red-500">{formatPrice(cartTotal)}</span>
                  </div>
                </>
              )}

              <Link
                href="/cart"
                className="mt-6 inline-block text-sm text-red-500 hover:underline"
              >
                Go to full cart →
              </Link>
            </div>

            {/* Order history link */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold">
                <span className="h-6 w-1 rounded-full bg-red-600" />
                Order History
              </h2>
              <Link href="/orders" className="text-sm text-red-500 hover:underline">
                View your orders →
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}