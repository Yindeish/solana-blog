# Smart Contract Architecture & Program Design

This document details the on-chain architecture of the **Solana Blog** Anchor program (`programs/solana-blog/src/lib.rs`).

---

## 1. High-Level Concepts

In Solana, programs (smart contracts) are **stateless**. All persistent data is stored in **Accounts**. 
To associate accounts deterministically with our program, we use **Program Derived Addresses (PDAs)**.

There are three main account types in this dApp:
1. **Config Account (`Config`)**: Global singleton tracking post count.
2. **Post Account (`Post`)**: One per post, storing post metadata and content.
3. **Like Account (`Like`)**: One per `(post, user)` pair to enforce single-like behavior.

---

## 2. PDA Derivation & Seeds

```
+-------------------------------------------------------------------------------+
|                            PDA Derivation Map                                 |
+-------------------------------------------------------------------------------+

1. Config PDA:
   seeds = ["config"]
   -> Only 1 exists per program instance.

2. Post PDA:
   seeds = ["post", id.to_le_bytes()]
   -> Seeded with the post number (u64 little-endian: 0, 1, 2, ...).
   -> Allows the client to predictably fetch any post by index.

3. Like PDA:
   seeds = ["like", post_pubkey.as_ref(), user_pubkey.as_ref()]
   -> Seeded with both the post's public key AND the user's public key.
   -> Guarantees at the protocol level that a wallet cannot like a post twice.
```

---

## 3. Account Data Structures

### 3.1. `Config` Account
```rust
#[account]
#[derive(InitSpace)]
pub struct Config {
    pub post_count: u64, // 8 bytes: sequential ID counter
}
```
- Total space: `8` (Anchor discriminator) + `8` (`u64`) = **16 bytes**.

### 3.2. `Post` Account
```rust
#[account]
#[derive(InitSpace)]
pub struct Post {
    pub id: u64,             // 8 bytes: post index
    pub author: Pubkey,      // 32 bytes: creator wallet address
    pub created_at: i64,     // 8 bytes: Solana unix timestamp
    pub likes: u64,          // 8 bytes: total like count
    #[max_len(200)]
    pub title: String,       // 4 + 200 bytes
    #[max_len(20000)]
    pub content: String,     // 4 + 20000 bytes
}
```
- **Rent Exemption**: When a user creates a post, they fund the rent exemption for `~20,264 bytes`. Because Solana storage is rent-exempt, this SOL remains locked in the post account forever (or until closed).

### 3.3. `Like` Account
```rust
#[account]
#[derive(InitSpace)]
pub struct Like {
    pub post: Pubkey, // 32 bytes: Post PDA
    pub user: Pubkey, // 32 bytes: Liker's wallet
}
```
- Total space: `8` (discriminator) + `32` + `32` = **72 bytes**.

---

## 4. Instructions & State Transitions

### 4.1. `initialize()`
- **Purpose**: Creates the singleton `Config` PDA.
- **Accounts**:
  - `config`: `[init, seeds = [b"config"], payer = authority]`
  - `authority`: signer / payer
  - `system_program`: Solana System Program
- **Logic**: Sets `config.post_count = 0`.

### 4.2. `create_post(title: String, content: String)`
- **Purpose**: Creates a new `Post` PDA and increments `config.post_count`.
- **Validation**:
  - `!title.is_empty()` and `title.len() <= 200`
  - `!content.is_empty()` and `content.len() <= 20000`
- **Accounts**:
  - `config`: `[mut, seeds = [b"config"]]`
  - `post`: `[init, seeds = [b"post", &config.post_count.to_le_bytes()], payer = author]`
  - `author`: signer / payer
  - `system_program`: Solana System Program
- **Emits**: `PostCreated` event with `{ id, author, created_at }`.

### 4.3. `like_post()`
- **Purpose**: Increments `post.likes` by 1 and initializes a `Like` PDA.
- **Accounts**:
  - `post`: `[mut]`
  - `like`: `[init, seeds = [b"like", post.key().as_ref(), user.key().as_ref()], payer = user]`
  - `user`: signer / payer
  - `system_program`: Solana System Program
- **Guarantees**: If the user tries to call `like_post` again on the same post, Anchor's `init` constraint fails automatically with `0x0` (Account already in use).
- **Emits**: `PostLiked` event with `{ id, user, new_like_count }`.

---

## 5. Security & Invariants

1. **Anti-Spam via Rent**: Storing 20KB on Solana requires a small SOL deposit (~0.14 SOL in rent reserve). This naturally disincentivizes spamming posts.
2. **Immutable Identity**: The `author` field is taken from `ctx.accounts.author.key()` which is verified by Solana cryptographic signature.
3. **No Double Likes**: Guaranteed cryptographically by the `Like` PDA seeds.
