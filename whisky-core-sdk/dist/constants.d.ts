import { PublicKey } from '@solana/web3.js';
/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - CONSTANTS 🎯
 * ============================================================================
 */
export declare const WHISKY_PROGRAM_ID: PublicKey;
export declare const WHISKY_STATE_SEED = "WHISKY_STATE";
export declare const POOL_SEED = "POOL";
export declare const POOL_LP_MINT_SEED = "POOL_LP_MINT";
export declare const POOL_JACKPOT_SEED = "POOL_JACKPOT";
export declare const POOL_BONUS_MINT_SEED = "POOL_BONUS_MINT";
export declare const POOL_BONUS_UNDERLYING_TA_SEED = "POOL_BONUS_UNDERLYING_TA";
export declare const PLAYER_SEED = "PLAYER";
export declare const GAME_SEED = "GAME";
export declare const DEFAULT_WHISKY_FEE_BPS = 200;
export declare const DEFAULT_POOL_FEE_BPS = 100;
export declare const DEFAULT_MAX_CREATOR_FEE_BPS = 500;
export declare const DEFAULT_MAX_HOUSE_EDGE_BPS = 1000;
export declare const DEFAULT_MAX_PAYOUT_BPS = 10000;
export declare const DEFAULT_ANTI_SPAM_FEE = 5000;
export declare const DEFAULT_POOL_CREATION_FEE = 1000000;
export declare const DEFAULT_JACKPOT_PAYOUT_TO_USER_BPS = 7000;
export declare const DEFAULT_JACKPOT_PAYOUT_TO_CREATOR_BPS = 1000;
export declare const DEFAULT_JACKPOT_PAYOUT_TO_POOL_BPS = 1000;
export declare const DEFAULT_JACKPOT_PAYOUT_TO_WHISKY_BPS = 1000;
export declare const DEFAULT_BONUS_TO_JACKPOT_RATIO_BPS = 100;
export declare const MIN_BET_LENGTH = 2;
export declare const MAX_BET_LENGTH = 256;
export declare const MIN_BET_WEIGHT = 1;
export declare const MAX_BET_WEIGHT = 1000000;
export declare const TOKEN_METADATA_PROGRAM_ID: PublicKey;
export declare const BPS_DIVISOR = 10000;
export declare const UBPS_DIVISOR = 1000000;
export declare const DISCRIMINATOR_SIZE = 8;
export declare const PUBKEY_SIZE = 32;
export declare const U64_SIZE = 8;
export declare const U32_SIZE = 4;
export declare const BOOL_SIZE = 1;
export declare const STRING_SIZE = 4;
export declare const MAX_METADATA_LENGTH = 200;
export declare const MAX_CLIENT_SEED_LENGTH = 32;
export declare const MAX_RNG_SEED_LENGTH = 64;
export declare const MAX_CREATOR_META_LENGTH = 100;
export declare const COMMITMENT_LEVEL: "confirmed";
export declare const PREFLIGHT_COMMITMENT: "processed";
export declare const WHISKY_ERROR_CODES: {
    readonly INSUFFICIENT_BALANCE: 6000;
    readonly INVALID_BET: 6001;
    readonly POOL_NOT_FOUND: 6002;
    readonly GAME_NOT_FOUND: 6003;
    readonly UNAUTHORIZED: 6004;
    readonly INVALID_AMOUNT: 6005;
    readonly PAYOUT_EXCEEDS_LIMIT: 6006;
    readonly GAME_ALREADY_SETTLED: 6007;
    readonly RNG_NOT_READY: 6008;
    readonly INVALID_CREATOR_FEE: 6009;
    readonly PROTOCOL_DISABLED: 6010;
};
export declare const SDK_VERSION = "1.0.0";
export declare const PROGRAM_VERSION = "1.0.0";
