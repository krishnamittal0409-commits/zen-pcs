// components/layout/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Truck, CreditCard, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black text-zinc-400">
      {/* Top Value Strip */}
      <div className="border-b border-zinc-900 py-6">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-red-500 shrink-0" />
              <span className="font-medium text-zinc-300">3-Year On-Site Warranty</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 text-red-500 shrink-0" />
              <span className="font-medium text-zinc-300">White-Glove Pan-India Delivery</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CreditCard className="h-4 w-4 text-red-500 shrink-0" />
              <span className="font-medium text-zinc-300">Credit / Debit Card & NetBanking</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Lock className="h-4 w-4 text-red-500 shrink-0" />
              <span className="font-medium text-zinc-300">256-Bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-red-500/40 bg-zinc-950 p-0.5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <Image
                  src="/images/logo/zen-emblem.png"
                  alt="Zen PCs Emblem"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover rounded-lg"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-black tracking-wider text-white">
                  ZEN <span className="text-red-500">PCs</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[1.8px] text-zinc-400">
                  Performance Lab
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Custom high-performance personal computers, built and benchmarked for gaming,
              streaming, and professional workloads.
            </p>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Platforms
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/ready-pcs" className="hover:text-white transition">
                  Ready-To-Ship PCs
                </Link>
              </li>
              <li>
                <Link href="/pc-builder" className="hover:text-white transition">
                  Custom PC Builder
                </Link>
              </li>
              <li>
                <Link href="/bring-your-parts" className="hover:text-white transition">
                  Bring Your Own Parts (BYOP)
                </Link>
              </li>
              <li>
                <Link href="/fps-calculator" className="hover:text-white transition">
                  FPS Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/account" className="hover:text-white transition">
                  Account Dashboard
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition">
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition">
                  Warranty & RMA
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Payment Methods
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              We accept Credit Cards, Debit Cards (Visa, MasterCard, RuPay), and Net Banking across all major banks.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-zinc-300">Visa</span>
              <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-zinc-300">MasterCard</span>
              <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-zinc-300">RuPay</span>
              <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-zinc-300">Net Banking</span>
              <span className="rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-zinc-300">Doorstep POS</span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} Zen PCs. All rights reserved.</p>
          <p>BCA Minor Project Implementation</p>
        </div>
      </div>
    </footer>
  );
}
