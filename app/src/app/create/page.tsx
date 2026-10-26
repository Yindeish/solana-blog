"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram } from "@solana/web3.js";
import { useBlogProgram, getReadOnlyProgram } from "@/lib/program";
import { configPda, postPda, isProgramConfigured } from "@/lib/pda";
import { ConfigBanner } from "@/components/ConfigBanner";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const MAX_TITLE = 200;
const MAX_CONTENT = 20000;

export default function CreatePostPage() {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const program = useBlogProgram();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!title.trim()) return fail("Please add a title.");
    if (!content.trim()) return fail("Please add some content.");
    if (new TextEncoder().encode(title).length > MAX_TITLE)
      return fail(`Title is too long (max ${MAX_TITLE} bytes).`);
    if (new TextEncoder().encode(content).length > MAX_CONTENT)
      return fail(`Content is too long (max ${MAX_CONTENT} bytes).`);
    setFormError(null);
    return true;
  };

  function fail(msg: string): boolean {
    setFormError(msg);
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!program || !publicKey) return;
    if (!validate()) return;

    try {
      setBusy(true);
      setFormError(null);

      // Read the current post count to derive the new post's PDA.
      const ro = getReadOnlyProgram(connection);
      const config = await (ro.account as any).config.fetch(configPda());
      const id = Number(config.postCount.toString());
      const post = postPda(id);

      await (program.methods as any)
        .createPost(title.trim(), content.trim())
        .accounts({
          config: configPda(),
          post,
          author: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      router.push(`/post/${id}`);
    } catch (e: any) {
      setFormError(e?.message || "Transaction failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ConfigBanner />

      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-white">
          Write a post
        </h1>
        <p className="mt-2 text-slate-400">
          Your words are stored permanently on Solana. Publishing requires a
          wallet signature and a tiny fee.
        </p>
      </div>

      {!isProgramConfigured ? (
        <div className="card p-6 text-slate-300">
          Configure the program id first (see the banner above).
        </div>
      ) : !connected ? (
        <div className="card flex flex-col items-center gap-4 p-10 text-center">
          <p className="text-slate-300">Connect your wallet to start writing.</p>
          <WalletMultiButton />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-5 p-6">
          <div>
            <label htmlFor="title" className="label">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A catchy headline…"
              maxLength={MAX_TITLE}
              className="input"
              disabled={busy}
            />
            <div className="mt-1 text-right text-xs text-slate-500">
              {title.length}/{MAX_TITLE}
            </div>
          </div>

          <div>
            <label htmlFor="content" className="label">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell your story…"
              rows={12}
              maxLength={MAX_CONTENT}
              className="input resize-y"
              disabled={busy}
            />
            <div className="mt-1 text-right text-xs text-slate-500">
              {content.length}/{MAX_CONTENT}
            </div>
          </div>

          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="btn-ghost"
              disabled={busy}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Publishing…" : "Publish on-chain"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
