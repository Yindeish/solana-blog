"use client";

import { Buffer } from "buffer";
import { useMemo, type ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

// Ensure Buffer exists globally for Anchor in the browser.
if (typeof window !== "undefined") {
  (window as any).Buffer = (window as any).Buffer || Buffer;
}

// The wallet-adapter packages ship their own React type references which can
// clash with the project's JSX runtime types. Casting to `any` keeps the
// runtime behaviour identical while avoiding a spurious type error.
const ConnProvider: any = ConnectionProvider;
const WalletProv: any = WalletProvider;
const WalletModalProv: any = WalletModalProvider;

export function Providers({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => {
    const cluster = (process.env.NEXT_PUBLIC_CLUSTER || "devnet") as
      | "devnet"
      | "mainnet-beta"
      | "testnet";
    return process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl(cluster);
  }, []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnProvider endpoint={endpoint}>
      <WalletProv wallets={wallets} autoConnect>
        <WalletModalProv>{children}</WalletModalProv>
      </WalletProv>
    </ConnProvider>
  );
}
