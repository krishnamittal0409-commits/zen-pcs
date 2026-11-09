// components/home/Hero.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Gauge,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden cyber-grid bg-gradient-to-b from-black via-zinc-950 to-black px-6 pt-12 pb-20 lg:min-h-[92vh] lg:flex lg:items-center lg:py-0">
      {/* Ambient Radial Spotlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full bg-red-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 h-[350px] w-[350px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 lg:flex-row lg:items-center">
        {/* Left Side: Typography & Conversion Deck */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl text-center lg:text-left"
        >
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-red-400 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Next-Gen RTX 5090 & 9800X3D Architecture Ready
          </div>

          {/* Master Headline */}
          <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]">
            ENGINEER YOUR <br />
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
              DREAM BATTLESTATION
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-300 leading-relaxed">
            Ultra-performance custom gaming computers, handcrafted with surgical cable management,
            48-hour thermal stress-testing, and white-glove doorstep delivery across India.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Link href="/ready-pcs">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group relative flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
              >
                <span>Shop Ready PCs</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>

            <Link href="/pc-builder">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 px-8 py-4 text-sm font-bold text-zinc-100 backdrop-blur transition hover:border-red-500 hover:text-white"
              >
                <Layers className="h-4 w-4 text-red-500" />
                <span>Custom Builder</span>
              </motion.button>
            </Link>

            <Link href="/fps-calculator">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl border border-red-900/50 bg-red-950/20 px-5 py-4 text-sm font-bold text-red-300 transition hover:border-red-500 hover:text-white"
              >
                <Gauge className="h-4 w-4 text-red-500" />
                <span>FPS Calculator</span>
              </motion.button>
            </Link>
          </div>

          {/* Hardware Trust Telemetry Strip */}
          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-zinc-800/80 pt-6">
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-white">48h</span>
              <span className="text-xs text-zinc-400">Thermal Stress Test</span>
            </div>
            <div className="flex flex-col border-l border-zinc-800/80 pl-4">
              <span className="text-xl sm:text-2xl font-black text-white">3-Year</span>
              <span className="text-xs text-zinc-400">On-Site Warranty</span>
            </div>
            <div className="flex flex-col border-l border-zinc-800/80 pl-4">
              <span className="text-xl sm:text-2xl font-black text-white">0% Fee</span>
              <span className="text-xs text-zinc-400">Card & Bank Checkout</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: 3D Hardware Display Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center w-full max-w-lg lg:max-w-xl"
        >
          {/* Glowing Aura Rings */}
          <div className="absolute h-[380px] w-[380px] rounded-full bg-red-600/20 blur-3xl animate-neon-pulse" />
          <div className="absolute -bottom-8 h-20 w-80 rounded-full bg-red-500/30 blur-2xl" />

          {/* Pedestal Reflection Plate */}
          <div className="absolute -bottom-10 h-10 w-96 rounded-full bg-gradient-to-r from-transparent via-red-600/30 to-transparent blur-md" />

          {/* Floating Hardware Rig with Fluid Hover Motion */}
          <motion.div
            animate={{
              y: [0, -14, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative z-10"
          >
            <div className="relative">
              <Image
                src="/images/zen-pc.png"
                alt="Zen PCs Gaming Computer"
                width={650}
                height={650}
                className="object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] filter contrast-105"
                priority
              />

              {/* Floating Hardware Spec Badges */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute top-10 right-0 sm:-right-4 rounded-xl border border-zinc-700/80 bg-zinc-900/90 p-3 shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-red-600/20 p-1.5 text-red-500">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white">RTX 50-Series Ready</div>
                    <div className="text-[10px] text-zinc-400">Up to 32GB GDDR7 VRAM</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-16 left-0 sm:-left-4 rounded-xl border border-zinc-700/80 bg-zinc-900/90 p-3 shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-600/20 p-1.5 text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white">White-Glove Setup</div>
                    <div className="text-[10px] text-zinc-400">Doorstep Benchmarking</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
