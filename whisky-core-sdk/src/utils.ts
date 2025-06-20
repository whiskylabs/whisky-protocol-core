import { PublicKey, Connection, AccountInfo } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, NATIVE_MINT } from '@solana/spl-token';
import BN from 'bn.js';
import { 
  WHISKY_PROGRAM_ID,
  WHISKY_STATE_SEED,
  POOL_SEED,
  POOL_LP_MINT_SEED,
  POOL_JACKPOT_SEED,
  POOL_BONUS_MINT_SEED,
  POOL_BONUS_UNDERLYING_TA_SEED,
  PLAYER_SEED,
  GAME_SEED,
  BPS_DIVISOR,
  UBPS_DIVISOR,
  MIN_BET_LENGTH,
  MAX_BET_LENGTH,
  MIN_BET_WEIGHT,
  MAX_BET_WEIGHT
} from './constants';
import type { 
  BetValidation, 
  WagerValidation, 
  CalculatedPayout, 
  FeeBreakdown,
  PoolLiquidity 
} from './types';

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
export function deriveWhiskyStatePDA(programId: PublicKey = WHISKY_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(WHISKY_STATE_SEED)],
    programId
  );
}

/**
 * Derive a Pool PDA
 */
export function derivePoolPDA(
  tokenMint: PublicKey, 
  authority: PublicKey,
  programId: PublicKey = WHISKY_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(POOL_SEED),
      tokenMint.toBuffer(),
      authority.toBuffer()
    ],
    programId
  );
}

/**
 * Derive Pool LP Mint PDA
 */
export function derivePoolLpMintPDA(
  tokenMint: PublicKey,
  authority: PublicKey,
  programId: PublicKey = WHISKY_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(POOL_LP_MINT_SEED),
      tokenMint.toBuffer(),
      authority.toBuffer()
    ],
    programId
  );
}

/**
 * Derive Pool Jackpot Token Account PDA
 */
export function derivePoolJackpotPDA(
  pool: PublicKey,
  programId: PublicKey = WHISKY_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(POOL_JACKPOT_SEED),
      pool.toBuffer()
    ],
    programId
  );
}

/**
 * Derive Pool Bonus Mint PDA
 */
export function derivePoolBonusMintPDA(
  pool: PublicKey,
  programId: PublicKey = WHISKY_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(POOL_BONUS_MINT_SEED),
      pool.toBuffer()
    ],
    programId
  );
}

/**
 * Derive Pool Bonus Underlying Token Account PDA
 */
export function derivePoolBonusUnderlyingPDA(
  pool: PublicKey,
  programId: PublicKey = WHISKY_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(POOL_BONUS_UNDERLYING_TA_SEED),
      pool.toBuffer()
    ],
    programId
  );
}

/**
 * Derive Player PDA
 */
export function derivePlayerPDA(
  user: PublicKey,
  programId: PublicKey = WHISKY_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(PLAYER_SEED),
      user.toBuffer()
    ],
    programId
  );
}

/**
 * Derive Game PDA
 */
export function deriveGamePDA(
  user: PublicKey,
  programId: PublicKey = WHISKY_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(GAME_SEED),
      user.toBuffer()
    ],
    programId
  );
}

// ================================
// TOKEN ACCOUNT HELPERS
// ================================

/**
 * Get Associated Token Address for a user and mint
 */
export function getUserTokenAccount(user: PublicKey, mint: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(mint, user);
}

/**
 * Get Associated Token Address for a pool and mint (PDA as owner)
 */
export function getPoolTokenAccount(pool: PublicKey, mint: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(mint, pool, true);
}

/**
 * Get User's LP Token Account for a specific pool
 */
export function getUserLpTokenAccount(user: PublicKey, tokenMint: PublicKey, authority: PublicKey): PublicKey {
  const [lpMint] = derivePoolLpMintPDA(tokenMint, authority);
  return getAssociatedTokenAddressSync(lpMint, user);
}

/**
 * Check if token is native SOL
 */
export function isNativeSOL(mint: PublicKey): boolean {
  return mint.equals(NATIVE_MINT);
}

// ================================
// MATHEMATICAL CALCULATIONS
// ================================

/**
 * Convert basis points to decimal percentage
 */
