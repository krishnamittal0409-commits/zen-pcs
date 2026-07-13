// components/home/FeaturedPCs.tsx
import Link from "next/link";
import Image from "next/image";

const featuredPCs = [
  {
    name: "Zen Starter",
    price: "₹74,999",
    image: "/images/pcs/zen-starter.png",
    specs: [
      "Ryzen 5 7600",
      "RTX 4060",
      "16GB DDR5",
      "1TB Gen 4 NVMe SSD",
    ],
  },
  {
    name: "Zen Pro",
    price: "₹1,24,999",
    image: "/images/pcs/zen-pro.png",
    specs: [
      "Ryzen 7 7800X3D",
      "RTX 4070 Super",
      "32GB DDR5",
      "2TB Gen 4 NVMe SSD",
    ],
  },
  {
    name: "Zen Ultra",
    price: "₹9,49,999",
    image: "/images/pcs/zen-ultra.png",
    specs: [
      "Ryzen 9 9950X3D2",
      "RTX 5090",
      "64GB DDR5",
      "4TB Gen 5 NVMe SSD",
    ],
  },
];

export default function FeaturedPCs() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-12 text-center">
        <p className="mb-3 font-semibold uppercase tracking-[4px] text-red-500">
          Featured Systems
        </p>

        <h2 className="text-4xl font-bold">
          Ready To Ship Gaming PCs
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {featuredPCs.map((pc) => (
          <div
            key={pc.name}
            className="group overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:-translate-y-2 hover:border-red-500"
          >
            <div className="relative flex h-64 items-center justify-center border-b border-zinc-800 bg-black">
              <Image
                src={pc.image}
                alt={pc.name}
                fill
                className="object-contain p-6"
              />
            </div>

            <div className="p-6">
              <h3 className="mb-2 text-2xl font-bold">
                {pc.name}
              </h3>

              <p className="mb-6 text-3xl font-black text-red-500">
                {pc.price}
              </p>

              <ul className="mb-6 space-y-2 text-gray-300">
                {pc.specs.map((spec) => (
                  <li key={spec}>✓ {spec}</li>
                ))}
              </ul>

              <Link
                href="/ready-pcs"
                className="block w-full rounded-xl bg-red-600 py-3 text-center font-semibold transition hover:bg-red-700"
              >
                View Build
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}