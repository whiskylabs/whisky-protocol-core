"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETRY_DELAY = exports.MAX_RETRIES = exports.DEFAULT_COMMITMENT = exports.BASIS_POINTS_SCALE = exports.PROGRAM_ID = void 0;
exports.deriveWhiskyStatePDA = deriveWhiskyStatePDA;
exports.derivePoolPDA = derivePoolPDA;
exports.deriveLpMintPDA = deriveLpMintPDA;
exports.derivePlayerPDA = derivePlayerPDA;
exports.deriveGamePDA = deriveGamePDA;
exports.calculateLpTokens = calculateLpTokens;
exports.calculateWithdrawalAmount = calculateWithdrawalAmount;
exports.calculateExpectedReturn = calculateExpectedReturn;
exports.calculateHouseEdge = calculateHouseEdge;
exports.calculatePoolUtilization = calculatePoolUtilization;
exports.calculateAPY = calculateAPY;
exports.validateBet = validateBet;
exports.validateWager = validateWager;
exports.formatTokenAmount = formatTokenAmount;
exports.formatPercentage = formatPercentage;
exports.formatCurrency = formatCurrency;
exports.bnToNumber = bnToNumber;
exports.numberToBN = numberToBN;
exports.generateClientSeed = generateClientSeed;
exports.hashSeed = hashSeed;
exports.getCurrentTimestamp = getCurrentTimestamp;
exports.formatTimestamp = formatTimestamp;
exports.getTimeDifference = getTimeDifference;
exports.parseAnchorError = parseAnchorError;
exports.retryOperation = retryOperation;
exports.calculateWinRate = calculateWinRate;
exports.calculateROI = calculateROI;
exports.calculateSharpeRatio = calculateSharpeRatio;
exports.isPublicKey = isPublicKey;
exports.isBN = isBN;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - UTILITY FUNCTIONS 🛠️
 * ============================================================================
 */
// ================================
// PDA DERIVATION UTILITIES
// ================================
/**
 * Derive the Whisky State PDA
 */
function deriveWhiskyStatePDA(programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('WHISKY_STATE')], programId);
}
/**
 * Derive Pool PDA
 */
function derivePoolPDA(tokenMint, poolAuthority, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from('POOL'),
        tokenMint.toBuffer(),
        poolAuthority.toBuffer(),
    ], programId);
}
/**
 * Derive LP Mint PDA
 */
function deriveLpMintPDA(tokenMint, poolAuthority, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from('POOL_LP_MINT'),
        tokenMint.toBuffer(),
        poolAuthority.toBuffer(),
    ], programId);
}
/**
 * Derive Player PDA
 */
function derivePlayerPDA(user, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('PLAYER'), user.toBuffer()], programId);
}
/**
 * Derive Game PDA
 */
function deriveGamePDA(user, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('GAME'), user.toBuffer()], programId);
}
// ================================
// CALCULATION UTILITIES
// ================================
/**
 * Calculate LP tokens for deposit
 */
function calculateLpTokens(depositAmount, poolLiquidity, lpSupply) {
    if (lpSupply === 0) {
        return depositAmount; // First deposit gets 1:1 ratio
    }
    return (depositAmount * lpSupply) / poolLiquidity;
}
/**
 * Calculate withdrawal amount from LP tokens
 */
function calculateWithdrawalAmount(lpTokens, poolLiquidity, lpSupply) {
    if (lpSupply === 0)
        return 0;
    return (lpTokens * poolLiquidity) / lpSupply;
}
/**
 * Calculate expected return from bet
 */
function calculateExpectedReturn(bet, wager) {
    const totalWeight = bet.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0)
        return 0;
    // Expected value calculation
    return bet.reduce((expectedValue, weight, index) => {
        const probability = weight / totalWeight;
        const payout = wager * (totalWeight / weight);
        return expectedValue + (probability * payout);
    }, 0);
}
/**
 * Calculate house edge for a pool
 */
function calculateHouseEdge(totalVolume, totalPayouts, feesCollected) {
    if (totalVolume === 0)
        return 0;
    return ((totalVolume - totalPayouts - feesCollected) / totalVolume) * 100;
}
/**
 * Calculate pool utilization
 */
function calculatePoolUtilization(activeWagers, totalLiquidity) {
    if (totalLiquidity === 0)
        return 0;
    return (activeWagers / totalLiquidity) * 100;
}
/**
 * Calculate APY for LP providers
 */
function calculateAPY(feesEarned24h, totalLiquidity) {
    if (totalLiquidity === 0)
        return 0;
    const dailyRate = feesEarned24h / totalLiquidity;
    return ((Math.pow(1 + dailyRate, 365) - 1) * 100);
}
// ================================
// VALIDATION UTILITIES
// ================================
/**
 * Validate bet array
 */
