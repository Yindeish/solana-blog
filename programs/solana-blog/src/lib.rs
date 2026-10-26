//! # Solana Blog
//!
//! A simple, fully on-chain blog program.
//!
//! - `initialize`  creates a singleton `Config` PDA that tracks the post count.
//! - `create_post` creates a `Post` PDA (seeded by the current post index) and
//!   increments the counter.
//! - `like_post`   creates a `Like` PDA (seeded by post + user) so each wallet
//!   can like a given post at most once, and increments the post's like count.
//!
//! All post text is stored on-chain inside the `Post` account.

use anchor_lang::prelude::*;

// Placeholder program id. Replace with your own after `anchor keys list` /
// `anchor deploy`. The frontend reads the real id from NEXT_PUBLIC_PROGRAM_ID.
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub const MAX_TITLE_LEN: usize = 200;
pub const MAX_CONTENT_LEN: usize = 20000;

#[program]
pub mod solana_blog {
    use super::*;

    /// Create the global config account. Call this once after deployment.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.post_count = 0;
        msg!("Blog initialized. post_count = 0");
        Ok(())
    }

    /// Publish a new post.
    pub fn create_post(
        ctx: Context<CreatePost>,
        title: String,
        content: String,
    ) -> Result<()> {
        require!(!title.is_empty(), BlogError::EmptyTitle);
        require!(!content.is_empty(), BlogError::EmptyContent);
        require!(title.len() <= MAX_TITLE_LEN, BlogError::TitleTooLong);
        require!(content.len() <= MAX_CONTENT_LEN, BlogError::ContentTooLong);

        let config = &mut ctx.accounts.config;
        let post = &mut ctx.accounts.post;

        post.id = config.post_count;
        post.author = ctx.accounts.author.key();
        post.title = title;
        post.content = content;
        post.created_at = Clock::get()?.unix_timestamp;
        post.likes = 0;

        config.post_count = config
            .post_count
            .checked_add(1)
            .ok_or(BlogError::Overflow)?;

        emit!(PostCreated {
            id: post.id,
            author: post.author,
            created_at: post.created_at,
        });

        Ok(())
    }

    /// Like a post. One like per (post, user) pair, enforced by the Like PDA.
    pub fn like_post(ctx: Context<LikePost>) -> Result<()> {
        let post = &mut ctx.accounts.post;
        let like = &mut ctx.accounts.like;

        like.post = post.key();
        like.user = ctx.accounts.user.key();

        post.likes = post.likes.checked_add(1).ok_or(BlogError::Overflow)?;

        emit!(PostLiked {
            id: post.id,
            user: like.user,
            new_like_count: post.likes,
        });

        Ok(())
    }
}

// ─────────────────────────────── Accounts ───────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Config::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreatePost<'info> {
    #[account(mut, seeds = [b"config"], bump)]
    pub config: Account<'info, Config>,

    #[account(
        init,
        payer = author,
        space = 8 + Post::INIT_SPACE,
        seeds = [b"post", config.post_count.to_le_bytes().as_ref()],
        bump
    )]
    pub post: Account<'info, Post>,

    #[account(mut)]
    pub author: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LikePost<'info> {
    #[account(mut)]
    pub post: Account<'info, Post>,

    #[account(
        init,
        payer = user,
        space = 8 + Like::INIT_SPACE,
        seeds = [b"like", post.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub like: Account<'info, Like>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// ─────────────────────────────── State ───────────────────────────────

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub post_count: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Post {
    pub id: u64,
    pub author: Pubkey,
    pub created_at: i64,
    pub likes: u64,
    #[max_len(200)]
    pub title: String,
    #[max_len(20000)]
    pub content: String,
}

#[account]
#[derive(InitSpace)]
pub struct Like {
    pub post: Pubkey,
    pub user: Pubkey,
}

// ─────────────────────────────── Events ───────────────────────────────

#[event]
pub struct PostCreated {
    pub id: u64,
    pub author: Pubkey,
    pub created_at: i64,
}

#[event]
pub struct PostLiked {
    pub id: u64,
    pub user: Pubkey,
    pub new_like_count: u64,
}

// ─────────────────────────────── Errors ───────────────────────────────

#[error_code]
pub enum BlogError {
    #[msg("Title cannot be empty.")]
    EmptyTitle,
    #[msg("Content cannot be empty.")]
    EmptyContent,
    #[msg("Title is too long (max 200 bytes).")]
    TitleTooLong,
    #[msg("Content is too long (max 20000 bytes).")]
    ContentTooLong,
    #[msg("Arithmetic overflow.")]
    Overflow,
}
