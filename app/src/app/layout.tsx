import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Onchain Blog · Solana",
  description:
    "A simple, fully on-chain blog on Solana. Publish and like posts with your wallet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
              {children}
            </main>
            <footer className="border-t border-white/10 py-6 text-center text-sm text-slate-500">
              Built on Solana · Posts stored fully on-chain
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
