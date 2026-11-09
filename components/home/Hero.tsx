// components/home/Hero.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layers } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-12 sm:py-16 lg:py-20 lg:px-8">
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-red-600/10 blur-[130px] pointer-events-none" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-8">
        {/* Left Side: Typography & Conversion Deck (7 cols on lg) */}
        <div className="text-center lg:col-span-7 lg:text-left">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-red-500/30 bg-red-950/30 px-3.5 py-1 mb-5 shadow-sm shadow-red-950/40">
            <Image
              src="/images/logo/zen-emblem.png"
              alt="Zen PCs Emblem"
              width={18}
              height={18}
              className="rounded shrink-0"
            />
            <span className="text-[11px] font-bold uppercase tracking-[3px] text-red-400">
              Welcome to Zen PCs
            </span>
          </div>

          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.06]">
            BUILD YOUR <br />
            <span className="text-red-500">DREAM PC</span>
          </h1>

          <p className="mt-6 text-base text-zinc-400 sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
            Premium custom gaming systems engineered for uncompromising performance,
            surgical cable management, and white-glove doorstep delivery across India.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              href="/ready-pcs"
              className="flex items-center gap-2 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 shadow-lg shadow-red-950/40"
            >
              <span>Shop Ready PCs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/pc-builder"
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-7 py-3.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-700 hover:text-white"
            >
              <Layers className="h-4 w-4 text-zinc-400" />
              <span>Custom Builder</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Apex PC Flagship Showcase (5 cols on lg) */}
        <div className="relative flex items-center justify-center lg:col-span-5 lg:justify-end">
          <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-none h-[380px] sm:h-[480px] lg:h-[560px] xl:h-[600px] flex items-center justify-center">
            {/* Atmospheric Ambient Glow behind chassis */}
            <div className="absolute inset-0 bg-radial from-red-600/20 via-red-950/5 to-transparent blur-3xl rounded-full scale-95 pointer-events-none" />

            <Image
              src="/images/pcs/zen-apex.png"
              alt="Zen Apex Flagship Gaming PC"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 620px"
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] scale-110 sm:scale-115 transition-transform duration-500 hover:scale-120"
              priority
            />

            {/* Floating Atelier Verification Badge */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex items-center gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-950/90 px-3.5 py-2 shadow-2xl backdrop-blur-md">
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-lg border border-red-500/40 bg-zinc-900">
                <Image
                  src="/images/logo/zen-emblem.png"
                  alt="Zen Logo"
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] font-black uppercase tracking-wider text-white">Zen Apex Sovereign</span>
                <span className="text-[9px] font-semibold text-red-400">RTX 5090 • 48h Stress Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
