use anchor_lang::prelude::*;
use crate::constants::*;

/// Global protocol state account
#[account]
pub struct WhiskyState {
    /// Protocol authority (admin)
    pub authority: Pubkey,
    /// RNG provider address
    pub rng_address: Pubkey,
    /// Secondary RNG provider address  
    pub rng_address_2: Pubkey,
    /// Anti-spam fee amount
    pub anti_spam_fee: u64,
    /// Protocol fee in basis points
    pub whisky_fee_bps: u64,
    /// Pool creation fee
    pub pool_creation_fee: u64,
    /// Default pool fee in basis points
    pub default_pool_fee: u64,
    /// Jackpot payout to user (BPS)
    pub jackpot_payout_to_user_bps: u64,
    /// Jackpot payout to creator (BPS)
    pub jackpot_payout_to_creator_bps: u64,
    /// Jackpot payout to pool (BPS)
    pub jackpot_payout_to_pool_bps: u64,
    /// Jackpot payout to protocol (BPS)
    pub jackpot_payout_to_whisky_bps: u64,
    /// Bonus to jackpot ratio (BPS)  
    pub bonus_to_jackpot_ratio_bps: u64,
    /// Maximum house edge allowed (BPS)
    pub max_house_edge_bps: u64,
    /// Maximum creator fee allowed (BPS)
    pub max_creator_fee_bps: u64,
    /// Maximum payout percentage (BPS)
    pub max_payout_bps: u64,
    /// Pool withdrawal fee (BPS)
    pub pool_withdraw_fee_bps: u64,
    /// Whether pool creation is allowed
    pub pool_creation_allowed: bool,
    /// Whether pool deposits are allowed
    pub pool_deposit_allowed: bool,
    /// Whether pool withdrawals are allowed
    pub pool_withdraw_allowed: bool,
    /// Whether playing games is allowed
    pub playing_allowed: bool,
    /// Fee distribution recipient
    pub distribution_recipient: Pubkey,
    /// PDA bump seed
    pub bump: [u8; 1],
}

impl WhiskyState {
    /// Calculate space needed for WhiskyState account
    pub const SPACE: usize = DISCRIMINATOR_SIZE 
        + PUBKEY_SIZE * 4  // authority, rng_address, rng_address_2, distribution_recipient
        + U64_SIZE * 12    // fee configurations
        + BOOL_SIZE * 4    // permission flags
        + 1;               // bump
}

/// Gaming pool account
#[account]
pub struct Pool {
    /// Pool authority (creator)
    pub pool_authority: Pubkey,
    /// Underlying token mint
    pub underlying_token_mint: Pubkey,
    /// Pool lookup address for identification
    pub lookup_address: Pubkey,
    /// Anti-spam fee exemption
    pub anti_spam_fee_exempt: bool,
    /// Minimum wager amount
    pub min_wager: u64,
    /// Number of games played
    pub plays: u64,
    /// Liquidity checkpoint
    pub liquidity_checkpoint: u64,
    /// Whether deposit limit is enabled
    pub deposit_limit: bool,
    /// Deposit limit amount
    pub deposit_limit_amount: u64,
    /// Whether custom pool fee is enabled
    pub custom_pool_fee: bool,
    /// Custom pool fee in BPS
    pub custom_pool_fee_bps: u64,
    /// Whether custom whisky fee is enabled
    pub custom_whisky_fee: bool,
    /// Custom whisky fee in BPS
    pub custom_whisky_fee_bps: u64,
    /// Whether custom max payout is enabled
    pub custom_max_payout: bool,
    /// Custom max payout in BPS
    pub custom_max_payout_bps: u64,
    /// Custom bonus token mint
    pub custom_bonus_token_mint: Pubkey,
    /// Whether custom bonus token is enabled
    pub custom_bonus_token: bool,
    /// Whether custom max creator fee is enabled
    pub custom_max_creator_fee: bool,
    /// Custom max creator fee in BPS
    pub custom_max_creator_fee_bps: u64,
    /// Whether deposit whitelist is required
    pub deposit_whitelist_required: bool,
    /// Deposit whitelist address
    pub deposit_whitelist_address: Pubkey,
    /// PDA bump seed
    pub bump: [u8; 1],
}

impl Pool {
    /// Calculate space needed for Pool account
    pub const SPACE: usize = DISCRIMINATOR_SIZE
        + PUBKEY_SIZE * 4  // pool_authority, underlying_token_mint, lookup_address, custom_bonus_token_mint, deposit_whitelist_address
        + BOOL_SIZE * 7    // boolean flags
        + U64_SIZE * 7     // numeric values
        + 1;               // bump
}

