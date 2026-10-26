import test from "node:test";
import assert from "node:assert/strict";
import {
  shortAddress,
  formatDate,
  timeAgo,
  readingTime,
} from "../src/lib/format";

test("Feature Test: Address Formatting (shortAddress)", async (t) => {
  await t.test("returns empty string when address is undefined or empty", () => {
    assert.equal(shortAddress(undefined), "");
    assert.equal(shortAddress(""), "");
  });

  await t.test("shortens address with default 4 characters prefix and suffix", () => {
    const pubkey = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";
    const shortened = shortAddress(pubkey);
    assert.equal(shortened, "Fg6P…sLnS");
  });

  await t.test("shortens address with custom characters count", () => {
    const pubkey = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS";
    const shortened = shortAddress(pubkey, 6);
    assert.equal(shortened, "Fg6PaF…PFsLnS");
  });
});

test("Feature Test: Date and Timestamp Formatting (formatDate & timeAgo)", async (t) => {
  await t.test("formatDate formats unix timestamp to readable date", () => {
    // 1700000000 = Nov 14, 2023
    const formatted = formatDate(1700000000);
    assert.ok(formatted.includes("2023"));
  });

  await t.test("timeAgo displays 'just now' for recent events (<60s)", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    assert.equal(timeAgo(nowSec - 10), "just now");
  });

  await t.test("timeAgo displays 'X min ago' for minutes range", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    assert.equal(timeAgo(nowSec - 5 * 60), "5 min ago");
  });

  await t.test("timeAgo displays 'X hr ago' for hours range", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    assert.equal(timeAgo(nowSec - 3 * 3600), "3 hr ago");
  });

  await t.test("timeAgo displays singular and plural days", () => {
    const nowSec = Math.floor(Date.now() / 1000);
    assert.equal(timeAgo(nowSec - 1 * 86400), "1 day ago");
    assert.equal(timeAgo(nowSec - 5 * 86400), "5 days ago");
  });
});

test("Feature Test: Reading Time Estimation (readingTime)", async (t) => {
  await t.test("estimates 1 min read for short texts (<200 words)", () => {
    const text = "Solana is a high performance blockchain with fast block times.";
    assert.equal(readingTime(text), "1 min read");
  });

  await t.test("estimates correct reading time for longer text (~400 words)", () => {
    const words = Array(400).fill("solana").join(" ");
    assert.equal(readingTime(words), "2 min read");
  });

  await t.test("handles whitespace and empty content gracefully", () => {
    assert.equal(readingTime("   "), "1 min read");
  });
});
