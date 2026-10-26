import { useMemo } from "react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { IDL, type PostView } from "./idl";
import { PROGRAM_ID } from "./pda";

/** A read-only Anchor program that works without a connected wallet. */
export function getReadOnlyProgram(connection: Connection): Program {
  const dummy = {
    publicKey: Keypair.generate().publicKey,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any) => txs,
  };
  const provider = new AnchorProvider(connection, dummy as any, {
    commitment: "confirmed",
  });
  return new Program(IDL, provider);
}

/** Hook: a signer-enabled program bound to the connected wallet (or null). */
export function useBlogProgram(): Program | null {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });
    return new Program(IDL, provider);
  }, [connection, wallet]);
}

/** Normalize a raw Anchor account into a plain PostView. */
export function toPostView(a: any): PostView {
  return {
    id: Number(a.id.toString()),
    author: a.author.toBase58(),
    createdAt: Number(a.createdAt.toString()),
    likes: Number(a.likes.toString()),
    title: a.title,
    content: a.content,
  };
}

export { PROGRAM_ID };