export function bpsToPercent(bps: number): number {
  return bps / BPS_DIVISOR;
}

/**
 * Convert percentage to basis points
 */
export function percentToBps(percent: number): number {
  return Math.round(percent * BPS_DIVISOR);
}

/**
 * Convert micro basis points to decimal
 */
export function ubpsToDecimal(ubps: number): number {
  return ubps / UBPS_DIVISOR;
}

/**
 * Calculate LP tokens to mint for a deposit
 */
export function calculateLpTokens(
  depositAmount: BN | number,
  poolLiquidity: BN | number,
  lpSupply: BN | number
): BN {
  const deposit = new BN(depositAmount);
  const liquidity = new BN(poolLiquidity);
  const supply = new BN(lpSupply);

  // If no supply exists, return deposit amount
  if (supply.isZero()) {
    return deposit;
  }

  // LP tokens = (deposit * lpSupply) / poolLiquidity
  return deposit.mul(supply).div(liquidity);
}

/**
 * Calculate tokens to withdraw for LP tokens
 */
export function calculateWithdrawAmount(
  lpTokens: BN | number,
  poolLiquidity: BN | number,
  lpSupply: BN | number
): BN {
  const lp = new BN(lpTokens);
  const liquidity = new BN(poolLiquidity);
  const supply = new BN(lpSupply);

  if (supply.isZero()) {
    return new BN(0);
  }

  // Withdraw amount = (lpTokens * poolLiquidity) / lpSupply
  return lp.mul(liquidity).div(supply);
}

/**
 * Calculate expected payout for a bet
 */
export function calculateExpectedPayout(
  bet: number[],
  wager: BN | number,
  houseEdgeBps: number = 200
): CalculatedPayout {
  const wagerBN = new BN(wager);
  const totalWeight = bet.reduce((sum, weight) => sum + weight, 0);
  
  if (totalWeight === 0) {
    throw new Error('Total bet weight cannot be zero');
  }

  // Calculate individual outcome probabilities and payouts
  const outcomes = bet.map(weight => {
    const probability = weight / totalWeight;
    const rawMultiplier = totalWeight / weight;
    const adjustedMultiplier = rawMultiplier * (1 - bpsToPercent(houseEdgeBps));
    const payout = wagerBN.mul(new BN(Math.floor(adjustedMultiplier * BPS_DIVISOR))).div(new BN(BPS_DIVISOR));
    
    return {
      probability,
      multiplier: adjustedMultiplier,
      payout,
      weight
    };
  });

  // Find maximum payout (for the outcome with highest multiplier)
  const maxPayout = outcomes.reduce((max, outcome) => 
    outcome.payout.gt(max) ? outcome.payout : max, new BN(0)
  );

  // Calculate weighted average multiplier
  const weightedMultiplier = outcomes.reduce((sum, outcome) => 
    sum + (outcome.multiplier * outcome.probability), 0
  );

  return {
    totalPayout: maxPayout,
    multiplierBps: Math.floor(weightedMultiplier * BPS_DIVISOR),
    probability: 1 / outcomes.length, // Average probability
    houseEdge: bpsToPercent(houseEdgeBps),
    expectedValue: weightedMultiplier
  };
}

/**
 * Calculate fee breakdown for a wager
 */
