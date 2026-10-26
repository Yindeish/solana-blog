"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import { useBlogProgram } from "@/lib/program";
import { postPda, likePda } from "@/lib/pda";

export function LikeButton({
  postId,
  likes,
  onLiked,
}: {
  postId: number;
  likes: number;
  onLiked?: () => void;
}) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const program = useBlogProgram();

  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!publicKey) {
        if (!cancelled) setLiked(false);
        return;
      }
      try {
        const post = postPda(postId);
        const like = likePda(post, publicKey);
        const info = await connection.getAccountInfo(like);
        if (!cancelled) setLiked(!!info);
      } catch {
        if (!cancelled) setLiked(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [connection, publicKey, postId, likes]);

  async function handleLike() {
    if (!program || !publicKey || liked || busy) return;
    try {
      setBusy(true);
      setError(null);
      const post = postPda(postId);
      const like = likePda(post, publicKey);
      await (program.methods as any)
        .likePost()
        .accounts({
          post,
          like,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      setLiked(true);
      onLiked?.();
    } catch (e: any) {
      setError(e?.message || "Transaction failed");
    } finally {
      setBusy(false);
    }
  }

  const disabled = !connected || !program || liked || busy;

  return (
    <button
      onClick={handleLike}
      disabled={disabled}
      title={
        !connected
          ? "Connect your wallet to like"
          : liked
          ? "You already liked this post"
          : "Like this post"
      }
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
        liked
          ? "text-brand-300"
          : "text-slate-400 hover:bg-white/5 hover:text-brand-300"
      } disabled:cursor-not-allowed`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{likes}</span>
      {busy && <span className="text-xs text-slate-500">…</span>}
      {error && <span className="text-xs text-red-400">failed</span>}
    </button>
  );
}
