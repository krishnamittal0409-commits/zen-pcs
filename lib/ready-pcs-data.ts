// lib/ready-pcs-data.ts
//
// Single source of truth for the 3 Ready PCs. Used by the homepage
// (FeaturedPCs), the Ready PCs page, and Search — so updating a price,
// spec, or image here updates it everywhere automatically.

export interface ReadyPC {
  name: string;
  price: number;
  badge: string;
  image: string;
  specs: string[];
}

export const readyPCs: ReadyPC[] = [
  {
    name: "Zen Starter",
    price: 74999,
    badge: "Best Value",
    image: "/images/pcs/zen-starter.png",
    specs: ["Ryzen 5 7600", "RTX 4060", "16GB DDR5", "1TB Gen 4 NVMe SSD"],
  },
  {
    name: "Zen Pro",
    price: 124999,
    badge: "Best Seller",
    image: "/images/pcs/zen-pro.png",
    specs: ["Ryzen 7 7800X3D", "RTX 4070 Super", "32GB DDR5", "2TB Gen 4 NVMe SSD"],
  },
  {
    name: "Zen Ultra",
    price: 949999,
    badge: "Flagship",
    image: "/images/pcs/zen-ultra.png",
    specs: ["Ryzen 9 9950X3D2", "RTX 5090", "64GB DDR5", "4TB Gen 5 NVMe SSD"],
  },
];