// components/RegisterSW.tsx
//
// Registers the service worker (public/sw.js) — but ONLY in production.
//
// WHY NOT IN DEVELOPMENT:
// Next.js's local dev server has its own hot-reload system (Fast Refresh /
// Turbopack's live updates). A service worker's caching can conflict with
// that and cause an infinite reload loop — the page keeps refreshing
// itself with no action from you. This is a well-known interaction
// between service workers and dev servers, not a bug in your app. Since
// the service worker's whole purpose (PWA installability) only matters on
// the real deployed site anyway, it's simplest and safest to just skip it
// entirely during local development.

"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // In dev, actively unregister any old service worker that might
      // already be controlling this page from an earlier registration —
      // this clears up the reload loop if it already started.
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
      }
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    }
  }, []);

  return null;
}