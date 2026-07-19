import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RegisterSW from "@/components/RegisterSW";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zen PCs",
  description: "Build your dream PC, bring your own parts, and get expert support — all in one place.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    // iOS ignores manifest.json for most of this — these tags are the
    // actual source of truth for how the app behaves once added to the
    // home screen on iPhone/iPad.
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zen PCs",
  },
};

// Controls the browser/OS chrome color when installed as a PWA.
export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Captures the install prompt event as early as possible — even
            before React mounts — so InstallButton.tsx can pick it up
            whenever it renders, instead of missing an event that fired
            too early. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__deferredInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', function (e) {
                e.preventDefault();
                window.__deferredInstallPrompt = e;
              });
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <RegisterSW />
        </AuthProvider>
      </body>
    </html>
  );
}