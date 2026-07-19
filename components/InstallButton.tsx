// components/InstallButton.tsx
//
// v3 — adds iOS support.
//
// IMPORTANT PLATFORM LIMIT (not fixable from code):
// iOS Safari has NO install API at all — no "beforeinstallprompt" event,
// nothing a website can trigger. Apple only allows installing via manual
// Share → "Add to Home Screen." So on iOS, this component can't show a
// real install button — it detects iOS and shows instructions instead.
// This is an Apple platform restriction, not a bug or something any code
// can work around.
//
// REQUIRED: add this inline script inside <head> in app/layout.tsx, as
// early as possible (unchanged from before):
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
  interface Navigator {
    // Older, non-standard iOS Safari property indicating the site is
    // already running as an installed home-screen app.
    standalone?: boolean;
  }
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone === true
  );
}

export default function InstallButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [checkedInstalled, setCheckedInstalled] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const onIOS = isIOS();
    setIos(onIOS);

    // Already running installed (either platform) — nothing to offer.
    if (isInStandaloneMode()) {
      setInstalled(true);
      setCheckedInstalled(true);
      return;
    }

    if (onIOS) {
      // No install event exists on iOS — we're done checking, the
      // "Install" affordance here is just the instructions button.
      setCheckedInstalled(true);
      return;
    }

    // ----- Android / Chrome path (unchanged from before) -----
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
          // Ignore — treat as "can't tell."
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

  // ----- iOS: no real install button can exist, so show instructions -----
  if (ios) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowIosInstructions((v) => !v)}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Install App
        </button>

        {showIosInstructions && (
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-sm text-gray-200 shadow-xl">
            <p className="mb-2 font-semibold">To install on iPhone/iPad:</p>
            <ol className="list-decimal space-y-1 pl-4 text-gray-400">
              <li>
                Tap the <span className="text-white">Share</span> icon in
                Safari&apos;s toolbar
              </li>
              <li>
                Scroll down and tap{" "}
                <span className="text-white">&quot;Add to Home Screen&quot;</span>
              </li>
              <li>
                Tap <span className="text-white">&quot;Add&quot;</span> in the
                top corner
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIosInstructions(false)}
              className="mt-3 text-xs text-gray-500 hover:text-white"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    );
  }

  // ----- Android / Chrome: real programmatic install button -----
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