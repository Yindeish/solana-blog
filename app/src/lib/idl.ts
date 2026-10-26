/**
 * Anchor IDL for the `solana_blog` program.
 *
 * Discriminators are sha256("global:<ix>")[0..8] for instructions and
 * sha256("account:<Name>")[0..8] for accounts. They are pre-computed here so
 * the client works without running `anchor build`.
 */
export const IDL: any = {
  address: "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
  metadata: {
    name: "solana_blog",
    version: "0.1.0",
    spec: "0.1.0",
  },
  instructions: [
    {
      name: "initialize",
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
      accounts: [
        { name: "config", writable: true },
        { name: "authority", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [],
    },
    {
      name: "createPost",
      discriminator: [123, 92, 184, 29, 231, 24, 15, 202],
      accounts: [
        { name: "config", writable: true },
        { name: "post", writable: true },
        { name: "author", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [
        { name: "title", type: "string" },
        { name: "content", type: "string" },
      ],
    },
    {
      name: "likePost",
      discriminator: [45, 242, 154, 71, 63, 133, 54, 186],
      accounts: [
        { name: "post", writable: true },
        { name: "like", writable: true },
        { name: "user", writable: true, signer: true },
        { name: "systemProgram", address: "11111111111111111111111111111111" },
      ],
      args: [],
    },
  ],
  accounts: [
    { name: "Config", discriminator: [155, 12, 170, 224, 30, 250, 204, 130] },
    { name: "Post", discriminator: [8, 147, 90, 186, 185, 56, 192, 150] },
    { name: "Like", discriminator: [10, 133, 129, 201, 87, 218, 203, 222] },
  ],
  events: [
    {
      name: "PostCreated",
      discriminator: [110, 71, 56, 207, 96, 134, 230, 102],
    },
    {
      name: "PostLiked",
      discriminator: [81, 44, 27, 166, 96, 183, 61, 189],
    },
  ],
  errors: [
    { code: 6000, name: "EmptyTitle", msg: "Title cannot be empty." },
    { code: 6001, name: "EmptyContent", msg: "Content cannot be empty." },
    { code: 6002, name: "TitleTooLong", msg: "Title is too long (max 200 bytes)." },
    { code: 6003, name: "ContentTooLong", msg: "Content is too long (max 20000 bytes)." },
    { code: 6004, name: "Overflow", msg: "Arithmetic overflow." },
  ],
  types: [
    {
      name: "Config",
      type: {
        kind: "struct",
        fields: [{ name: "postCount", type: "u64" }],
      },
    },
    {
      name: "Post",
      type: {
        kind: "struct",
        fields: [
          { name: "id", type: "u64" },
          { name: "author", type: "pubkey" },
          { name: "createdAt", type: "i64" },
          { name: "likes", type: "u64" },
          { name: "title", type: "string" },
          { name: "content", type: "string" },
        ],
      },
    },
    {
      name: "Like",
      type: {
        kind: "struct",
        fields: [
          { name: "post", type: "pubkey" },
          { name: "user", type: "pubkey" },
        ],
      },
    },
  ],
};

export type PostView = {
  id: number;
  author: string;
  createdAt: number;
  likes: number;
  title: string;
  content: string;
};
