# Using the App: Create Posts & Interact

This guide walks you through every feature of the Solana Blog application from the perspective of an end-user and writer.

---

## 1. Connecting Your Wallet

1. Open **[http://localhost:3000](http://localhost:3000)** in your browser.
2. In the top-right corner of the header, click **Select Wallet** (or **Connect Wallet**).
3. Select your installed wallet (e.g., **Phantom** or **Solflare**).
4. Approve the connection request in the wallet popup.

> ⚠️ **Devnet Notice**: Ensure your wallet extension is set to **Devnet**!
> - In Phantom: Click ⚙️ (Settings) → **Developer Settings** → Enable **Testnet Mode** / Select **Devnet**.
> - You will also need some Devnet SOL in this browser wallet to pay for rent exemption and transaction fees. Request test SOL via [faucet.solana.com](https://faucet.solana.com).

---

## 2. One-Time Blog Initialization

The Solana program requires a singleton **Config PDA** (Program Derived Address) to track the total number of posts published (`post_count`).

If you are running a newly deployed contract:
1. You will see an alert banner on the home feed:
   > *"The blog config account does not exist yet. Initialize it once to enable posting."*
2. Click the **Initialize blog** button.
3. Your connected wallet will prompt you to approve and sign the transaction (`initialize()` instruction).
4. Once confirmed on the blockchain, the feed will refresh and display the empty state ready for the first article.

> **Note**: Initialization only happens once per deployed program instance. Any wallet can trigger initialization.

---

## 3. Creating & Publishing a Blog Post

To write an article stored permanently on Solana:

### Step 1: Navigate to the Editor
- Click **Write a post** in the header navigation or the call-to-action button on the home page.
- URL: `http://localhost:3000/create`

### Step 2: Fill in the Post Details
- **Post Title**: Enter a title (max **200 bytes** / ~200 characters).
- **Post Body**: Write your content (max **20,000 bytes** / ~20 KB).

### Step 3: Sign & Submit
1. Click **Publish on-chain**.
2. Your wallet will prompt you to sign the transaction.
3. **What happens under the hood?**
   - The frontend reads the current `post_count` from the `Config` account.
   - It derives a unique **Post PDA** with seeds: `["post", id]`.
   - The program allocates on-chain storage for your title and content, marking your wallet public key as the author.
   - The author pays a tiny rent-exemption fee (~0.002 - 0.005 SOL) to store the data on Solana.
4. After transaction confirmation, the browser automatically redirects you to your new post's detail page (`/post/{id}`).

---

## 4. Reading Posts on the Feed

- On the home page (`/`), all published articles are fetched directly from the Solana blockchain.
- Posts are displayed in reverse chronological order (newest first).
- Each card displays:
  - **Post ID & Title**
  - **Reading time estimate** (calculated based on word count)
  - **Author address** (shortened Solana base58 public key with link to Solana Explorer)
  - **Relative timestamp** (e.g., "5 minutes ago")
  - **Snippet preview** of the content
  - **Like counter & quick like button**

---

## 5. Viewing a Single Post

Click any post title or card to view the dedicated article page (`/post/[id]`):
- Displays the complete unabridged content.
- Shows author address with external explorer links.
- Shows exact publication date and time.
- Interactive like button with live on-chain counter updates.

---

## 6. Liking a Post (Onchain Likes)

The liking mechanism is decentralized and enforced strictly by Solana smart contract rules:

1. Click the **❤️ Like** button on any post card or post page.
2. Sign the transaction in your wallet.
3. **Smart Contract Rules for Likes**:
   - Each wallet address can like each post **at most once**.
   - A unique `Like` PDA is created with seeds: `["like", post_pubkey, user_pubkey]`.
   - Attempting to like the same post again will be rejected by the Solana runtime because the PDA already exists.
   - Once liked, the button shows a filled red heart and displays **"Liked"**.

---

## 7. User Interface States Summary

| UI Element / Banner | What it Means | Action Needed |
|---|---|---|
| **"Program ID not configured"** | The frontend doesn't know where the smart contract is deployed. | Set `NEXT_PUBLIC_PROGRAM_ID` in `app/.env.local` and restart `npm run dev`. |
| **"Connect wallet to initialize"** | The program is deployed but needs its initial `Config` account. | Connect a funded Devnet wallet and click **Initialize**. |
| **"Transaction failed: Insufficient funds"** | Your wallet does not have enough SOL for transaction fees / account rent. | Airdrop Devnet SOL to your wallet address. |
