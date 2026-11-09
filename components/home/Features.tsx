// components/home/Features.tsx
"use client";

import {
  Cpu,
  ShieldCheck,
  Truck,
  CreditCard,
  Zap,
  Sparkles,
  Award,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Enthusiast-Grade Hardware",
    badge: "Next-Gen Ready",
    description:
      "Latest NVIDIA GeForce RTX 5090 / 5080 and AMD Ryzen 9000X3D processors, paired with high-frequency DDR5 EXPO memory and Gen5 NVMe storage.",
  },
  {
    icon: Zap,
    title: "48-Hour Dual Burn-In",
    badge: "100% Stability",
    description:
      "Every desktop undergoes rigorous 48-hour thermal stressing with FurMark, Cinebench R24, and MemTest86 before packing to guarantee absolute stability.",
  },
  {
    icon: CreditCard,
    title: "Secure Card & Bank Checkout",
    badge: "Zero Surcharge",
    description:
      "Seamless online payment via Credit Cards (Visa, MasterCard, RuPay), Debit Cards, and Net Banking across 50+ banks, with 256-bit encrypted checkout.",
  },
  {
    icon: Truck,
    title: "Doorstep White-Glove Setup",
    badge: "Pan-India",
    description:
      "Shockproof wooden-crate transit across India. In major hubs, our certified hardware technician arrives at your doorstep to unbox, boot, and bench-test your rig.",
  },
];

export default function Features() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black px-6 py-24 lg:px-8">
      {/* Background Accent */}
      <div className="absolute top-1/2 right-1/4 h-80 w-80 -translate-y-1/2 rounded-full bg-red-600/10 blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400">
            <Sparkles className="h-3.5 w-3.5 text-red-500" />
            The Zen PCs Engineering Standard
          </div>

          <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
            Why Gamers & Creators <span className="text-red-500">Choose Zen PCs</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400">
            We don&apos;t just sell PC parts. We build bespoke computing masterpieces with
            meticulous thermal tuning, medical-grade cable routing, and lifetime technician support.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-black p-7 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-red-500/80 hover:shadow-red-950/20"
              >
                {/* Glowing Top Accent Strip */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="mb-6 flex items-center justify-between">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 text-red-500 shadow-inner group-hover:border-red-500/50 group-hover:bg-red-600/10 group-hover:text-red-400 transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-0.5 text-[10px] font-bold text-zinc-400">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="mb-3 text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-xs leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
