"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryWithBackoff = exports.sleep = exports.parseProgramError = exports.generateMetadata = exports.generateClientSeed = exports.accountExists = exports.safeGetAccountInfo = exports.formatMultiplier = exports.formatPercentage = exports.parseTokenAmount = exports.formatTokenAmount = exports.validateWager = exports.validateBet = exports.calculateFees = exports.calculateExpectedPayout = exports.calculateWithdrawAmount = exports.calculateLpTokens = exports.ubpsToDecimal = exports.percentToBps = exports.bpsToPercent = exports.isNativeSOL = exports.getUserLpTokenAccount = exports.getPoolTokenAccount = exports.getUserTokenAccount = exports.deriveGamePDA = exports.derivePlayerPDA = exports.derivePoolBonusUnderlyingPDA = exports.derivePoolBonusMintPDA = exports.derivePoolJackpotPDA = exports.derivePoolLpMintPDA = exports.derivePoolPDA = exports.deriveWhiskyStatePDA = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const bn_js_1 = __importDefault(require("bn.js"));
const constants_1 = require("./constants");
/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - UTILITY FUNCTIONS 🛠️
 * ============================================================================
 */
// ================================
// PDA DERIVATION FUNCTIONS
// ================================
/**
 * Derive the Whisky State PDA
 */
function deriveWhiskyStatePDA(programId = constants_1.WHISKY_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(constants_1.WHISKY_STATE_SEED)], programId);
}
exports.deriveWhiskyStatePDA = deriveWhiskyStatePDA;
/**
 * Derive a Pool PDA
 */
function derivePoolPDA(tokenMint, authority, programId = constants_1.WHISKY_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(constants_1.POOL_SEED),
        tokenMint.toBuffer(),
        authority.toBuffer()
    ], programId);
}
exports.derivePoolPDA = derivePoolPDA;
/**
 * Derive Pool LP Mint PDA
 */
function derivePoolLpMintPDA(tokenMint, authority, programId = constants_1.WHISKY_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(constants_1.POOL_LP_MINT_SEED),
        tokenMint.toBuffer(),
        authority.toBuffer()
    ], programId);
}
exports.derivePoolLpMintPDA = derivePoolLpMintPDA;
/**
 * Derive Pool Jackpot Token Account PDA
 */
function derivePoolJackpotPDA(pool, programId = constants_1.WHISKY_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(constants_1.POOL_JACKPOT_SEED),
        pool.toBuffer()
    ], programId);
}
exports.derivePoolJackpotPDA = derivePoolJackpotPDA;
/**
 * Derive Pool Bonus Mint PDA
 */
function derivePoolBonusMintPDA(pool, programId = constants_1.WHISKY_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(constants_1.POOL_BONUS_MINT_SEED),
        pool.toBuffer()
    ], programId);
}
exports.derivePoolBonusMintPDA = derivePoolBonusMintPDA;
/**
 * Derive Pool Bonus Underlying Token Account PDA
 */
function derivePoolBonusUnderlyingPDA(pool, programId = constants_1.WHISKY_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(constants_1.POOL_BONUS_UNDERLYING_TA_SEED),
        pool.toBuffer()
    ], programId);
}
exports.derivePoolBonusUnderlyingPDA = derivePoolBonusUnderlyingPDA;
/**
 * Derive Player PDA
 */
function derivePlayerPDA(user, programId = constants_1.WHISKY_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(constants_1.PLAYER_SEED),
        user.toBuffer()
    ], programId);
}
exports.derivePlayerPDA = derivePlayerPDA;
/**
 * Derive Game PDA
 */
function deriveGamePDA(user, programId = constants_1.WHISKY_PROGRAM_ID) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from(constants_1.GAME_SEED),
        user.toBuffer()
    ], programId);
}
exports.deriveGamePDA = deriveGamePDA;
// ================================
// TOKEN ACCOUNT HELPERS
// ================================
/**
 * Get Associated Token Address for a user and mint
 */
