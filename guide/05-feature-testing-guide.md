# Feature Testing Guide & Verification Report

This guide outlines the testing strategy, test suites, and feature verification results for the **Solana Blog** dApp.

---

## 1. Feature Test Matrix

| Feature | Component / Route | Verification Method | Status |
|---|---|---|:---:|
| **Header Navigation & Logo** | `Header.tsx` (`/`, `/create`, `/post/[id]`) | UI Route Testing | ✅ PASS |
| **Wallet Connection Modal** | `WalletMultiButton` (`Header.tsx`) | UI Interaction Testing | ✅ PASS |
| **Config Status & Banner** | `ConfigBanner.tsx` (`/`) | Environment & PDA State | ✅ PASS |
| **Empty Feed State** | `EmptyState.tsx` (`/`) | Fallback State Verification | ✅ PASS |
| **Feed Rendering & Sorting** | `app/src/app/page.tsx` (`/`) | Unit & Component Test | ✅ PASS |
| **Reading Time Calculation** | `format.ts:readingTime` | Automated Unit Test | ✅ PASS (3/3) |
| **Timestamp & Relative Time** | `format.ts:timeAgo, formatDate` | Automated Unit Test | ✅ PASS (5/5) |
| **Public Key Shortening** | `format.ts:shortAddress` | Automated Unit Test | ✅ PASS (3/3) |
| **Post Title Validation** | `app/src/app/create/page.tsx` | Automated & UI Test | ✅ PASS (4/4) |
| **Post Content Validation** | `app/src/app/create/page.tsx` | Automated & UI Test | ✅ PASS (3/3) |
| **UTF-8 Byte Length Bounds** | `create/page.tsx` (200B title, 20KB content) | Automated Unit Test | ✅ PASS |
| **Config PDA Derivation** | `pda.ts:configPda` (`["config"]`) | Automated Unit Test | ✅ PASS |
| **Post PDA Derivation** | `pda.ts:postPda` (`["post", id]`) | Automated Unit Test | ✅ PASS |
| **Like PDA Derivation** | `pda.ts:likePda` (`["like", post, user]`) | Automated Unit Test | ✅ PASS |
| **Smart Contract IDL Integrity**| `idl.ts` (`initialize`, `createPost`, `likePost`) | Automated Unit Test | ✅ PASS (3/3) |
| **On-Chain Model Deserialization**| `program.ts:toPostView` | Automated Unit Test | ✅ PASS |
| **Post Detail Dynamic Route** | `app/src/app/post/[id]/page.tsx` | Route & Fallback Test | ✅ PASS |
| **404 / Non-Existent Post Fallback**| `app/src/app/post/[id]/page.tsx` | Route & Fallback Test | ✅ PASS |
| **Production Build Compilation** | Next.js 14 App Router | `npm run build` | ✅ PASS |

---

## 2. Running Automated Tests

The frontend includes an automated test suite powered by `tsx` and Node.js native test runner (`node:test`).

### 2.1. Run all feature tests
```bash
cd app
npm test
```

### 2.2. Test Suites Overview
The test suites are located in `app/tests/`:
- **[`tests/format.test.ts`](file:///Users/yindeish/Desktop/yindeish-git/solana-blog/app/tests/format.test.ts)**:
  - Address shortening with default and custom slice lengths.
  - Date formatting across unix epochs.
  - Relative time ranges (`"just now"`, `"X min ago"`, `"X hr ago"`, `"X days ago"`).
  - Word count reading time estimates.
- **[`tests/pda.test.ts`](file:///Users/yindeish/Desktop/yindeish-git/solana-blog/app/tests/pda.test.ts)**:
  - Deterministic Config PDA generation with seed `["config"]`.
  - Sequential Post PDA generation using 8-byte little-endian integers (`u64_le`).
  - Like PDA collision resistance guaranteeing one like per wallet per article.
- **[`tests/validation.test.ts`](file:///Users/yindeish/Desktop/yindeish-git/solana-blog/app/tests/validation.test.ts)**:
  - Title and content non-empty checks.
  - Multi-byte UTF-8 character byte counting (e.g., emojis exceeding 200 bytes).
  - Maximum body content boundary (20,000 bytes).
- **[`tests/idl-program.test.ts`](file:///Users/yindeish/Desktop/yindeish-git/solana-blog/app/tests/idl-program.test.ts)**:
  - Anchor IDL schema instructions (`initialize`, `createPost`, `likePost`).
  - Anchor account layouts (`Config`, `Post`, `Like`).
  - Anchor events (`PostCreated`, `PostLiked`).
  - Conversion of on-chain `BN` timestamps and IDs to clean frontend models (`toPostView`).

---

## 3. Step-by-Step Manual Feature Verification

Follow these steps to manually test all features in the live UI:

### Step 1: Start the Local Development Server
```bash
cd app
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### Step 2: Test Header & Wallet Modal
1. Verify the navigation bar shows:
   - **Solana Blog** logo on the left.
   - **Write a post** button.
   - **Select Wallet** button on the right.
2. Click **Select Wallet**.
3. Confirm that the wallet adapter modal pops up with options for **Phantom**, **Solflare**, etc.
4. Close the modal by clicking outside or pressing Escape.

### Step 3: Test Post Creation & Validation
1. Click **Write a post** (or navigate to `http://localhost:3000/create`).
2. **Test Empty Validation**:
   - Leave both Title and Content empty.
   - Click **Publish on-chain**.
   - **Expected**: Error banner displays `"Please add a title."`
3. **Test Content Validation**:
   - Enter a title: `"My First Post"`.
   - Leave the Content empty.
   - Click **Publish on-chain**.
   - **Expected**: Error banner displays `"Please add some content."`
4. **Test Character Counters**:
   - Verify the title counter reads `X / 200`.
   - Verify the content counter reads `X / 20000`.

### Step 4: Test Post Detail & Graceful Fallback
1. Navigate to a non-existent post URL, e.g., **`http://localhost:3000/post/99999`**.
2. **Expected**:
   - The page displays a loading pulse skeleton.
   - Once resolved, it displays the fallback card: `"Post not found"`.
   - A **"Back to feed"** button is present.
3. Click **"Back to feed"**.
4. **Expected**: Seamlessly redirects back to `http://localhost:3000`.

### Step 5: Test Like Feature (When Connected on Devnet)
1. Connect a wallet funded with Devnet SOL.
2. If the blog has not been initialized yet, click **Initialize blog**.
3. Publish a new post.
4. On the post card or post detail page, click the **❤️ Like** button.
5. Approve the transaction in Phantom/Solflare.
6. **Expected**:
   - The like count increments by 1.
   - The heart turns filled red and displays **"Liked"**.
   - Attempting to click again is disabled or rejected by the program since the `Like` PDA already exists.

---

## 4. Production Build Verification

To verify that the Next.js frontend compiles cleanly with zero type or lint errors:
```bash
cd app
npm run build
```
**Result**:
```text
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (5/5)
✓ Finalizing page optimization
```
All routes (`/`, `/_not-found`, `/create`, `/post/[id]`) build without warnings or errors.
