use anchor_lang::prelude::*;

/// Basis points per 100% (10,000 BPS = 100%)
pub const BPS_PER_WHOLE: u64 = 10_000;

/// Maximum number of bet outcomes allowed
pub const MAX_BET_OUTCOMES: usize = 256;

/// Minimum number of bet outcomes required
pub const MIN_BET_OUTCOMES: usize = 2;

/// PDA Seeds for account derivation
pub const WHISKY_STATE_SEED: &[u8] = b"WHISKY_STATE";
pub const GAME_SEED: &[u8] = b"GAME";
pub const PLAYER_SEED: &[u8] = b"PLAYER";
pub const POOL_SEED: &[u8] = b"POOL";
pub const POOL_ATA_SEED: &[u8] = b"POOL_ATA";
pub const POOL_JACKPOT_SEED: &[u8] = b"POOL_JACKPOT";
pub const POOL_BONUS_UNDERLYING_TA_SEED: &[u8] = b"POOL_BONUS_UNDERLYING_TA";
pub const POOL_BONUS_MINT_SEED: &[u8] = b"POOL_BONUS_MINT";
pub const POOL_LP_MINT_SEED: &[u8] = b"POOL_LP_MINT";
pub const ESCROW_SEED: &[u8] = b"ESCROW";

/// Default protocol configuration values
pub const DEFAULT_ANTI_SPAM_FEE: u64 = 100_000; // 0.0001 SOL
pub const DEFAULT_WHISKY_FEE_BPS: u64 = 200; // 2%
pub const DEFAULT_POOL_CREATION_FEE: u64 = 1_000_000; // 0.001 SOL
pub const DEFAULT_POOL_FEE_BPS: u64 = 100; // 1%
pub const DEFAULT_JACKPOT_PAYOUT_TO_USER_BPS: u64 = 7_000; // 70%
pub const DEFAULT_JACKPOT_PAYOUT_TO_CREATOR_BPS: u64 = 1_000; // 10%
pub const DEFAULT_JACKPOT_PAYOUT_TO_POOL_BPS: u64 = 1_000; // 10%
pub const DEFAULT_JACKPOT_PAYOUT_TO_WHISKY_BPS: u64 = 1_000; // 10%
pub const DEFAULT_BONUS_TO_JACKPOT_RATIO_BPS: u64 = 1_000; // 10%
pub const DEFAULT_MAX_HOUSE_EDGE_BPS: u64 = 300; // 3%
pub const DEFAULT_MAX_CREATOR_FEE_BPS: u64 = 500; // 5%
pub const DEFAULT_MAX_PAYOUT_BPS: u64 = 10_000; // 100%
pub const DEFAULT_POOL_WITHDRAW_FEE_BPS: u64 = 100; // 1%

/// Game-specific constants
pub const MAX_MULTIPLIER: u64 = 100_000; // 10x max multiplier in BPS
pub const MIN_WAGER: u64 = 1_000; // Minimum wager (0.000001 tokens for 6 decimals)
pub const JACKPOT_BASE_PROBABILITY: u64 = 1_000_000; // 0.0001% base jackpot chance

/// String length limits
pub const MAX_STRING_LENGTH: usize = 256;
pub const MAX_METADATA_LENGTH: usize = 512;

/// Account size constants
pub const DISCRIMINATOR_SIZE: usize = 8;
pub const PUBKEY_SIZE: usize = 32;
pub const U64_SIZE: usize = 8;
pub const U32_SIZE: usize = 4;
pub const BOOL_SIZE: usize = 1;
pub const VEC_PREFIX_SIZE: usize = 4; 