use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::{AssociatedToken},
    token::{Mint, Token, TokenAccount},
};
use crate::constants::*;
use crate::state::*;

/// Initialize global Whisky state
#[derive(Accounts)]
pub struct WhiskyInitialize<'info> {
    #[account(
        init,
        payer = initializer,
        space = WhiskyState::SPACE,
        seeds = [WHISKY_STATE_SEED],
        bump
    )]
    pub whisky_state: Account<'info, WhiskyState>,
    
    #[account(mut)]
    pub initializer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

/// Set Whisky authority
#[derive(Accounts)]
pub struct WhiskySetAuthority<'info> {
    #[account(
        mut,
        seeds = [WHISKY_STATE_SEED],
        bump = whisky_state.bump[0],
        has_one = authority
    )]
    pub whisky_state: Account<'info, WhiskyState>,
    
    pub authority: Signer<'info>,
}

/// Configure Whisky settings
#[derive(Accounts)]
pub struct WhiskySetConfig<'info> {
    #[account(
        mut,
        seeds = [WHISKY_STATE_SEED],
        bump = whisky_state.bump[0],
        has_one = authority
    )]
    pub whisky_state: Account<'info, WhiskyState>,
    
    pub authority: Signer<'info>,
}

/// Initialize a gaming pool
#[derive(Accounts)]
pub struct PoolInitialize<'info> {
    #[account(
        seeds = [WHISKY_STATE_SEED],
        bump = whisky_state.bump[0]
    )]
    pub whisky_state: Account<'info, WhiskyState>,
    
    #[account(
        init,
        payer = user,
        space = Pool::SPACE,
        seeds = [
            POOL_SEED,
            underlying_token_mint.key().as_ref(),
            pool_authority.key().as_ref()
        ],
        bump
    )]
    pub pool: Account<'info, Pool>,
    
    pub underlying_token_mint: Account<'info, Mint>,
    
    /// CHECK: Pool authority can be any account
    pub pool_authority: AccountInfo<'info>,
    
    #[account(
        init,
        payer = user,
        mint::decimals = underlying_token_mint.decimals,
        mint::authority = pool,
        seeds = [
            POOL_LP_MINT_SEED,
            underlying_token_mint.key().as_ref(),
            pool_authority.key().as_ref()
        ],
        bump
    )]
    pub lp_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = user,
        associated_token::mint = underlying_token_mint,
        associated_token::authority = pool
    )]
    pub pool_underlying_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = user,
        associated_token::mint = underlying_token_mint,
        associated_token::authority = pool
    )]
    pub pool_jackpot_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Deposit tokens into pool
#[derive(Accounts)]
pub struct PoolDeposit<'info> {
    #[account(
        seeds = [WHISKY_STATE_SEED],
        bump = whisky_state.bump[0]
    )]
    pub whisky_state: Account<'info, WhiskyState>,
    
    #[account(
        seeds = [
            POOL_SEED,
            underlying_token_mint.key().as_ref(),
            pool.pool_authority.as_ref()
        ],
        bump = pool.bump[0]
    )]
    pub pool: Account<'info, Pool>,
    
    pub underlying_token_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        seeds = [
            POOL_LP_MINT_SEED,
            underlying_token_mint.key().as_ref(),
            pool.pool_authority.as_ref()
        ],
        bump
    )]
    pub lp_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = underlying_token_mint,
        associated_token::authority = pool
    )]
    pub pool_underlying_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = underlying_token_mint,
        associated_token::authority = user
    )]
    pub user_underlying_ata: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = lp_mint,
        associated_token::authority = user
    )]
    pub user_lp_ata: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Withdraw tokens from pool
#[derive(Accounts)]
pub struct PoolWithdraw<'info> {
    #[account(
        seeds = [WHISKY_STATE_SEED],
        bump = whisky_state.bump[0]
    )]
    pub whisky_state: Account<'info, WhiskyState>,
    
    #[account(
        seeds = [
            POOL_SEED,
            underlying_token_mint.key().as_ref(),
            pool.pool_authority.as_ref()
        ],
        bump = pool.bump[0]
    )]
    pub pool: Account<'info, Pool>,
    
    pub underlying_token_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        seeds = [
            POOL_LP_MINT_SEED,
            underlying_token_mint.key().as_ref(),
            pool.pool_authority.as_ref()
        ],
        bump
    )]
    pub lp_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = underlying_token_mint,
        associated_token::authority = pool
    )]
    pub pool_underlying_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = underlying_token_mint,
        associated_token::authority = user
    )]
    pub user_underlying_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = lp_mint,
        associated_token::authority = user
    )]
    pub user_lp_ata: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Initialize player account
#[derive(Accounts)]
pub struct PlayerInitialize<'info> {
    #[account(
        init,
        payer = user,
        space = Player::SPACE,
        seeds = [PLAYER_SEED, user.key().as_ref()],
        bump
    )]
    pub player: Account<'info, Player>,
    
    #[account(
        init,
        payer = user,
        space = Game::SPACE,
        seeds = [GAME_SEED, user.key().as_ref()],
        bump
    )]
    pub game: Account<'info, Game>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

