// components/home/Hero.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Layers } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-16 sm:py-24 lg:px-8">
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row lg:items-center">
        {/* Left Side: Typography & Conversion Deck */}
        <div className="max-w-2xl text-center lg:text-left">
          <p className="mb-4 text-xs font-bold uppercase tracking-[4px] text-red-500">
            Welcome to Zen PCs
          </p>

          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]">
            BUILD YOUR <br />
            <span className="text-red-500">DREAM PC</span>
          </h1>

          <p className="mt-6 text-base text-zinc-400 sm:text-lg leading-relaxed">
            Premium custom gaming systems engineered for uncompromising performance,
            surgical cable management, and white-glove doorstep delivery across India.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link
              href="/ready-pcs"
              className="flex items-center gap-2 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700"
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

        {/* Right Side: PC Showcase */}
        <div className="relative flex items-center justify-center w-full max-w-md lg:max-w-lg">
          <div className="relative h-80 w-80 sm:h-96 sm:w-96">
            <Image
              src="/images/zen-pc.png"
              alt="Zen PCs Gaming Rig"
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
