"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import {
  getReadOnlyProgram,
  useBlogProgram,
  toPostView,
} from "@/lib/program";
import { configPda, postPda, isProgramConfigured } from "@/lib/pda";
import type { PostView } from "@/lib/idl";
import { PostCard } from "@/components/PostCard";
import { ConfigBanner } from "@/components/ConfigBanner";
import { EmptyState } from "@/components/EmptyState";

export default function HomePage() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const program = useBlogProgram();

  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsInit, setNeedsInit] = useState(false);
  const [initBusy, setInitBusy] = useState(false);

  const load = useCallback(async () => {
    if (!isProgramConfigured) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const ro = getReadOnlyProgram(connection);
      const config = await (ro.account as any).config
        .fetchNullable(configPda())
        .catch(() => null);

      if (!config) {
        setNeedsInit(true);
        setPosts([]);
        return;
      }
      setNeedsInit(false);

      const count = Number(config.postCount.toString());
      const pdas = Array.from({ length: count }, (_, i) => postPda(i));
      const accounts = await Promise.all(
        pdas.map((p) =>
          (ro.account as any).post.fetchNullable(p).catch(() => null)
        )
      );
      const list = accounts.filter(Boolean).map(toPostView);
      list.sort((a: PostView, b: PostView) => b.createdAt - a.createdAt);
      setPosts(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInit() {
    if (!program || !publicKey) return;
    try {
      setInitBusy(true);
      setError(null);
      await (program.methods as any)
        .initialize()
        .accounts({
          config: configPda(),
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await load();
    } catch (e: any) {
      setError(e?.message || "Initialize failed");
    } finally {
      setInitBusy(false);
    }
  }

  return (
    <div>
      <ConfigBanner />

      <section className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            The Onchain Feed
          </h1>
          <p className="mt-2 max-w-xl text-slate-400">
            Every post lives on Solana. Read freely, connect a wallet to publish
            and like.
          </p>
        </div>
        <Link href="/create" className="btn-primary shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Write a post
        </Link>
      </section>

      {!isProgramConfigured ? (
        <EmptyState
          title="Almost there"
          description="Deploy the Anchor program and add its id to your .env.local to start reading posts."
        />
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card h-48 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="card p-6 text-center text-red-300">
          {error}. Check your RPC / cluster settings.
        </div>
      ) : needsInit ? (
        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <h3 className="text-lg font-semibold text-white">
            Initialize the blog
          </h3>
          <p className="max-w-md text-sm text-slate-400">
            The program is deployed but its config account hasn&apos;t been
            created yet. Connect a wallet and initialize it once (a small
            transaction).
          </p>
          {publicKey ? (
            <button
              onClick={handleInit}
              disabled={initBusy}
              className="btn-primary"
            >
              {initBusy ? "Initializing…" : "Initialize blog"}
            </button>
          ) : (
            <p className="text-sm text-amber-300">
              Connect a wallet above to initialize.
            </p>
          )}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Be the first to write something on-chain. Connect your wallet and publish the first post."
          actionHref="/create"
          actionLabel="Write the first post"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onLiked={load} />
          ))}
        </div>
      )}
    </div>
  );
}