function getUserTokenAccount(user, mint) {
    return (0, spl_token_1.getAssociatedTokenAddressSync)(mint, user);
}
exports.getUserTokenAccount = getUserTokenAccount;
/**
 * Get Associated Token Address for a pool and mint (PDA as owner)
 */
function getPoolTokenAccount(pool, mint) {
    return (0, spl_token_1.getAssociatedTokenAddressSync)(mint, pool, true);
}
exports.getPoolTokenAccount = getPoolTokenAccount;
/**
 * Get User's LP Token Account for a specific pool
 */
function getUserLpTokenAccount(user, tokenMint, authority) {
    const [lpMint] = derivePoolLpMintPDA(tokenMint, authority);
    return (0, spl_token_1.getAssociatedTokenAddressSync)(lpMint, user);
}
exports.getUserLpTokenAccount = getUserLpTokenAccount;
/**
 * Check if token is native SOL
 */
function isNativeSOL(mint) {
    return mint.equals(spl_token_1.NATIVE_MINT);
}
exports.isNativeSOL = isNativeSOL;
// ================================
// MATHEMATICAL CALCULATIONS
// ================================
/**
 * Convert basis points to decimal percentage
 */
function bpsToPercent(bps) {
    return bps / constants_1.BPS_DIVISOR;
}
exports.bpsToPercent = bpsToPercent;
/**
 * Convert percentage to basis points
 */
function percentToBps(percent) {
    return Math.round(percent * constants_1.BPS_DIVISOR);
}
exports.percentToBps = percentToBps;
/**
 * Convert micro basis points to decimal
 */
function ubpsToDecimal(ubps) {
    return ubps / constants_1.UBPS_DIVISOR;
}
exports.ubpsToDecimal = ubpsToDecimal;
/**
 * Calculate LP tokens to mint for a deposit
 */
function calculateLpTokens(depositAmount, poolLiquidity, lpSupply) {
    const deposit = new bn_js_1.default(depositAmount);
    const liquidity = new bn_js_1.default(poolLiquidity);
    const supply = new bn_js_1.default(lpSupply);
    // If no supply exists, return deposit amount
    if (supply.isZero()) {
        return deposit;
    }
    // LP tokens = (deposit * lpSupply) / poolLiquidity
    return deposit.mul(supply).div(liquidity);
}
exports.calculateLpTokens = calculateLpTokens;
/**
 * Calculate tokens to withdraw for LP tokens
 */
function calculateWithdrawAmount(lpTokens, poolLiquidity, lpSupply) {
    const lp = new bn_js_1.default(lpTokens);
    const liquidity = new bn_js_1.default(poolLiquidity);
    const supply = new bn_js_1.default(lpSupply);
    if (supply.isZero()) {
        return new bn_js_1.default(0);
    }
    // Withdraw amount = (lpTokens * poolLiquidity) / lpSupply
    return lp.mul(liquidity).div(supply);
}
exports.calculateWithdrawAmount = calculateWithdrawAmount;
/**
 * Calculate expected payout for a bet
 */
function calculateExpectedPayout(bet, wager, houseEdgeBps = 200) {
    const wagerBN = new bn_js_1.default(wager);
    const totalWeight = bet.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) {
        throw new Error('Total bet weight cannot be zero');
    }
    // Calculate individual outcome probabilities and payouts
    const outcomes = bet.map(weight => {
        const probability = weight / totalWeight;
        const rawMultiplier = totalWeight / weight;
        const adjustedMultiplier = rawMultiplier * (1 - bpsToPercent(houseEdgeBps));
        const payout = wagerBN.mul(new bn_js_1.default(Math.floor(adjustedMultiplier * constants_1.BPS_DIVISOR))).div(new bn_js_1.default(constants_1.BPS_DIVISOR));
        return {
            probability,
            multiplier: adjustedMultiplier,
            payout,
            weight
        };
    });
    // Find maximum payout (for the outcome with highest multiplier)
    const maxPayout = outcomes.reduce((max, outcome) => outcome.payout.gt(max) ? outcome.payout : max, new bn_js_1.default(0));
    // Calculate weighted average multiplier
    const weightedMultiplier = outcomes.reduce((sum, outcome) => sum + (outcome.multiplier * outcome.probability), 0);
    return {
        totalPayout: maxPayout,
        multiplierBps: Math.floor(weightedMultiplier * constants_1.BPS_DIVISOR),
        probability: 1 / outcomes.length, // Average probability
        houseEdge: bpsToPercent(houseEdgeBps),
        expectedValue: weightedMultiplier
    };
}
exports.calculateExpectedPayout = calculateExpectedPayout;
/**
 * Calculate fee breakdown for a wager
 */
