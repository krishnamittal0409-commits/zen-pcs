// components/RegisterSW.tsx
//
// Registers the service worker (public/sw.js) once the page loads.
// This has to be a small client component since layout.tsx itself is
// likely a server component, and registering a service worker requires
// the browser (`navigator`), which only exists client-side.
//
// USAGE: import this into app/layout.tsx and render it once, anywhere
// inside <body> — it renders nothing visible, just runs the effect.

"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    }
  }, []);

  return null;
}
