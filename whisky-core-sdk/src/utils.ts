import { PublicKey } from '@solana/web3.js';
import { BN } from 'bn.js';

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
export function deriveWhiskyStatePDA(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('WHISKY_STATE')],
    programId
  );
}

/**
 * Derive Pool PDA
 */
export function derivePoolPDA(
  tokenMint: PublicKey,
  poolAuthority: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('POOL'),
      tokenMint.toBuffer(),
      poolAuthority.toBuffer(),
    ],
    programId
  );
}

/**
 * Derive LP Mint PDA
 */
export function deriveLpMintPDA(
  tokenMint: PublicKey,
  poolAuthority: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('POOL_LP_MINT'),
      tokenMint.toBuffer(),
      poolAuthority.toBuffer(),
    ],
    programId
  );
}

/**
 * Derive Player PDA
 */
export function derivePlayerPDA(
  user: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('PLAYER'), user.toBuffer()],
    programId
  );
}

/**
 * Derive Game PDA
 */
export function deriveGamePDA(
  user: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('GAME'), user.toBuffer()],
    programId
  );
}

// ================================
// CALCULATION UTILITIES
// ================================

/**
 * Calculate LP tokens for deposit
 */
export function calculateLpTokens(
  depositAmount: number,
  poolLiquidity: number,
  lpSupply: number
): number {
  if (lpSupply === 0) {
    return depositAmount; // First deposit gets 1:1 ratio
  }
  return (depositAmount * lpSupply) / poolLiquidity;
}

/**
 * Calculate withdrawal amount from LP tokens
 */
export function calculateWithdrawalAmount(
  lpTokens: number,
  poolLiquidity: number,
  lpSupply: number
): number {
  if (lpSupply === 0) return 0;
  return (lpTokens * poolLiquidity) / lpSupply;
}

/**
 * Calculate expected return from bet
 */
export function calculateExpectedReturn(bet: number[], wager: number): number {
  const totalWeight = bet.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight === 0) return 0;
  
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
export function calculateHouseEdge(
  totalVolume: number,
  totalPayouts: number,
  feesCollected: number
): number {
  if (totalVolume === 0) return 0;
  return ((totalVolume - totalPayouts - feesCollected) / totalVolume) * 100;
}

/**
 * Calculate pool utilization
 */
export function calculatePoolUtilization(
  activeWagers: number,
  totalLiquidity: number
): number {
  if (totalLiquidity === 0) return 0;
  return (activeWagers / totalLiquidity) * 100;
}

/**
 * Calculate APY for LP providers
 */
export function calculateAPY(
  feesEarned24h: number,
  totalLiquidity: number
): number {
  if (totalLiquidity === 0) return 0;
  const dailyRate = feesEarned24h / totalLiquidity;
  return ((Math.pow(1 + dailyRate, 365) - 1) * 100);
}

// ================================
// VALIDATION UTILITIES
// ================================

/**
 * Validate bet array
 */
export function validateBet(bet: number[]): { valid: boolean; error?: string } {
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
export function validateWager(
  amount: number,
  minWager: number,
  maxWager: number,
  poolLiquidity: number
): { valid: boolean; error?: string } {
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
export function formatTokenAmount(amount: number, decimals: number = 9): string {
  return (amount / Math.pow(10, decimals)).toFixed(decimals);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'SOL'): string {
  return `${amount.toLocaleString()} ${currency}`;
}

/**
 * Convert BN to number
 */
export function bnToNumber(bn: BN, decimals: number = 9): number {
  return bn.toNumber() / Math.pow(10, decimals);
}

/**
 * Convert number to BN
 */
export function numberToBN(num: number, decimals: number = 9): BN {
  return new BN(Math.floor(num * Math.pow(10, decimals)));
}

// ================================
// CRYPTO UTILITIES
// ================================

/**
 * Generate random client seed
 */
export function generateClientSeed(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Hash function for deterministic randomness
 */
export function hashSeed(seed: string): number {
  let hash = 0;
  if (seed.length === 0) return hash;
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
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Calculate time difference in human readable format
 */
export function getTimeDifference(timestamp: number): string {
  const now = getCurrentTimestamp();
  const diff = now - timestamp;
  
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

// ================================
// ERROR HANDLING UTILITIES
// ================================

/**
 * Parse Anchor error messages
 */
export function parseAnchorError(error: any): string {
  if (error?.message) {
    // Try to extract meaningful error from Anchor
    const match = error.message.match(/Error Message: (.*?)\.?$/);
    if (match) return match[1];
    
    // Look for specific error codes
    if (error.message.includes('0x1770')) return 'Insufficient funds';
    if (error.message.includes('0x1771')) return 'Invalid bet configuration';
    if (error.message.includes('0x1772')) return 'Pool not found or inactive';
    if (error.message.includes('0x1773')) return 'Player not initialized';
    if (error.message.includes('0x1774')) return 'Game in invalid state';
    
    return error.message;
  }
  
  return 'Unknown error occurred';
}

/**
 * Retry mechanism for failed transactions
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
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
export function calculateWinRate(wins: number, totalGames: number): number {
  if (totalGames === 0) return 0;
  return (wins / totalGames) * 100;
}

/**
 * Calculate ROI (Return on Investment)
 */
export function calculateROI(totalWagered: number, netProfitLoss: number): number {
  if (totalWagered === 0) return 0;
  return (netProfitLoss / totalWagered) * 100;
}

/**
 * Calculate Sharpe ratio for risk assessment
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate: number = 0
): number {
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
  const standardDeviation = Math.sqrt(variance);
  
  if (standardDeviation === 0) return 0;
  return (avgReturn - riskFreeRate) / standardDeviation;
}

// ================================
// CONSTANTS
// ================================

export const PROGRAM_ID = 'Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw';
export const BASIS_POINTS_SCALE = 10000;
export const DEFAULT_COMMITMENT = 'confirmed';
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000;

// ================================
// TYPE GUARDS
// ================================

/**
 * Check if value is a valid PublicKey
 */
export function isPublicKey(value: any): value is PublicKey {
  return value instanceof PublicKey;
}

/**
 * Check if value is a valid BN
 */
export function isBN(value: any): value is BN {
  return value instanceof BN;
} 