function calculateFees(wager, creatorFeeBps = 0, whiskyFeeBps = 200, poolFeeBps = 100, jackpotFeeBps = 50) {
    const wagerBN = new bn_js_1.default(wager);
    const creatorFee = wagerBN.mul(new bn_js_1.default(creatorFeeBps)).div(new bn_js_1.default(constants_1.BPS_DIVISOR));
    const whiskyFee = wagerBN.mul(new bn_js_1.default(whiskyFeeBps)).div(new bn_js_1.default(constants_1.BPS_DIVISOR));
    const poolFee = wagerBN.mul(new bn_js_1.default(poolFeeBps)).div(new bn_js_1.default(constants_1.BPS_DIVISOR));
    const jackpotFee = wagerBN.mul(new bn_js_1.default(jackpotFeeBps)).div(new bn_js_1.default(constants_1.BPS_DIVISOR));
    const totalFees = creatorFee.add(whiskyFee).add(poolFee).add(jackpotFee);
    const netWager = wagerBN.sub(totalFees);
    return {
        creatorFee,
        whiskyFee,
        poolFee,
        jackpotFee,
        totalFees,
        netWager
    };
}
exports.calculateFees = calculateFees;
// ================================
// VALIDATION FUNCTIONS
// ================================
/**
 * Validate a bet configuration
 */
function validateBet(bet) {
    const errors = [];
    let isValid = true;
    // Check bet length
    if (bet.length < constants_1.MIN_BET_LENGTH) {
        errors.push(`Bet must have at least ${constants_1.MIN_BET_LENGTH} outcomes`);
        isValid = false;
    }
    if (bet.length > constants_1.MAX_BET_LENGTH) {
        errors.push(`Bet cannot have more than ${constants_1.MAX_BET_LENGTH} outcomes`);
        isValid = false;
    }
    // Check individual weights
    for (let i = 0; i < bet.length; i++) {
        if (bet[i] < constants_1.MIN_BET_WEIGHT) {
            errors.push(`Bet weight ${i} must be at least ${constants_1.MIN_BET_WEIGHT}`);
            isValid = false;
        }
        if (bet[i] > constants_1.MAX_BET_WEIGHT) {
            errors.push(`Bet weight ${i} cannot exceed ${constants_1.MAX_BET_WEIGHT}`);
            isValid = false;
        }
    }
    const totalWeight = bet.reduce((sum, weight) => sum + weight, 0);
    // Calculate max payout and house edge
    const minWeight = Math.min(...bet);
    const maxMultiplier = minWeight > 0 ? totalWeight / minWeight : 0;
    const maxPayout = new bn_js_1.default(Math.floor(Math.max(0, maxMultiplier * constants_1.BPS_DIVISOR)));
    const houseEdge = 0; // This would be set by pool configuration
    return {
        isValid,
        errors,
        totalWeight,
        outcomes: bet.length,
        maxPayout,
        houseEdge
    };
}
exports.validateBet = validateBet;
/**
 * Validate a wager amount
 */
function validateWager(wager, minWager, maxWager, availableLiquidity) {
    const wagerBN = new bn_js_1.default(wager);
    const minWagerBN = new bn_js_1.default(minWager);
    const maxWagerBN = new bn_js_1.default(maxWager);
    const liquidityBN = new bn_js_1.default(availableLiquidity);
    const errors = [];
    let isValid = true;
    if (wagerBN.lt(minWagerBN)) {
        errors.push(`Wager must be at least ${minWagerBN.toString()}`);
        isValid = false;
    }
    if (wagerBN.gt(maxWagerBN)) {
        errors.push(`Wager cannot exceed ${maxWagerBN.toString()}`);
        isValid = false;
    }
    if (wagerBN.gt(liquidityBN)) {
        errors.push(`Insufficient liquidity. Available: ${liquidityBN.toString()}`);
        isValid = false;
    }
    return {
        isValid,
        errors,
        minWager: minWagerBN,
        maxWager: maxWagerBN,
        availableLiquidity: liquidityBN
    };
}
exports.validateWager = validateWager;
// ================================
// FORMATTING FUNCTIONS
// ================================
/**
 * Format a BN amount with decimals
 */
