import test from "node:test";
import assert from "node:assert/strict";
import { PublicKey } from "@solana/web3.js";
import { configPda, postPda, likePda, PROGRAM_ID } from "../src/lib/pda";

test("Feature Test: PDA Derivations and Consistency", async (t) => {
  await t.test("configPda derives deterministically with seed ['config']", () => {
    const pda1 = configPda();
    const pda2 = configPda();

    assert.ok(pda1 instanceof PublicKey);
    assert.equal(pda1.toBase58(), pda2.toBase58());

    // Verify against manual derivation
    const [expectedPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      PROGRAM_ID
    );
    assert.equal(pda1.toBase58(), expectedPda.toBase58());
  });

  await t.test("postPda derives unique addresses for different post IDs", () => {
    const post0 = postPda(0);
    const post1 = postPda(1);
    const post100 = postPda(100);

    // Each post must have a unique address
    assert.notEqual(post0.toBase58(), post1.toBase58());
    assert.notEqual(post1.toBase58(), post100.toBase58());

    // Verify 8-byte little endian encoding matches Anchor program expectation
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(0n);
    const [expectedPda0] = PublicKey.findProgramAddressSync(
      [Buffer.from("post"), buf],
      PROGRAM_ID
    );
    assert.equal(post0.toBase58(), expectedPda0.toBase58());
  });

  await t.test("likePda derives unique addresses for different user/post combinations", () => {
    const postA = postPda(0);
    const postB = postPda(1);
    const user1 = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
    const user2 = new PublicKey("11111111111111111111111111111111");

    const likeA1 = likePda(postA, user1);
    const likeA2 = likePda(postA, user2);
    const likeB1 = likePda(postB, user1);

    // Same post + different user => different PDA
    assert.notEqual(likeA1.toBase58(), likeA2.toBase58());

    // Different post + same user => different PDA
    assert.notEqual(likeA1.toBase58(), likeB1.toBase58());

    // Same post + same user => identical PDA (guaranteeing 1 like per post per user)
    const duplicateLike = likePda(postA, user1);
    assert.equal(likeA1.toBase58(), duplicateLike.toBase58());
  });
});
