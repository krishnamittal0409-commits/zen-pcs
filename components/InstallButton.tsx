// components/InstallButton.tsx
//
// A visible "Install App" button, instead of relying on customers finding
// Chrome's hidden ⋮ menu → "Add to Home screen."
//
// HOW IT WORKS:
// Chrome on Android fires a "beforeinstallprompt" event when it decides the
// site is installable (manifest + service worker both need to be set up
// correctly — which they now are). This component listens for that event,
// and ONLY shows itself once that event has actually fired. If the app is
// already installed, or the browser doesn't support installing (e.g.
// desktop Safari), this button simply never appears — that's expected,
// not a bug.
//
// USAGE: import this into your Navbar and render it, e.g.:
//
//   import InstallButton from "@/components/InstallButton";
//   ...
//   <InstallButton />
//
// It renders nothing until install becomes available, so it's safe to
// place anywhere in the navbar without affecting layout when hidden.

"use client";

import { useEffect, useState } from "react";

// TypeScript doesn't know about this event by default, so we describe
// the bits we actually use.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      // Stop Chrome's default mini-banner so we control the UI instead.
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstallClick() {
    if (!installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    // Whether they accept or dismiss, this specific prompt can't be reused
    // — clear it either way. If dismissed, the button just won't show
    // again until the browser decides to offer it another time.
    setInstallEvent(null);

    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
  }

  // Nothing to show: not installable right now, or already installed.
  if (!installEvent || installed) return null;

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
