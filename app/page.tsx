// app/page.tsx
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import FeaturedPCs from "@/components/home/FeaturedPCs";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import {
  Wrench,
  Gauge,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Tv,
  Cpu,
  Layers,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <Navbar />
      <Hero />

      {/* Dual Interactive Feature Spotlight: BYOP & FPS Calculator */}
      <section className="relative z-10 -mt-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card 1: Bring Your Own Parts */}
          <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black p-8 shadow-2xl transition-all duration-300 hover:border-red-500/80 hover:-translate-y-1">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-600/10 text-red-500">
                <Wrench className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
                Flat ₹5,000 Assembly Fee
              </span>
            </div>

            <h3 className="mt-6 text-2xl font-black text-white group-hover:text-red-400 transition-colors">
              Bring Your Own Parts (BYOP)
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Already purchased your GPU, CPU, or motherboard? Ship them to our lab or request our
              technician. We perform precision cable routing, custom liquid loop testing, and thermal
              burn-in for a flat fee.
            </p>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-5">
              <span className="text-xs font-semibold text-zinc-400">
                ✓ Free compatibility check & thermal paste included
              </span>
              <Link
                href="/bring-your-parts"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400"
              >
                <span>Book Assembly</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Precision FPS Calculator */}
          <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-black p-8 shadow-2xl transition-all duration-300 hover:border-red-500/80 hover:-translate-y-1">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
                <Gauge className="h-6 w-6" />
              </div>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                Real Engine Telemetry
              </span>
            </div>

            <h3 className="mt-6 text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
              AI Precision FPS Simulator
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Simulate actual frame rates across 10 top esports and AAA titles. Accurate benchmarks
              for RTX 5090, 5080, and Ryzen 9800X3D with real 1080p competitive, 1440p high-refresh,
              and 4K Ray Tracing numbers.
            </p>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-5">
              <span className="text-xs font-semibold text-zinc-400">
                ✓ 1% low frame time latency analysis included
              </span>
              <Link
                href="/fps-calculator"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300"
              >
                <span>Calculate My FPS</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ready PCs Section */}
      <FeaturedPCs />

      {/* Engineering Standards & Features */}
      <Features />

      {/* Trust & Guarantee Banner */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-red-900/40 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-1/4 h-72 w-72 rounded-full bg-red-600/15 blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-red-600/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-red-400">
                <Sparkles className="h-3.5 w-3.5" />
                Zero Compromise Standard
              </span>
              <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">
                Ready to experience the ultimate gaming performance?
              </h2>
              <p className="mt-3 text-sm text-zinc-400">
                Select your components or let our certified master builders assemble your dream PC.
                Enjoy doorstep white-glove setup and 3 years of worry-free gaming.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/ready-pcs"
                className="rounded-xl bg-red-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
              >
                Shop Ready PCs
              </Link>
              <Link
                href="/pc-builder"
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-7 py-3.5 text-sm font-bold text-zinc-200 transition hover:border-red-500 hover:text-white"
              >
                Launch Builder
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