function validateBet(bet) {
    if (!bet || bet.length === 0) {
        return { valid: false, error: 'Bet array cannot be empty' };
    }
    if (bet.some(weight => weight < 0)) {
        return { valid: false, error: 'Bet weights cannot be negative' };
    }
    const totalWeight = bet.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) {
        return { valid: false, error: 'Total bet weight cannot be zero' };
    }
    return { valid: true };
}
/**
 * Validate wager amount
 */
function validateWager(amount, minWager, maxWager, poolLiquidity) {
    if (amount <= 0) {
        return { valid: false, error: 'Wager amount must be positive' };
    }
    if (amount < minWager) {
        return { valid: false, error: `Wager below minimum: ${minWager}` };
    }
    if (amount > maxWager) {
        return { valid: false, error: `Wager above maximum: ${maxWager}` };
    }
    // Check if pool has enough liquidity for max potential payout
    const maxPayout = amount * 10; // Conservative estimate
    if (maxPayout > poolLiquidity * 0.5) {
        return { valid: false, error: 'Insufficient pool liquidity for this wager' };
    }
    return { valid: true };
}
// ================================
// FORMATTING UTILITIES
// ================================
/**
 * Format number with proper decimals
 */
function formatTokenAmount(amount, decimals = 9) {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
}
/**
 * Format percentage
 */
function formatPercentage(value, decimals = 2) {
    return `${value.toFixed(decimals)}%`;
}
/**
 * Format currency
 */
function formatCurrency(amount, currency = 'SOL') {
    return `${amount.toLocaleString()} ${currency}`;
}
/**
 * Convert BN to number
 */
function bnToNumber(bn, decimals = 9) {
    return bn.toNumber() / Math.pow(10, decimals);
}
/**
 * Convert number to BN
 */
function numberToBN(num, decimals = 9) {
    return new bn_js_1.BN(Math.floor(num * Math.pow(10, decimals)));
}
// ================================
// CRYPTO UTILITIES
// ================================
/**
 * Generate random client seed
 */
function generateClientSeed() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}
/**
 * Hash function for deterministic randomness
 */
function hashSeed(seed) {
    let hash = 0;
    if (seed.length === 0)
        return hash;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}
// ================================
// TIME UTILITIES
// ================================
/**
 * Get current Unix timestamp
 */
function getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000);
}
/**
 * Format timestamp to readable date
 */
function formatTimestamp(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
}
/**
 * Calculate time difference in human readable format
 */
function getTimeDifference(timestamp) {
    const now = getCurrentTimestamp();
    const diff = now - timestamp;
    if (diff < 60)
        return `${diff} seconds ago`;
    if (diff < 3600)
        return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400)
        return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}
// ================================
// ERROR HANDLING UTILITIES
// ================================
/**
 * Parse Anchor error messages
 */
function parseAnchorError(error) {
    if (error?.message) {
        // Try to extract meaningful error from Anchor
        const match = error.message.match(/Error Message: (.*?)\.?$/);
        if (match)
            return match[1];
        // Look for specific error codes
        if (error.message.includes('0x1770'))
            return 'Insufficient funds';
        if (error.message.includes('0x1771'))
            return 'Invalid bet configuration';
        if (error.message.includes('0x1772'))
            return 'Pool not found or inactive';
        if (error.message.includes('0x1773'))
            return 'Player not initialized';
        if (error.message.includes('0x1774'))
            return 'Game in invalid state';
        return error.message;
    }
    return 'Unknown error occurred';
}
/**
 * Retry mechanism for failed transactions
 */
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }
    throw lastError;
}
// ================================
// STATISTICS UTILITIES
// ================================
/**
 * Calculate win rate
 */
function calculateWinRate(wins, totalGames) {
    if (totalGames === 0)
        return 0;
    return (wins / totalGames) * 100;
}
/**
 * Calculate ROI (Return on Investment)
 */
function calculateROI(totalWagered, netProfitLoss) {
    if (totalWagered === 0)
        return 0;
    return (netProfitLoss / totalWagered) * 100;
}
/**
 * Calculate Sharpe ratio for risk assessment
 */
function calculateSharpeRatio(returns, riskFreeRate = 0) {
    if (returns.length === 0)
        return 0;
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const standardDeviation = Math.sqrt(variance);
    if (standardDeviation === 0)
        return 0;
    return (avgReturn - riskFreeRate) / standardDeviation;
}
// ================================
// CONSTANTS
// ================================
exports.PROGRAM_ID = 'Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw';
exports.BASIS_POINTS_SCALE = 10000;
exports.DEFAULT_COMMITMENT = 'confirmed';
exports.MAX_RETRIES = 3;
exports.RETRY_DELAY = 1000;
// ================================
// TYPE GUARDS
// ================================
/**
 * Check if value is a valid PublicKey
 */
function isPublicKey(value) {
    return value instanceof web3_js_1.PublicKey;
}
/**
 * Check if value is a valid BN
 */
function isBN(value) {
    return value instanceof bn_js_1.BN;
}
