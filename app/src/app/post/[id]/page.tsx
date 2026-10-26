"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { getReadOnlyProgram, toPostView } from "@/lib/program";
import { postPda, isProgramConfigured } from "@/lib/pda";
import type { PostView } from "@/lib/idl";
import { shortAddress, formatDate, readingTime } from "@/lib/format";
import { LikeButton } from "@/components/LikeButton";
import { ConfigBanner } from "@/components/ConfigBanner";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const { connection } = useConnection();
  const id = params?.id;

  const [post, setPost] = useState<PostView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isProgramConfigured || id === undefined) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const ro = getReadOnlyProgram(connection);
      const account = await (ro.account as any).post
        .fetchNullable(postPda(Number(id)))
        .catch(() => null);
      setPost(account ? toPostView(account) : null);
    } catch (e: any) {
      setError(e?.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [connection, id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl">
      <ConfigBanner />

      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to feed
      </Link>

      {loading ? (
        <div className="space-y-4">
          <div className="h-10 w-2/3 animate-pulse rounded-lg bg-white/10" />
          <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
        </div>
      ) : error ? (
        <div className="card p-6 text-center text-red-300">{error}</div>
      ) : !post ? (
        <div className="card p-10 text-center">
          <h2 className="mb-2 text-xl font-bold text-white">Post not found</h2>
          <p className="mb-5 text-slate-400">
            This post doesn&apos;t exist or hasn&apos;t been confirmed yet.
          </p>
          <Link href="/" className="btn-primary">
            Back to feed
          </Link>
        </div>
      ) : (
        <article className="card p-7 sm:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500/20 text-[11px] font-bold text-brand-300">
                {post.author.slice(0, 2).toUpperCase()}
              </span>
              <span className="font-mono text-slate-400">
                {shortAddress(post.author, 6)}
              </span>
            </span>
            <span>·</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>·</span>
            <span>{readingTime(post.content)}</span>
          </div>

          <h1 className="mb-6 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
            {post.title}
          </h1>

          <div className="max-w-none whitespace-pre-wrap break-words text-[15px] leading-relaxed text-slate-300">
            {post.content}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
            <span className="text-sm text-slate-500">Post #{post.id}</span>
            <LikeButton postId={post.id} likes={post.likes} onLiked={load} />
          </div>
        </article>
      )}
    </div>
  );
}
