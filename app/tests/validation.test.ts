import test from "node:test";
import assert from "node:assert/strict";

const MAX_TITLE = 200;
const MAX_CONTENT = 20000;

function validatePost(
  title: string,
  content: string
): { valid: boolean; error?: string } {
  if (!title.trim()) {
    return { valid: false, error: "Please add a title." };
  }
  if (!content.trim()) {
    return { valid: false, error: "Please add some content." };
  }
  if (new TextEncoder().encode(title).length > MAX_TITLE) {
    return {
      valid: false,
      error: `Title is too long (max ${MAX_TITLE} bytes).`,
    };
  }
  if (new TextEncoder().encode(content).length > MAX_CONTENT) {
    return {
      valid: false,
      error: `Content is too long (max ${MAX_CONTENT} bytes).`,
    };
  }
  return { valid: true };
}

test("Feature Test: Create Post Validation", async (t) => {
  await t.test("rejects empty or whitespace-only title", () => {
    assert.deepEqual(validatePost("", "Some valid content"), {
      valid: false,
      error: "Please add a title.",
    });
    assert.deepEqual(validatePost("   ", "Some valid content"), {
      valid: false,
      error: "Please add a title.",
    });
  });

  await t.test("rejects empty or whitespace-only content", () => {
    assert.deepEqual(validatePost("Valid Title", ""), {
      valid: false,
      error: "Please add some content.",
    });
    assert.deepEqual(validatePost("Valid Title", "   \n\t  "), {
      valid: false,
      error: "Please add some content.",
    });
  });

  await t.test("accepts valid post within byte limits", () => {
    const res = validatePost("Decentralized Blogging on Solana", "Hello Web3 world!");
    assert.equal(res.valid, true);
    assert.equal(res.error, undefined);
  });

  await t.test("properly counts UTF-8 multi-byte characters in title", () => {
    // Emojis are 4 bytes each: 51 emojis = 204 bytes (> 200)
    const longEmojiTitle = "🚀".repeat(51);
    assert.equal(new TextEncoder().encode(longEmojiTitle).length, 204);

    const res = validatePost(longEmojiTitle, "Content");
    assert.equal(res.valid, false);
    assert.equal(res.error, `Title is too long (max ${MAX_TITLE} bytes).`);
  });

  await t.test("rejects content exceeding 20,000 bytes", () => {
    const hugeContent = "A".repeat(20001);
    const res = validatePost("Title", hugeContent);
    assert.equal(res.valid, false);
    assert.equal(res.error, `Content is too long (max ${MAX_CONTENT} bytes).`);
  });

  await t.test("accepts content right at 20,000 bytes limit", () => {
    const maxContent = "A".repeat(20000);
    const res = validatePost("Title", maxContent);
    assert.equal(res.valid, true);
  });
});
