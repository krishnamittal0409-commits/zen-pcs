// components/layout/Footer.tsx
"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Cpu,
  Truck,
  CreditCard,
  Building2,
  Lock,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-400">
      {/* Top Value Strip */}
      <div className="border-b border-zinc-800/60 bg-black/40 py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-red-500/20 bg-red-600/10 p-2.5 text-red-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">3-Year On-Site Warranty</h4>
                <p className="text-[11px] text-zinc-500">Free parts replacement & technician visits</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-red-500/20 bg-red-600/10 p-2.5 text-red-500">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Pan-India Wooden Crating</h4>
                <p className="text-[11px] text-zinc-500">Damage-free transit guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-red-500/20 bg-red-600/10 p-2.5 text-red-500">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Cards & Bank Transfer</h4>
                <p className="text-[11px] text-zinc-500">Visa, MasterCard, RuPay & 50+ Banks</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-red-500/20 bg-red-600/10 p-2.5 text-red-500">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">256-Bit Encrypted</h4>
                <p className="text-[11px] text-zinc-500">PCI-DSS Level 1 Gateway</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-lg font-black text-white shadow-lg shadow-red-900/40">
                Z
              </div>
              <span className="text-2xl font-black tracking-wide text-white">
                Zen PCs
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-zinc-400 max-w-sm">
              India&apos;s premier boutique custom PC building atelier. We craft custom gaming rigs,
              high-compute workstations, and provide Bring-Your-Own-Parts (BYOP) white-glove assembly
              with live benchmarks and doorstep installation.
            </p>

            <div className="pt-2 text-xs text-zinc-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span>Tech Hub Facility, Sonipat / Delhi NCR, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span>support@zenpcs.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <span>Priority Helpline: +91 98120 XXXXX</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Hardware Platforms
            </h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/ready-pcs" className="hover:text-red-400 transition">
                  Ready-To-Ship PCs
                </Link>
              </li>
              <li>
                <Link href="/pc-builder" className="hover:text-red-400 transition">
                  Custom PC Builder
                </Link>
              </li>
              <li>
                <Link href="/bring-your-parts" className="hover:text-red-400 transition">
                  Bring Your Own Parts (BYOP)
                </Link>
              </li>
              <li>
                <Link href="/fps-calculator" className="hover:text-red-400 transition">
                  Precision FPS Calculator
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-red-400 transition">
                  Component Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer & Orders */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Support
            </h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/account" className="hover:text-red-400 transition">
                  Account Dashboard
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-red-400 transition">
                  Track Orders & Build Status
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-red-400 transition">
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-red-400 transition">
                  Warranty & RMA Policy
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-red-400 transition">
                  Doorstep Setup Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods Accepted */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Secure Payments
            </h4>
            <p className="mt-4 text-xs text-zinc-400">
              We process secure payments via Razorpay Test API & Certified Doorstep POS terminals:
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-300">
              <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-semibold">
                Visa Card
              </span>
              <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-semibold">
                MasterCard
              </span>
              <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-semibold">
                RuPay
              </span>
              <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-semibold">
                Net Banking (50+ Banks)
              </span>
              <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-semibold">
                Direct Bank Transfer
              </span>
              <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 font-semibold">
                Doorstep POS Swipe
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 border-t border-zinc-800/80 pt-6 flex flex-col items-center justify-between gap-4 text-xs text-zinc-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Zen PCs Inc. Handcrafted in India. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>BCA Minor Project Implementation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
