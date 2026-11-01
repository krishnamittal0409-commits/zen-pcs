// app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Script from "next/script";

const supabase = createClient();

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: { error: { description: string } }) => void) => void;
    };
  }
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchCart() {
      const { data } = await supabase
        .from("cart_items")
        .select("id, name, price, quantity")
        .order("added_at", { ascending: true });

      setItems((data ?? []) as CartItem[]);
      setLoading(false);
    }

    fetchCart();
  }, [user, authLoading]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleCodOrder() {
    if (!user) return;
    setPlacingOrder(true);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total,
        status: "Pending (Cash on Delivery)",
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: `${customerAddress.trim()}\n\n[Payment: Cash on Delivery / Pay on Setup]`,
      })
      .select()
      .single();

    if (orderError || !order) {
      setPlacingOrder(false);
      alert("Couldn't place order: " + (orderError?.message ?? "unknown error"));
      return;
    }

    const orderItemRows = items.map((item) => ({
      order_id: order.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemRows);

    if (itemsError) {
      setPlacingOrder(false);
      alert("Order created, but couldn't save items: " + itemsError.message);
      return;
    }

    const cartIds = items.map((item) => item.id);
    await supabase.from("cart_items").delete().in("id", cartIds);

    setPlacingOrder(false);
    router.push(`/order-confirmation?order=${order.id}&payment=cod`);
  }

  async function handleOnlinePayment() {
    if (!user) return;
    setPlacingOrder(true);
    setFormError(null);

    try {
      // 1. Ensure Razorpay script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || typeof window === "undefined" || !window.Razorpay) {
        throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.");
      }

      // 2. Create order on backend via Razorpay Test API
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      const orderData = await res.json();

      if (!res.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to initialize payment gateway");
      }

      // Format description and validate phone for Razorpay prefill
      const cleanPhone = customerPhone.replace(/\D/g, "");
      const isTenDigitPhone = cleanPhone.length >= 10;

      // 3. Launch Razorpay modal with test configuration
      const options: RazorpayOptions = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_Tv2S3vyatJ5ixW",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Zen PCs",
        description: orderData.isCappedForTest
          ? `Zen PCs Order (Gateway test limit: ₹5,00,000)`
          : `Custom PC Order (${items.length} item${items.length > 1 ? "s" : ""})`,
        order_id: orderData.orderId,
        prefill: {
          name: customerName.trim(),
          email: user.email ?? "",
          ...(isTenDigitPhone ? { contact: customerPhone.trim() } : {}),
        },
        theme: {
          color: "#d6001c",
        },
        modal: {
          ondismiss: () => {
            setPlacingOrder(false);
          },
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // 4. Verify payment signature on the server
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyData.verified) {
              alert("Payment verification failed: " + (verifyData.error || "Invalid signature"));
              setPlacingOrder(false);
              return;
            }

            // 5. Save order in Supabase with Paid status
            const { data: order, error: orderError } = await supabase
              .from("orders")
              .insert({
                user_id: user.id,
                total,
                status: "Paid (Online - Razorpay)",
                customer_name: customerName.trim(),
                customer_phone: customerPhone.trim(),
                customer_address: `${customerAddress.trim()}\n\n[Payment: Paid Online via Razorpay (Test API) | Payment ID: ${response.razorpay_payment_id} | Order ID: ${response.razorpay_order_id}]`,
              })
              .select()
              .single();

            if (orderError || !order) {
              alert("Payment was successful, but could not save order: " + (orderError?.message ?? "unknown error"));
              setPlacingOrder(false);
              return;
            }

            // 6. Save order items
            const orderItemRows = items.map((item) => ({
              order_id: order.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            }));

            await supabase.from("order_items").insert(orderItemRows);

            // 7. Clear cart items
            const cartIds = items.map((item) => item.id);
            await supabase.from("cart_items").delete().in("id", cartIds);

            setPlacingOrder(false);
            router.push(`/order-confirmation?order=${order.id}&payment=online&payment_id=${response.razorpay_payment_id}`);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error finalizing order";
            alert("Error finalizing order: " + msg);
            setPlacingOrder(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (failResponse) => {
        alert("Payment Failed: " + (failResponse.error?.description || "Transaction cancelled"));
        setPlacingOrder(false);
      });
      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment error occurred";
      setFormError(msg);
      setPlacingOrder(false);
    }
  }

  async function handlePlaceOrder() {
    if (!user) return;

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setFormError("Please fill in your name, phone, and delivery address.");
      return;
    }

    setFormError(null);

    if (paymentMethod === "online") {
      await handleOnlinePayment();
    } else {
      await handleCodOrder();
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <section className="mx-auto max-w-3xl px-8 py-24">
        <h1 className="mb-10 text-4xl font-black">
          <span className="text-red-500">Checkout</span>
        </h1>

        {authLoading || loading ? (
          <p className="text-gray-400">Loading…</p>
        ) : !user ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
            Please sign in to checkout.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-gray-400">
            Your cart is empty.
            <div className="mt-4">
              <Link href="/pc-builder" className="text-red-500 hover:underline">
                Start building a PC →
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                <span className="h-6 w-1 rounded-full bg-red-600" />
                Order Summary
              </h2>

              <div className="space-y-3">
                {items.map((item) => (
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

              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-red-500">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
                <span className="h-6 w-1 rounded-full bg-red-600" />
                Your Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-400">Full name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">Phone number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">Delivery address</label>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    rows={3}
                    placeholder="Enter complete delivery address with PIN code"
                    className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {formError && (
                <div className="mt-4 rounded-xl border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-400">
                  {formError}
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold">
                <span className="h-6 w-1 rounded-full bg-red-600" />
                Payment Method
              </h2>
              <p className="mb-6 text-sm text-gray-400">
                Choose to pay online securely or pay on delivery when our technician sets up your PC.
              </p>

              <div className="space-y-4">
                {/* Option 1: Razorpay Online Payment */}
                <label
                  className={`flex cursor-pointer flex-col rounded-2xl border p-5 transition ${
                    paymentMethod === "online"
                      ? "border-red-600 bg-black/60 shadow-[0_0_15px_rgba(220,38,38,0.15)]"
                      : "border-zinc-800 bg-black/20 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={paymentMethod === "online"}
                        onChange={() => setPaymentMethod("online")}
                        className="h-4 w-4 accent-red-600"
                      />
                      <span className="text-base font-bold text-white">
                        Pay Online (Razorpay)
                      </span>
                    </div>
                    <span className="rounded-full border border-amber-600/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                      Test API Active
                    </span>
                  </div>
                  <p className="mt-2 pl-7 text-sm text-gray-400">
                    Pay securely using UPI (Google Pay, PhonePe, Paytm), Credit / Debit Card, or Net Banking via Razorpay Test mode.
                  </p>
                  {total > 500000 && paymentMethod === "online" && (
                    <p className="mt-2 pl-7 text-xs text-amber-400/90">
                      ℹ️ Note: Indian payment gateways have a single-transaction limit of ₹5,00,000. In this test API mode, test checkout will authorize up to ₹5,00,000 and confirm your full build of {formatPrice(total)}.
                    </p>
                  )}
                </label>

                {/* Option 2: Cash on Delivery / Pay on Installation */}
                <label
                  className={`flex cursor-pointer flex-col rounded-2xl border p-5 transition ${
                    paymentMethod === "cod"
                      ? "border-red-600 bg-black/60 shadow-[0_0_15px_rgba(220,38,38,0.15)]"
                      : "border-zinc-800 bg-black/20 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="h-4 w-4 accent-red-600"
                      />
                      <span className="text-base font-bold text-white">
                        Cash on Delivery (Pay on Installation)
                      </span>
                    </div>
                    <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-gray-300">
                      Pay on Delivery
                    </span>
                  </div>
                  <p className="mt-2 pl-7 text-sm text-gray-400">
                    No payment is needed right now. Our technician will assemble and set up your PC at your doorstep — you can pay them directly via Cash or online (UPI).
                  </p>
                </label>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full rounded-xl bg-red-600 py-4 text-base font-bold transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {placingOrder
                ? paymentMethod === "online"
                  ? "Opening Razorpay..."
                  : "Placing Order..."
                : paymentMethod === "online"
                ? `Pay ${formatPrice(total)} Online`
                : "Place Order (Cash on Delivery)"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
