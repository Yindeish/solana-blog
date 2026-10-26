import test from "node:test";
import assert from "node:assert/strict";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { IDL } from "../src/lib/idl";
import { toPostView } from "../src/lib/program";

test("Feature Test: IDL Structure and Smart Contract Contract", async (t) => {
  await t.test("IDL defines required instructions", () => {
    const instructionNames = IDL.instructions.map((ix) => ix.name);
    assert.ok(instructionNames.includes("initialize"));
    assert.ok(instructionNames.includes("createPost"));
    assert.ok(instructionNames.includes("likePost"));
  });

  await t.test("IDL defines required accounts", () => {
    const accountNames = IDL.accounts.map((acc) => acc.name);
    assert.ok(accountNames.includes("Config"));
    assert.ok(accountNames.includes("Post"));
    assert.ok(accountNames.includes("Like"));
  });

  await t.test("IDL defines expected events", () => {
    const eventNames = IDL.events.map((e) => e.name);
    assert.ok(eventNames.includes("PostCreated"));
    assert.ok(eventNames.includes("PostLiked"));
  });
});

test("Feature Test: Account Data Conversion (toPostView)", async (t) => {
  await t.test("converts onchain Anchor account into frontend PostView model", () => {
    const authorPubkey = new PublicKey(
      "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
    );

    const mockAnchorPost = {
      id: new BN(42),
      author: authorPubkey,
      createdAt: new BN(1710000000),
      likes: new BN(15),
      title: "Building on Solana",
      content: "Anchor makes Solana development intuitive and secure.",
    };

    const postView = toPostView(mockAnchorPost);

    assert.equal(postView.id, 42);
    assert.equal(postView.author, authorPubkey.toBase58());
    assert.equal(postView.createdAt, 1710000000);
    assert.equal(postView.likes, 15);
    assert.equal(postView.title, "Building on Solana");
    assert.equal(
      postView.content,
      "Anchor makes Solana development intuitive and secure."
    );
  });
});
