const features = [
  {
    icon: "⚡",
    title: "High Performance",
    description:
      "Latest CPUs and GPUs optimized for gaming, streaming, and productivity.",
  },
  {
    icon: "🛠️",
    title: "Built & Tested",
    description:
      "Every system is assembled, benchmarked, and stress-tested before shipping.",
  },
  {
    icon: "🚚",
    title: "India-Wide Delivery",
    description:
      "Safe and secure shipping across India with tracking and support.",
  },
  {
    icon: "🎧",
    title: "Expert Support",
    description:
      "Guidance before purchase and technical support after delivery.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-12 text-center">
        <p className="mb-3 font-semibold uppercase tracking-[4px] text-red-500">
          Why Choose Zen PCs
        </p>

        <h2 className="text-4xl font-bold">
          Built For Gamers & Creators
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-red-500"
          >
            <div className="absolute left-0 top-0 h-1 w-full bg-red-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="mb-4 text-4xl">
              {feature.icon}
            </div>

            <h3 className="mb-3 text-xl font-semibold">
              {feature.title}
            </h3>

            <p className="text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}