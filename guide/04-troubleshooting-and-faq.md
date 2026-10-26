# Troubleshooting & FAQ

Encountering an issue? Here are solutions to the most common setup and runtime errors when working with Solana Blog.

---

## 1. Frontend & Configuration Issues

### ⚠️ "Program not configured" Banner Displays
**Cause**: The frontend environment variable `NEXT_PUBLIC_PROGRAM_ID` is missing or is set to the default placeholder.

**Solution**:
1. Check your program id using `anchor keys list`.
2. Open `app/.env.local` and ensure:
   ```env
   NEXT_PUBLIC_PROGRAM_ID=<your-deployed-program-id>
   ```
3. Restart the Next.js dev server:
   ```bash
   # In app/
   npm run dev
   ```
   *(Next.js bakes `NEXT_PUBLIC_*` variables at compile time, so a server restart is mandatory).*

---

### ⚠️ "Initialize the blog" Keeps Showing After Clicking Initialize
**Cause**: The `initialize` transaction either failed, didn't confirm, or the RPC node is lagging behind.

**Solution**:
1. Check your browser console and wallet activity to verify the transaction confirmed.
2. Verify that your wallet has enough Devnet SOL to pay for the `Config` account rent.
3. Refresh the page after 5–10 seconds to allow the RPC to index the new PDA.

---

### ⚠️ Posts Are Not Loading / "Failed to fetch"
**Cause**: Solana public Devnet RPC (`https://api.devnet.solana.com`) often throttles requests (HTTP 429).

**Solution**:
Use a free dedicated RPC provider such as **Helius**, **QuickNode**, or **Alchemy**:
1. Sign up for a free account at [Helius.dev](https://helius.dev) or [QuickNode.com](https://www.quicknode.com).
2. Copy your Devnet HTTP RPC endpoint URL.
3. In `app/.env.local`, set:
   ```env
   NEXT_PUBLIC_RPC_URL="https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY"
   ```
4. Restart the frontend server.

---

## 2. Wallet & Transaction Issues

### ⚠️ Wallet Fails to Connect
**Cause**: Browser wallet extension popup blocked or network mismatch.

**Solution**:
- Ensure your wallet extension (Phantom/Solflare) is unlocked.
- Ensure the wallet network is set to **Devnet** (not Mainnet or Testnet).
- Try hard refreshing the browser tab (`Cmd + Shift + R` or `Ctrl + Shift + R`).

---

### ⚠️ "Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0"
**Cause**: Attempting to initialize an account that already exists. For example:
- Attempting to like a post you have already liked.
- Attempting to re-initialize the blog `Config` account when it already exists.

**Solution**:
- You can only like each post once per wallet address. Use another wallet address in Phantom/Solflare to test additional likes.

---

### ⚠️ "Insufficient Funds for Rent Exemption" / Transaction Dropped
**Cause**: Creating a post requires storing up to 20,000 bytes on-chain. In Solana, allocating space requires a refundable rent deposit (~0.14 - 0.15 SOL for ~20KB). If your wallet has only 0.05 SOL, the transaction will fail.

**Solution**:
Ensure your wallet has at least **0.5 SOL** to comfortably create multiple posts:
```bash
# In terminal:
solana airdrop 2 <YOUR_WALLET_ADDRESS> --url devnet
```
Or use the web faucets:
- [Solana Official Faucet](https://faucet.solana.com/)
- [QuickNode Devnet Faucet](https://faucet.quicknode.com/solana/devnet)

---

## 3. Solana CLI & Anchor Build Issues

### ⚠️ `solana airdrop` Returns "Rate limit reached" (HTTP 429)
**Cause**: The public airdrop endpoint is heavily congested.

**Solution**:
1. Use the web faucet at [faucet.solana.com](https://faucet.solana.com).
2. Ask in the Solana Discord `#devnet-faucet` channel.
3. Switch your CLI RPC temporarily to a private RPC when airdropping.

---

### ⚠️ `anchor build` Fails with Toolchain or Version Errors
**Cause**: Incompatible `anchor-cli` version. The project is designed with Anchor **0.30.1**.

**Solution**:
Use the Anchor Version Manager (`avm`):
```bash
avm install 0.30.1
avm use 0.30.1
anchor --version
```
Ensure Rust is up-to-date:
```bash
rustup update stable
```

---

### ⚠️ Program ID Mismatch During `anchor deploy`
**Cause**: The program ID in `programs/solana-blog/src/lib.rs` does not match the keypair generated in `target/deploy/solana_blog-keypair.json`.

**Solution**:
1. Run `anchor keys list`.
2. Update the address printed by `anchor keys list` in:
   - `programs/solana-blog/src/lib.rs` inside `declare_id!("...")`
   - `Anchor.toml` under `[programs.devnet]`
   - `app/.env.local` as `NEXT_PUBLIC_PROGRAM_ID`
3. Run `anchor build` again.
4. Run `anchor deploy --provider.cluster devnet`.
