import { PublicKey } from '@solana/web3.js';

/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - CONSTANTS 🎯
 * ============================================================================
 */

// Program ID
export const WHISKY_PROGRAM_ID = new PublicKey('Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw');

// Account Seeds
export const WHISKY_STATE_SEED = 'WHISKY_STATE';
export const POOL_SEED = 'POOL';
export const POOL_LP_MINT_SEED = 'POOL_LP_MINT';
export const POOL_JACKPOT_SEED = 'POOL_JACKPOT';
export const POOL_BONUS_MINT_SEED = 'POOL_BONUS_MINT';
export const POOL_BONUS_UNDERLYING_TA_SEED = 'POOL_BONUS_UNDERLYING_TA';
export const PLAYER_SEED = 'PLAYER';
export const GAME_SEED = 'GAME';

// Default Configuration Values
export const DEFAULT_WHISKY_FEE_BPS = 200; // 2%
export const DEFAULT_POOL_FEE_BPS = 100; // 1%
export const DEFAULT_MAX_CREATOR_FEE_BPS = 500; // 5%
export const DEFAULT_MAX_HOUSE_EDGE_BPS = 1000; // 10%
export const DEFAULT_MAX_PAYOUT_BPS = 10000; // 100%
export const DEFAULT_ANTI_SPAM_FEE = 5000; // 0.005 SOL
export const DEFAULT_POOL_CREATION_FEE = 1000000; // 0.001 SOL

// Jackpot Configuration
export const DEFAULT_JACKPOT_PAYOUT_TO_USER_BPS = 7000; // 70%
export const DEFAULT_JACKPOT_PAYOUT_TO_CREATOR_BPS = 1000; // 10%
export const DEFAULT_JACKPOT_PAYOUT_TO_POOL_BPS = 1000; // 10%
export const DEFAULT_JACKPOT_PAYOUT_TO_WHISKY_BPS = 1000; // 10%
export const DEFAULT_BONUS_TO_JACKPOT_RATIO_BPS = 100; // 1%

// Game Configuration
export const MIN_BET_LENGTH = 2;
export const MAX_BET_LENGTH = 20;
export const MIN_BET_WEIGHT = 1;
export const MAX_BET_WEIGHT = 1000000;

// Token Programs
export const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Basis Points
export const BPS_DIVISOR = 10000;
export const UBPS_DIVISOR = 1000000;

// Account Sizes (for rent calculation)
export const DISCRIMINATOR_SIZE = 8;
export const PUBKEY_SIZE = 32;
export const U64_SIZE = 8;
export const U32_SIZE = 4;
export const BOOL_SIZE = 1;
export const STRING_SIZE = 4; // String length prefix

// Maximum String Lengths
export const MAX_METADATA_LENGTH = 200;
export const MAX_CLIENT_SEED_LENGTH = 32;
export const MAX_RNG_SEED_LENGTH = 64;
export const MAX_CREATOR_META_LENGTH = 100;

// Network Configuration
export const COMMITMENT_LEVEL = 'confirmed' as const;
export const PREFLIGHT_COMMITMENT = 'processed' as const;

// Error Codes
export const WHISKY_ERROR_CODES = {
  INSUFFICIENT_BALANCE: 6000,
  INVALID_BET: 6001,
  POOL_NOT_FOUND: 6002,
  GAME_NOT_FOUND: 6003,
  UNAUTHORIZED: 6004,
  INVALID_AMOUNT: 6005,
  PAYOUT_EXCEEDS_LIMIT: 6006,
  GAME_ALREADY_SETTLED: 6007,
  RNG_NOT_READY: 6008,
  INVALID_CREATOR_FEE: 6009,
  PROTOCOL_DISABLED: 6010,
} as const;

// Version Information
export const SDK_VERSION = '1.0.0';
export const PROGRAM_VERSION = '1.0.0'; 