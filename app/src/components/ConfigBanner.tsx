"use client";

import { isProgramConfigured } from "@/lib/pda";

export function ConfigBanner() {
  if (isProgramConfigured) return null;
  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <strong className="font-semibold">Program not configured.</strong> Set{" "}
      <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">
        NEXT_PUBLIC_PROGRAM_ID
      </code>{" "}
      in <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">.env.local</code>{" "}
      after deploying the program. See the README for steps.
    </div>
  );
}
