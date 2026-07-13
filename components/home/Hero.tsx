"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-start justify-between overflow-hidden px-6 pb-16 pt-28 lg:min-h-[85vh] lg:flex-row lg:items-center lg:px-8 lg:pb-0 lg:pt-0">
      {/* Left Side */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl"
      >
        <p className="mb-4 font-semibold uppercase tracking-[6px] text-red-500">
          Welcome to Zen PCs
        </p>

        <h1 className="text-7xl font-black leading-tight">
          BUILD YOUR
          <br />
          <span className="text-red-500">DREAM PC</span>
        </h1>

        <p className="mt-8 text-lg text-gray-400">
          Premium Gaming PCs built for gamers, creators, and professionals.
          Customize every component or choose from our ready-to-ship systems.
        </p>

        <div className="mt-10 flex gap-5">
          <Link href="/ready-pcs">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg bg-red-600 px-8 py-4 font-semibold transition hover:bg-red-700"
            >
              Shop Ready PCs
            </motion.button>
          </Link>

          <Link href="/pc-builder">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg border border-red-600 px-8 py-4 font-semibold transition hover:bg-red-600"
            >
              Build Your Own
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Right Side - PC Showcase */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative hidden items-center justify-center lg:flex"
      >
        {/* Red Glow */}
        <div className="absolute h-[450px] w-[450px] rounded-full bg-red-600/20 blur-3xl" />

        <motion.div
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          <Image
            src="/images/zen-pc.png"
            alt="Zen PCs Gaming Computer"
            width={650}
            height={650}
            className="object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
