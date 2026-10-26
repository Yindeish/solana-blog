"use client";

import Link from "next/link";
import type { PostView } from "@/lib/idl";
import { shortAddress, timeAgo, readingTime } from "@/lib/format";
import { LikeButton } from "./LikeButton";

function excerpt(text: string, max = 220): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max).trimEnd() + "…" : clean;
}

export function PostCard({
  post,
  onLiked,
}: {
  post: PostView;
  onLiked?: () => void;
}) {
  return (
    <article className="card group flex flex-col p-6 transition hover:border-white/20 hover:bg-white/[0.06]">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500/20 text-[10px] font-bold text-brand-300">
            {post.author.slice(0, 2).toUpperCase()}
          </span>
          <span className="font-mono">{shortAddress(post.author)}</span>
        </span>
        <span>{timeAgo(post.createdAt)}</span>
      </div>

      <Link href={`/post/${post.id}`} className="group/link">
        <h2 className="mb-2 text-xl font-bold tracking-tight text-white group-hover/link:text-brand-300">
          {post.title}
        </h2>
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-400">
          {excerpt(post.content)}
        </p>
      </Link>

      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
        <span className="text-xs text-slate-500">{readingTime(post.content)}</span>
        <LikeButton postId={post.id} likes={post.likes} onLiked={onLiked} />
      </div>
    </article>
  );
}
