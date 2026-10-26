# Getting Started: Starting the Project

This guide covers all steps required to get the Solana Blog running on your local machine, from toolchain installation to deploying the smart contract on Devnet and launching the Next.js frontend.

---

## 1. Prerequisites & Toolchain Setup

Ensure the following tools are installed on your system:

### 1.1. Rust
Install the Rust toolchain:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustc --version
```

### 1.2. Solana CLI
Install the Solana CLI (version 1.18+ or latest stable Anza release):
```bash
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version
```

### 1.3. Anchor CLI (avm)
Install Anchor via the Anchor Version Manager (`avm`):
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install 0.30.1
avm use 0.30.1
anchor --version
```

### 1.4. Node.js & Package Manager
- **Node.js**: Version 18+ (Node 20 recommended). Check with `node -v`.
- **npm** (included with Node.js) or **yarn/pnpm**.

### 1.5. Browser Wallet
Install a Solana wallet extension:
- [Phantom Wallet](https://phantom.app/) or [Solflare](https://solflare.com/)
- Switch your wallet network to **Devnet** (Settings → Developer Settings → Change Network → Devnet).

---

## 2. Solana CLI & Devnet Wallet Configuration

Configure your Solana CLI to use Devnet and generate a deployment keypair if you don't already have one:

```bash
# 1. Point CLI to Solana Devnet
solana config set --url devnet

# 2. Generate a local Solana keypair (skip if you already have ~/.config/solana/id.json)
solana-keygen new --outfile ~/.config/solana/id.json

# 3. View your public address
solana address

# 4. Request Devnet SOL for deployment fees
solana airdrop 2
```

> **Note**: If `solana airdrop` encounters rate limits, obtain Devnet SOL using web faucets:
> - [Solana Faucet](https://faucet.solana.com/)
> - [QuickNode Solana Faucet](https://faucet.quicknode.com/solana/devnet)

---

## 3. Build & Deploy the Anchor Program

From the root of the project (`solana-blog`):

```bash
# 1. First build to generate target keypairs and IDL
anchor build

# 2. Check your program key
anchor keys list
```

You will see output resembling:
```text
solana_blog: 4xK9...abc123xyz
```

### Synchronize the Program ID in 3 Places:

Replace the placeholder ID with your generated key:

1. **`programs/solana-blog/src/lib.rs`**:
   ```rust
   declare_id!("YOUR_PROGRAM_ID");
   ```
2. **`Anchor.toml`**:
   ```toml
   [programs.localnet]
   solana_blog = "YOUR_PROGRAM_ID"

   [programs.devnet]
   solana_blog = "YOUR_PROGRAM_ID"
   ```
3. **`app/.env.local`**:
   ```env
   NEXT_PUBLIC_PROGRAM_ID="YOUR_PROGRAM_ID"
   ```

### Rebuild and Deploy to Devnet:

```bash
# Rebuild to bake in the new program id
anchor build

# Deploy to Devnet
anchor deploy --provider.cluster devnet
```

After deployment, your smart contract is live on Solana Devnet.

---

## 4. Setting Up & Starting the Frontend

The frontend is a modern Next.js 14 App Router application located in the `app/` folder.

### 4.1. Navigate to the frontend directory
```bash
cd app
```

### 4.2. Install dependencies
```bash
npm install
```

### 4.3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Open `app/.env.local` and set:
```env
# Your deployed program ID from Anchor keys list
NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID

# Target Solana Cluster
NEXT_PUBLIC_CLUSTER=devnet

# Optional: custom high-performance RPC (Helius, QuickNode, Alchemy)
# Leave blank to use public clusterApiUrl
NEXT_PUBLIC_RPC_URL=
```

### 4.4. Start the Development Server
```bash
npm run dev
```

The application will start at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 5. Summary Checklist

- [x] Rust, Solana CLI, Anchor CLI, and Node.js installed
- [x] CLI wallet has Devnet SOL balance (`solana balance`)
- [x] Program built and deployed with `anchor deploy`
- [x] `NEXT_PUBLIC_PROGRAM_ID` updated in `app/.env.local`
- [x] `npm run dev` running inside `app/`
- [x] Phantom or Solflare set to **Devnet** network

Next, proceed to [**02. Using the App: From Wallet to Publishing**](./02-using-the-app.md) to initialize the blog and publish your first post!
