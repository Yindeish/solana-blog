import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";

const PROGRAM_ID_STR =
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
  "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";

export const PROGRAM_ID = new PublicKey(PROGRAM_ID_STR);

/** True when the user has provided a program id via env. */
export const isProgramConfigured = Boolean(process.env.NEXT_PUBLIC_PROGRAM_ID);

/** Config PDA: seeds = ["config"]. */
export function configPda(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    PROGRAM_ID
  )[0];
}

/** Post PDA: seeds = ["post", u64_le(id)]. */
export function postPda(id: number | bigint): PublicKey {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(BigInt(id));
  return PublicKey.findProgramAddressSync(
    [Buffer.from("post"), buf],
    PROGRAM_ID
  )[0];
}

/** Like PDA: seeds = ["like", post, user]. */
export function likePda(post: PublicKey, user: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("like"), post.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  )[0];
}
