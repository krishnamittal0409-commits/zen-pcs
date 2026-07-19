// components/InstallButton.tsx
//
// v2 — fixes a real timing bug from the first version, and adds honest
// handling for "already installed."
//
// THE BUG THIS FIXES:
// Chrome can fire "beforeinstallprompt" very early — sometimes before this
// React component has mounted and attached its listener. If that happens,
// the event fires into empty space and the button never learns install is
// available, even though Chrome's own ⋮ menu still shows "Install" (it
// tracks that separately). Fix: a tiny inline script in layout.tsx's <head>
// (see instructions below) captures the event immediately on page load and
// stores it on `window.__deferredInstallPrompt`, so this component can pick
// it up whenever it mounts — even "late."
//
// ON "ALREADY INSTALLED":
// There's no reliable, universal way for a website to force-launch an
// already-installed generic PWA from a normal browser tab — that level of
// control really only exists for apps published through Google Play as a
// Trusted Web Activity, which is a separate, bigger step than a plain PWA.
// So instead of a button that might silently fail, this shows an honest
// message directing the customer to their home screen icon.
//
// REQUIRED: add this inline script inside <head> in app/layout.tsx, as
// early as possible:
//
//   <script
//     dangerouslySetInnerHTML={{
//       __html: `
//         window.__deferredInstallPrompt = null;
//         window.addEventListener('beforeinstallprompt', function (e) {
//           e.preventDefault();
//           window.__deferredInstallPrompt = e;
//         });
//       `,
//     }}
//   />

"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __deferredInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

export default function InstallButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [checkedInstalled, setCheckedInstalled] = useState(false);

  useEffect(() => {
    // Pick up an event that may have already fired before this component
    // mounted (captured by the inline script in layout.tsx's <head>).
    if (window.__deferredInstallPrompt) {
      setInstallEvent(window.__deferredInstallPrompt);
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      window.__deferredInstallPrompt = e as BeforeInstallPromptEvent;
      setInstallEvent(e as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setInstallEvent(null);
      window.__deferredInstallPrompt = null;
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Best-effort check for "already installed" — supported on Chrome for
    // Android when the manifest has a matching "id". Not supported in
    // every browser; if it's unavailable, we simply fall back to showing
    // the normal install button when the event fires.
    async function checkInstalled() {
      const navWithCheck = navigator as Navigator & {
        getInstalledRelatedApps?: () => Promise<unknown[]>;
      };

      if (navWithCheck.getInstalledRelatedApps) {
        try {
          const relatedApps = await navWithCheck.getInstalledRelatedApps();
          if (relatedApps.length > 0) {
            setInstalled(true);
          }
        } catch {
          // Ignore — treat as "can't tell," which is the same as not installed.
        }
      }
      setCheckedInstalled(true);
    }

    checkInstalled();

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    setInstallEvent(null);
    window.__deferredInstallPrompt = null;

    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
  }

  if (!checkedInstalled) return null;

  if (installed) {
    return (
      <p className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-gray-400">
        App installed — open it from your home screen.
      </p>
    );
  }

  if (!installEvent) return null;

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
    >
      Install App
    </button>
  );
}