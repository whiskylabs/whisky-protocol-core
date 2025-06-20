"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROGRAM_VERSION = exports.SDK_VERSION = exports.WHISKY_ERROR_CODES = exports.PREFLIGHT_COMMITMENT = exports.COMMITMENT_LEVEL = exports.MAX_CREATOR_META_LENGTH = exports.MAX_RNG_SEED_LENGTH = exports.MAX_CLIENT_SEED_LENGTH = exports.MAX_METADATA_LENGTH = exports.STRING_SIZE = exports.BOOL_SIZE = exports.U32_SIZE = exports.U64_SIZE = exports.PUBKEY_SIZE = exports.DISCRIMINATOR_SIZE = exports.UBPS_DIVISOR = exports.BPS_DIVISOR = exports.TOKEN_METADATA_PROGRAM_ID = exports.MAX_BET_WEIGHT = exports.MIN_BET_WEIGHT = exports.MAX_BET_LENGTH = exports.MIN_BET_LENGTH = exports.DEFAULT_BONUS_TO_JACKPOT_RATIO_BPS = exports.DEFAULT_JACKPOT_PAYOUT_TO_WHISKY_BPS = exports.DEFAULT_JACKPOT_PAYOUT_TO_POOL_BPS = exports.DEFAULT_JACKPOT_PAYOUT_TO_CREATOR_BPS = exports.DEFAULT_JACKPOT_PAYOUT_TO_USER_BPS = exports.DEFAULT_POOL_CREATION_FEE = exports.DEFAULT_ANTI_SPAM_FEE = exports.DEFAULT_MAX_PAYOUT_BPS = exports.DEFAULT_MAX_HOUSE_EDGE_BPS = exports.DEFAULT_MAX_CREATOR_FEE_BPS = exports.DEFAULT_POOL_FEE_BPS = exports.DEFAULT_WHISKY_FEE_BPS = exports.GAME_SEED = exports.PLAYER_SEED = exports.POOL_BONUS_UNDERLYING_TA_SEED = exports.POOL_BONUS_MINT_SEED = exports.POOL_JACKPOT_SEED = exports.POOL_LP_MINT_SEED = exports.POOL_SEED = exports.WHISKY_STATE_SEED = exports.WHISKY_PROGRAM_ID = void 0;
const web3_js_1 = require("@solana/web3.js");
/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - CONSTANTS 🎯
 * ============================================================================
 */
// Program ID
exports.WHISKY_PROGRAM_ID = new web3_js_1.PublicKey('Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw');
// Account Seeds
exports.WHISKY_STATE_SEED = 'WHISKY_STATE';
exports.POOL_SEED = 'POOL';
exports.POOL_LP_MINT_SEED = 'POOL_LP_MINT';
exports.POOL_JACKPOT_SEED = 'POOL_JACKPOT';
exports.POOL_BONUS_MINT_SEED = 'POOL_BONUS_MINT';
exports.POOL_BONUS_UNDERLYING_TA_SEED = 'POOL_BONUS_UNDERLYING_TA';
exports.PLAYER_SEED = 'PLAYER';
exports.GAME_SEED = 'GAME';
// Default Configuration Values
exports.DEFAULT_WHISKY_FEE_BPS = 200; // 2%
exports.DEFAULT_POOL_FEE_BPS = 100; // 1%
exports.DEFAULT_MAX_CREATOR_FEE_BPS = 500; // 5%
exports.DEFAULT_MAX_HOUSE_EDGE_BPS = 1000; // 10%
exports.DEFAULT_MAX_PAYOUT_BPS = 10000; // 100%
exports.DEFAULT_ANTI_SPAM_FEE = 5000; // 0.005 SOL
exports.DEFAULT_POOL_CREATION_FEE = 1000000; // 0.001 SOL
// Jackpot Configuration
exports.DEFAULT_JACKPOT_PAYOUT_TO_USER_BPS = 7000; // 70%
exports.DEFAULT_JACKPOT_PAYOUT_TO_CREATOR_BPS = 1000; // 10%
exports.DEFAULT_JACKPOT_PAYOUT_TO_POOL_BPS = 1000; // 10%
exports.DEFAULT_JACKPOT_PAYOUT_TO_WHISKY_BPS = 1000; // 10%
exports.DEFAULT_BONUS_TO_JACKPOT_RATIO_BPS = 100; // 1%
// Game Configuration
exports.MIN_BET_LENGTH = 2;
exports.MAX_BET_LENGTH = 20;
exports.MIN_BET_WEIGHT = 1;
exports.MAX_BET_WEIGHT = 1000000;
// Token Programs
exports.TOKEN_METADATA_PROGRAM_ID = new web3_js_1.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
// Basis Points
exports.BPS_DIVISOR = 10000;
exports.UBPS_DIVISOR = 1000000;
// Account Sizes (for rent calculation)
exports.DISCRIMINATOR_SIZE = 8;
exports.PUBKEY_SIZE = 32;
exports.U64_SIZE = 8;
exports.U32_SIZE = 4;
exports.BOOL_SIZE = 1;
exports.STRING_SIZE = 4; // String length prefix
// Maximum String Lengths
exports.MAX_METADATA_LENGTH = 200;
exports.MAX_CLIENT_SEED_LENGTH = 32;
exports.MAX_RNG_SEED_LENGTH = 64;
exports.MAX_CREATOR_META_LENGTH = 100;
// Network Configuration
exports.COMMITMENT_LEVEL = 'confirmed';
exports.PREFLIGHT_COMMITMENT = 'processed';
// Error Codes
exports.WHISKY_ERROR_CODES = {
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
};
// Version Information
exports.SDK_VERSION = '1.0.0';
exports.PROGRAM_VERSION = '1.0.0';