/// Play a game
#[derive(Accounts)]
pub struct PlayGame<'info> {
    #[account(
        seeds = [WHISKY_STATE_SEED],
        bump = whisky_state.bump[0]
    )]
    pub whisky_state: Account<'info, WhiskyState>,
    
    #[account(
        seeds = [
            POOL_SEED,
            underlying_token_mint.key().as_ref(),
            pool.pool_authority.as_ref()
        ],
        bump = pool.bump[0]
    )]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        seeds = [PLAYER_SEED, user.key().as_ref()],
        bump = player.bump[0],
        has_one = user
    )]
    pub player: Account<'info, Player>,
    
    #[account(
        mut,
        seeds = [GAME_SEED, user.key().as_ref()],
        bump = game.bump[0],
        has_one = user
    )]
    pub game: Account<'info, Game>,
    
    pub underlying_token_mint: Account<'info, Mint>,
    
    #[account(
        associated_token::mint = underlying_token_mint,
        associated_token::authority = pool
    )]
    pub pool_underlying_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = underlying_token_mint,
        associated_token::authority = user
    )]
    pub user_underlying_ata: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = underlying_token_mint,
        associated_token::authority = player
    )]
    pub player_ata: Account<'info, TokenAccount>,
    
    /// CHECK: Game creator can be any account
    pub creator: AccountInfo<'info>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

/// Claim winnings
#[derive(Accounts)]
pub struct PlayerClaim<'info> {
    #[account(
        seeds = [PLAYER_SEED, user.key().as_ref()],
        bump = player.bump[0],
        has_one = user
    )]
    pub player: Account<'info, Player>,
    
    #[account(
        seeds = [GAME_SEED, user.key().as_ref()],
        bump = game.bump[0],
        has_one = user
    )]
    pub game: Account<'info, Game>,
    
    pub underlying_token_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = underlying_token_mint,
        associated_token::authority = player
    )]
    pub player_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = underlying_token_mint,
        associated_token::authority = user
    )]
    pub user_underlying_ata: Account<'info, TokenAccount>,
    
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

/// Close player account
#[derive(Accounts)]
pub struct PlayerClose<'info> {
    #[account(
        mut,
        close = user,
        seeds = [PLAYER_SEED, user.key().as_ref()],
        bump = player.bump[0],
        has_one = user
    )]
    pub player: Account<'info, Player>,
    
    #[account(
        mut,
        close = user,
        seeds = [GAME_SEED, user.key().as_ref()],
        bump = game.bump[0],
        has_one = user
    )]
    pub game: Account<'info, Game>,
    
    pub user: Signer<'info>,
}

/// RNG settlement
#[derive(Accounts)]
pub struct RngSettle<'info> {
    #[account(
        seeds = [WHISKY_STATE_SEED],
        bump = whisky_state.bump[0]
    )]
    pub whisky_state: Account<'info, WhiskyState>,
    
    #[account(
        mut,
        seeds = [GAME_SEED, game.user.as_ref()],
        bump = game.bump[0]
    )]
    pub game: Account<'info, Game>,
    
    #[account(
        associated_token::mint = underlying_token_mint,
        associated_token::authority = pool
    )]
    pub pool_underlying_token_account: Account<'info, TokenAccount>,
    
    #[account(
        associated_token::mint = underlying_token_mint,
        associated_token::authority = pool
    )]
    pub pool_jackpot_token_account: Account<'info, TokenAccount>,
    
    #[account(
        seeds = [
            POOL_SEED,
            underlying_token_mint.key().as_ref(),
            pool.pool_authority.as_ref()
        ],
        bump = pool.bump[0]
    )]
    pub pool: Account<'info, Pool>,
    
    pub underlying_token_mint: Account<'info, Mint>,
    
    pub rng: Signer<'info>,
}

/// RNG provide hashed seed
#[derive(Accounts)]
pub struct RngProvideHashedSeed<'info> {
    #[account(
        seeds = [WHISKY_STATE_SEED],
        bump = whisky_state.bump[0]
    )]
    pub whisky_state: Account<'info, WhiskyState>,
    
    #[account(
        mut,
        seeds = [GAME_SEED, game.user.as_ref()],
        bump = game.bump[0]
    )]
    pub game: Account<'info, Game>,
    
    pub rng: Signer<'info>,
}

/// Distribute fees
#[derive(Accounts)]
pub struct DistributeFees<'info> {
    #[account(
        seeds = [WHISKY_STATE_SEED],
        bump = whisky_state.bump[0],
        has_one = authority
    )]
    pub whisky_state: Account<'info, WhiskyState>,
    
    pub underlying_token_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = underlying_token_mint,
        associated_token::authority = whisky_state
    )]
    pub whisky_state_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = underlying_token_mint,
        associated_token::authority = whisky_state.distribution_recipient
    )]
    pub distribution_recipient_ata: Account<'info, TokenAccount>,
    
    pub authority: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
} 