export function calculateFees(
  wager: BN | number,
  creatorFeeBps: number = 0,
  whiskyFeeBps: number = 200,
  poolFeeBps: number = 100,
  jackpotFeeBps: number = 50
): FeeBreakdown {
  const wagerBN = new BN(wager);
  
  const creatorFee = wagerBN.mul(new BN(creatorFeeBps)).div(new BN(BPS_DIVISOR));
  const whiskyFee = wagerBN.mul(new BN(whiskyFeeBps)).div(new BN(BPS_DIVISOR));
  const poolFee = wagerBN.mul(new BN(poolFeeBps)).div(new BN(BPS_DIVISOR));
  const jackpotFee = wagerBN.mul(new BN(jackpotFeeBps)).div(new BN(BPS_DIVISOR));
  
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

// ================================
// VALIDATION FUNCTIONS
// ================================

/**
 * Validate a bet configuration
 */
export function validateBet(bet: number[]): BetValidation {
  const errors: string[] = [];
  let isValid = true;

  // Check bet length
  if (bet.length < MIN_BET_LENGTH) {
    errors.push(`Bet must have at least ${MIN_BET_LENGTH} outcomes`);
    isValid = false;
  }

  if (bet.length > MAX_BET_LENGTH) {
    errors.push(`Bet cannot have more than ${MAX_BET_LENGTH} outcomes`);
    isValid = false;
  }

  // Check individual weights
  for (let i = 0; i < bet.length; i++) {
    if (bet[i] < MIN_BET_WEIGHT) {
      errors.push(`Bet weight ${i} must be at least ${MIN_BET_WEIGHT}`);
      isValid = false;
    }

    if (bet[i] > MAX_BET_WEIGHT) {
      errors.push(`Bet weight ${i} cannot exceed ${MAX_BET_WEIGHT}`);
      isValid = false;
    }
  }

  const totalWeight = bet.reduce((sum, weight) => sum + weight, 0);
  
  // Calculate max payout and house edge
  const maxMultiplier = totalWeight / Math.min(...bet);
  const maxPayout = new BN(Math.floor(maxMultiplier * BPS_DIVISOR));
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

/**
 * Validate a wager amount
 */
export function validateWager(
  wager: BN | number,
  minWager: BN | number,
  maxWager: BN | number,
  availableLiquidity: BN | number
): WagerValidation {
  const wagerBN = new BN(wager);
  const minWagerBN = new BN(minWager);
  const maxWagerBN = new BN(maxWager);
  const liquidityBN = new BN(availableLiquidity);
  
  const errors: string[] = [];
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

// ================================
// FORMATTING FUNCTIONS
// ================================

/**
 * Format a BN amount with decimals
 */
export function formatTokenAmount(amount: BN, decimals: number = 9): string {
  const divisor = new BN(10).pow(new BN(decimals));
  const quotient = amount.div(divisor);
  const remainder = amount.mod(divisor);
  
  if (remainder.isZero()) {
    return quotient.toString();
  }

  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmedRemainder = remainderStr.replace(/0+$/, '');
  
  return trimmedRemainder ? `${quotient}.${trimmedRemainder}` : quotient.toString();
}

/**
 * Parse a token amount string to BN
 */
export function parseTokenAmount(amount: string, decimals: number = 9): BN {
  const [whole, fractional = ''] = amount.split('.');
  const wholeBN = new BN(whole || '0');
  
  if (!fractional) {
    return wholeBN.mul(new BN(10).pow(new BN(decimals)));
  }

  const fractionalPadded = fractional.padEnd(decimals, '0').slice(0, decimals);
  const fractionalBN = new BN(fractionalPadded);
  
  return wholeBN.mul(new BN(10).pow(new BN(decimals))).add(fractionalBN);
}

/**
 * Format percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format multiplier (e.g., 2.5x)
 */
export function formatMultiplier(multiplierBps: number): string {
  const multiplier = multiplierBps / BPS_DIVISOR;
  return `${multiplier.toFixed(2)}x`;
}

// ================================
// ACCOUNT FETCHING HELPERS
// ================================

/**
 * Safely fetch account info
 */
export async function safeGetAccountInfo(
  connection: Connection,
  address: PublicKey
): Promise<AccountInfo<Buffer> | null> {
  try {
    return await connection.getAccountInfo(address);
  } catch (error) {
    console.warn(`Failed to fetch account ${address.toString()}:`, error);
    return null;
  }
}

/**
 * Check if account exists
 */
export async function accountExists(
  connection: Connection,
  address: PublicKey
): Promise<boolean> {
  const accountInfo = await safeGetAccountInfo(connection, address);
  return accountInfo !== null;
}

// ================================
// RANDOM GENERATION HELPERS
// ================================

/**
 * Generate a random client seed
 */
export function generateClientSeed(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random metadata
 */
export function generateMetadata(prefix: string = 'Game'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}_${timestamp}_${random}`;
}

// ================================
// ERROR HANDLING HELPERS
// ================================

/**
 * Parse program error from transaction error
 */
export function parseProgramError(error: any): { code?: number; message: string } {
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

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }

  throw lastError!;
} 