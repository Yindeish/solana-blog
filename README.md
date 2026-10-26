# Onchain Blog · Solana

A simple, fully working blog dApp on **Solana**. Posts are stored **entirely on-chain** in an **Anchor** program. The frontend is **Next.js 14 (App Router)** + **Solana Wallet Adapter** + **@coral-xyz/anchor**.

> ℹ️ **Why not wagmi?** `wagmi` is EVM-only (Ethereum) and cannot talk to Solana. The Solana-native equivalent is the official **Solana Wallet Adapter**, which is what this app uses (it supports Phantom, Solflare, and any Wallet Standard wallet). If you prefer a unified multi-chain SDK, **thirdweb** also supports Solana — but the Wallet Adapter is the standard, dependency-light choice used here.

Everything is wired so you only plug in environment variables — no code changes needed.

```
solana-blog/
├── guide/                            # Step-by-step guides & docs
│   ├── 01-getting-started.md         # Toolchain, build, deploy, & run
│   ├── 02-using-the-app.md           # Wallet, initialize, write, like
│   ├── 03-smart-contract-architecture.md # PDAs, accounts, & instructions
│   ├── 04-troubleshooting-and-faq.md # Common errors & solutions
│   └── 05-feature-testing-guide.md   # Testing matrix & test execution guide
├── programs/solana-blog/src/lib.rs   # Anchor program (Rust)
├── Anchor.toml
├── Cargo.toml
└── app/                              # Next.js frontend
    ├── src/app/                      # pages: feed, create, post/[id]
    ├── src/components/               # Header, PostCard, LikeButton, ...
    ├── src/lib/                      # idl, program, pda, format
    └── .env.example
```

> 📖 **Looking for step-by-step guides?** Check out the [`guide/`](./guide) folder for detailed guides on [starting the project](./guide/01-getting-started.md), [using the app](./guide/02-using-the-app.md), and [architecture](./guide/03-smart-contract-architecture.md).

## Features

- 📝 **Create posts** — title + body stored on-chain in a `Post` PDA
- 📚 **Feed** — all posts, newest first, with reading time
- ❤️ **Like posts** — one like per wallet per post, enforced by a `Like` PDA
- 🔎 **Post detail** page
- 🔌 **Wallet connection** — Phantom & Solflare out of the box (any Wallet Standard wallet works)
- 🛠 **One-time initialize** — creates the `Config` PDA from the UI
- ⚠️ **Graceful "not configured" states** so the UI never crashes

---

## Prerequisites

- **Rust** + **Solana CLI** + **Anchor CLI** (for building/deploying the program)
- **Node.js 18+** (Node 20 recommended)
- A Solana wallet (Phantom/Solflare) with a little SOL on devnet

Install the toolchain (once):

```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Anchor (avm)
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install 0.30.1 && avm use 0.30.1
```

---

## 1) Build & deploy the program

```bash
cd solana-blog

# Point the CLI at devnet and create a local wallet (if you don't have one)
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/id.json   # skip if exists
solana airdrop 2

# Build
anchor build
```

Get your **program id** and set it in three places:

```bash
anchor keys list
```

1. `programs/solana-blog/src/lib.rs` → `declare_id!("...")`
2. `Anchor.toml` → `[programs.devnet]` and `[programs.localnet]`
3. `app/.env.local` → `NEXT_PUBLIC_PROGRAM_ID`

Then rebuild & deploy:

```bash
anchor build
anchor deploy --provider.cluster devnet
```

> Tip: if you change the program id after the first build, run `anchor build` again so the IDL/discriminators stay in sync.

---

## 2) Configure & run the frontend

```bash
cd app
npm install
cp .env.example .env.local
```

Edit `app/.env.local`:

```env
NEXT_PUBLIC_PROGRAM_ID=<your deployed program id>
NEXT_PUBLIC_CLUSTER=devnet            # devnet | mainnet-beta | testnet
NEXT_PUBLIC_RPC_URL=                  # optional custom RPC (Helius/QuickNode)
```

Run it:

```bash
npm run dev
```

Open http://localhost:3000, connect a wallet, and:

1. Click **Initialize blog** once (creates the `Config` account).
2. Click **Write a post** to publish.
3. Like posts from the feed or detail page.

---

## Environment variables reference (`app/.env.local`)

| Variable                 | Required | Description                                       |
| ------------------------ | :------: | ------------------------------------------------- |
| `NEXT_PUBLIC_PROGRAM_ID` |    ✅    | Deployed Anchor program id (base58)               |
| `NEXT_PUBLIC_CLUSTER`    |    ✅    | `devnet`, `mainnet-beta`, or `testnet`            |
| `NEXT_PUBLIC_RPC_URL`    |    —     | Custom RPC; falls back to public `clusterApiUrl`  |

---

## Program API

`programs/solana-blog/src/lib.rs`

| Instruction | Accounts | Description |
| --- | --- | --- |
| `initialize()` | config, authority, system | Create the `Config` PDA (post counter) |
| `create_post(title, content)` | config, post, author, system | Create a `Post` PDA; increments counter |
| `like_post()` | post, like, user, system | Create a `Like` PDA; increments post likes |

**PDAs**
- `Config` → seeds `["config"]`
- `Post` → seeds `["post", u64_le(post_index)]`
- `Like` → seeds `["like", post_pubkey, user_pubkey]`

**Accounts**
- `Config { post_count: u64 }`
- `Post { id: u64, author: Pubkey, created_at: i64, likes: u64, title: String, content: String }`
- `Like { post: Pubkey, user: Pubkey }`

---

## Production build

```bash
cd app
npm run build
npm start
```

Deploy the `app` folder to Vercel / Netlify / any Node host, and set the same `NEXT_PUBLIC_*` env vars there.

---

## Troubleshooting

- **"Program not configured" banner** → set `NEXT_PUBLIC_PROGRAM_ID` in `.env.local` and restart `npm run dev`.
- **"Initialize the blog" keeps showing** → the `Config` PDA wasn't created; connect a wallet and click Initialize.
- **Posts don't load** → wrong cluster/program id, or a flaky public RPC. Set `NEXT_PUBLIC_RPC_URL` to a dedicated RPC.
- **`anchor build` fails** → ensure `avm use 0.30.1` and that Rust/Solana CLI are on your PATH.
- **Wallet won't connect** → install Phantom/Solflare and switch it to Devnet.

---

## License

MIT