/// Player account for managing game state
#[account]
pub struct Player {
    /// Player's wallet address
    pub user: Pubkey,
    /// Current nonce for game sequence
    pub nonce: u64,
    /// PDA bump seed
    pub bump: [u8; 1],
}

impl Player {
    /// Calculate space needed for Player account
    pub const SPACE: usize = DISCRIMINATOR_SIZE
        + PUBKEY_SIZE      // user
        + U64_SIZE         // nonce
        + 1;               // bump
}

/// Game status enumeration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameStatus {
    /// No game in progress
    None,
    /// Waiting for RNG result
    ResultRequested,
    /// Game completed, ready to claim
    Ready,
}

/// Individual game account
#[account]
pub struct Game {
    /// Game nonce
    pub nonce: u64,
    /// Player's wallet address
    pub user: Pubkey,
    /// Token mint used for the game
    pub token_mint: Pubkey,
    /// Pool used for the game
    pub pool: Pubkey,
    /// Current game status
    pub status: GameStatus,
    /// Next RNG seed hash (for verification)
    pub next_rng_seed_hashed: String,
    /// RNG seed used for this game
    pub rng_seed: String,
    /// Game timestamp
    pub timestamp: i64,
    /// Game creator address
    pub creator: Pubkey,
    /// Creator metadata
    pub creator_meta: String,
    /// Wager amount
    pub wager: u64,
    /// Underlying tokens used
    pub underlying_used: u64,
    /// Bonus tokens used
    pub bonus_used: u64,
    /// Creator fee amount
    pub creator_fee: u64,
    /// Protocol fee amount
    pub whisky_fee: u64,
    /// Pool fee amount
    pub pool_fee: u64,
    /// Jackpot fee amount
    pub jackpot_fee: u64,
    /// Jackpot result (0 or 1)
    pub jackpot_result: u64,
    /// Jackpot probability in micro basis points
    pub jackpot_probability_ubps: u64,
    /// Jackpot payout amount
    pub jackpot_payout: u64,
    /// Client seed provided by player
    pub client_seed: String,
    /// Bet configuration (weights for each outcome)
    pub bet: Vec<u32>,
    /// Game result index
    pub result: u32,
    /// Whether points are enabled
    pub points: bool,
    /// Points authority
    pub points_authority: Pubkey,
    /// Game metadata
    pub metadata: String,
    /// PDA bump seed
    pub bump: [u8; 1],
}

impl Game {
    /// Calculate space needed for Game account
    pub const SPACE: usize = DISCRIMINATOR_SIZE
        + U64_SIZE * 12        // numeric fields
        + PUBKEY_SIZE * 4      // pubkey fields
        + 1                    // GameStatus enum
        + VEC_PREFIX_SIZE + (U32_SIZE * MAX_BET_OUTCOMES) // bet vector
        + U32_SIZE             // result
        + BOOL_SIZE            // points
        + PUBKEY_SIZE          // points_authority
        + MAX_STRING_LENGTH * 5 // string fields
        + 1;                   // bump
}

/// Pool action types for events
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum PoolAction {
    Deposit,
    Withdraw,
}

/// Pool change event
#[event]
pub struct PoolChange {
    pub user: Pubkey,
    pub pool: Pubkey,
    pub token_mint: Pubkey,
    pub action: PoolAction,
    pub amount: u64,
    pub post_liquidity: u64,
    pub lp_supply: u64,
}

/// Game settlement event
#[event]
pub struct GameSettled {
    pub user: Pubkey,
    pub pool: Pubkey,
    pub token_mint: Pubkey,
    pub creator: Pubkey,
    pub creator_fee: u64,
    pub whisky_fee: u64,
    pub pool_fee: u64,
    pub jackpot_fee: u64,
    pub underlying_used: u64,
    pub bonus_used: u64,
    pub wager: u64,
    pub payout: u64,
    pub multiplier_bps: u32,
    pub payout_from_bonus_pool: u64,
    pub payout_from_normal_pool: u64,
    pub jackpot_probability_ubps: u64,
    pub jackpot_result: u64,
    pub nonce: u64,
    pub client_seed: String,
    pub result_index: u32,
    pub bet: Vec<u32>,
    pub jackpot_payout_to_user: u64,
    pub pool_liquidity: u64,
    pub rng_seed: String,
    pub next_rng_seed_hashed: String,
    pub metadata: String,
} 