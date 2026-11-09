// components/home/Features.tsx
import { Cpu, ShieldCheck, Truck, Headphones } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "High Performance",
    description:
      "Latest CPUs and GPUs optimized for competitive gaming, streaming, and content creation.",
  },
  {
    icon: ShieldCheck,
    title: "Built & Stress-Tested",
    description:
      "Every system undergoes rigorous thermal burn-in benchmarks before packing.",
  },
  {
    icon: Truck,
    title: "India-Wide Delivery",
    description:
      "Secure, insured shipping across India with real-time tracking and white-glove setup.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description:
      "Hardware consultation before purchase and priority technician assistance after delivery.",
  },
];

export default function Features() {
  return (
    <section className="border-t border-zinc-900 bg-black px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[4px] text-red-500">
            Why Choose Zen PCs
          </p>
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Built For Gamers & Creators
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-zinc-700"
              >
                <div className="mb-4 inline-flex rounded-xl bg-red-600/10 p-3 text-red-500">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-bold text-white">
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
