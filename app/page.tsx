// app/page.tsx
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import FeaturedPCs from "@/components/home/FeaturedPCs";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Wrench, Gauge, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />

      {/* Dual Feature Spotlight - Zero overlapping, clean natural flow */}
      <section className="bg-black px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Card 1: Bring Your Own Parts */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-7 transition hover:border-zinc-700">
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-red-600/10 p-2.5 text-red-500">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
                    Flat ₹5,000 Fee
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-white">
                  Bring Your Own Parts (BYOP)
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Already have parts? Send them to us or have our technician assemble them.
                  Includes thermal paste, cleanroom cable routing, and 48-hour burn-in testing.
                </p>
              </div>

              <div className="mt-6 border-t border-zinc-800/80 pt-4">
                <Link
                  href="/bring-your-parts"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400"
                >
                  <span>Build With My Parts</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: FPS Calculator */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-7 transition hover:border-zinc-700">
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-red-600/10 p-2.5 text-red-500">
                    <Gauge className="h-5 w-5" />
                  </div>
                  <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
                    Live Telemetry
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-white">
                  FPS Calculator
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Select your processor and graphics card to simulate realistic frame rates across
                  10 popular esports and AAA titles at 1080p, 1440p, and 4K resolutions.
                </p>
              </div>

              <div className="mt-6 border-t border-zinc-800/80 pt-4">
                <Link
                  href="/fps-calculator"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400"
                >
                  <span>Check Game Performance</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ready PCs from Database */}
      <FeaturedPCs />

      {/* Engineering Values & Features */}
      <Features />

      <Footer />
    </main>
  );
}