function formatTokenAmount(amount, decimals = 9) {
    const divisor = new bn_js_1.default(10).pow(new bn_js_1.default(decimals));
    const quotient = amount.div(divisor);
    const remainder = amount.mod(divisor);
    if (remainder.isZero()) {
        return quotient.toString();
    }
    const remainderStr = remainder.toString().padStart(decimals, '0');
    const trimmedRemainder = remainderStr.replace(/0+$/, '');
    return trimmedRemainder ? `${quotient}.${trimmedRemainder}` : quotient.toString();
}
exports.formatTokenAmount = formatTokenAmount;
/**
 * Parse a token amount string to BN
 */
function parseTokenAmount(amount, decimals = 9) {
    const [whole, fractional = ''] = amount.split('.');
    const wholeBN = new bn_js_1.default(whole || '0');
    if (!fractional) {
        return wholeBN.mul(new bn_js_1.default(10).pow(new bn_js_1.default(decimals)));
    }
    const fractionalPadded = fractional.padEnd(decimals, '0').slice(0, decimals);
    const fractionalBN = new bn_js_1.default(fractionalPadded);
    return wholeBN.mul(new bn_js_1.default(10).pow(new bn_js_1.default(decimals))).add(fractionalBN);
}
exports.parseTokenAmount = parseTokenAmount;
/**
 * Format percentage with specified decimal places
 */
function formatPercentage(value, decimals = 2) {
    return `${(value * 100).toFixed(decimals)}%`;
}
exports.formatPercentage = formatPercentage;
/**
 * Format multiplier (e.g., 2.5x)
 */
function formatMultiplier(multiplierBps) {
    const multiplier = multiplierBps / constants_1.BPS_DIVISOR;
    return `${multiplier.toFixed(2)}x`;
}
exports.formatMultiplier = formatMultiplier;
// ================================
// ACCOUNT FETCHING HELPERS
// ================================
/**
 * Safely fetch account info
 */
async function safeGetAccountInfo(connection, address) {
    try {
        return await connection.getAccountInfo(address);
    }
    catch (error) {
        console.warn(`Failed to fetch account ${address.toString()}:`, error);
        return null;
    }
}
exports.safeGetAccountInfo = safeGetAccountInfo;
/**
 * Check if account exists
 */
async function accountExists(connection, address) {
    const accountInfo = await safeGetAccountInfo(connection, address);
    return accountInfo !== null;
}
exports.accountExists = accountExists;
// ================================
// RANDOM GENERATION HELPERS
// ================================
/**
 * Generate a random client seed
 */
function generateClientSeed() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
exports.generateClientSeed = generateClientSeed;
/**
 * Generate random metadata
 */
function generateMetadata(prefix = 'Game') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}`;
}
exports.generateMetadata = generateMetadata;
// ================================
// ERROR HANDLING HELPERS
// ================================
/**
 * Parse program error from transaction error
 */
function parseProgramError(error) {
    if (error?.error?.errorCode) {
        return {
            code: error.error.errorCode.code,
            message: error.error.errorCode.message || 'Unknown program error'
        };
    }
    if (error?.message) {
        return { message: error.message };
    }
    return { message: 'Unknown error occurred' };
}
exports.parseProgramError = parseProgramError;
/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
/**
 * Retry async operation with exponential backoff
 */
async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (i === maxRetries) {
                throw lastError;
            }
            const delay = baseDelay * Math.pow(2, i);
            await sleep(delay);
        }
    }
    throw lastError;
}
exports.retryWithBackoff = retryWithBackoff;
