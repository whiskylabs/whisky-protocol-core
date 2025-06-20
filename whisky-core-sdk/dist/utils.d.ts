/// <reference types="node" />
/// <reference types="node" />
import { PublicKey, Connection, AccountInfo } from '@solana/web3.js';
import BN from 'bn.js';
import type { BetValidation, WagerValidation, CalculatedPayout, FeeBreakdown } from './types';
/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - UTILITY FUNCTIONS 🛠️
 * ============================================================================
 */
/**
 * Derive the Whisky State PDA
 */
export declare function deriveWhiskyStatePDA(programId?: PublicKey): [PublicKey, number];
/**
 * Derive a Pool PDA
 */
export declare function derivePoolPDA(tokenMint: PublicKey, authority: PublicKey, programId?: PublicKey): [PublicKey, number];
/**
 * Derive Pool LP Mint PDA
 */
export declare function derivePoolLpMintPDA(tokenMint: PublicKey, authority: PublicKey, programId?: PublicKey): [PublicKey, number];
/**
 * Derive Pool Jackpot Token Account PDA
 */
export declare function derivePoolJackpotPDA(pool: PublicKey, programId?: PublicKey): [PublicKey, number];
/**
 * Derive Pool Bonus Mint PDA
 */
export declare function derivePoolBonusMintPDA(pool: PublicKey, programId?: PublicKey): [PublicKey, number];
/**
 * Derive Pool Bonus Underlying Token Account PDA
 */
export declare function derivePoolBonusUnderlyingPDA(pool: PublicKey, programId?: PublicKey): [PublicKey, number];
/**
 * Derive Player PDA
 */
export declare function derivePlayerPDA(user: PublicKey, programId?: PublicKey): [PublicKey, number];
/**
 * Derive Game PDA
 */
export declare function deriveGamePDA(user: PublicKey, programId?: PublicKey): [PublicKey, number];
/**
 * Get Associated Token Address for a user and mint
 */
export declare function getUserTokenAccount(user: PublicKey, mint: PublicKey): PublicKey;
/**
 * Get Associated Token Address for a pool and mint (PDA as owner)
 */
export declare function getPoolTokenAccount(pool: PublicKey, mint: PublicKey): PublicKey;
/**
 * Get User's LP Token Account for a specific pool
 */
export declare function getUserLpTokenAccount(user: PublicKey, tokenMint: PublicKey, authority: PublicKey): PublicKey;
/**
 * Check if token is native SOL
 */
export declare function isNativeSOL(mint: PublicKey): boolean;
/**
 * Convert basis points to decimal percentage
 */
export declare function bpsToPercent(bps: number): number;
/**
 * Convert percentage to basis points
 */
export declare function percentToBps(percent: number): number;
/**
 * Convert micro basis points to decimal
 */
export declare function ubpsToDecimal(ubps: number): number;
/**
 * Calculate LP tokens to mint for a deposit
 */
export declare function calculateLpTokens(depositAmount: BN | number, poolLiquidity: BN | number, lpSupply: BN | number): BN;
/**
 * Calculate tokens to withdraw for LP tokens
 */
export declare function calculateWithdrawAmount(lpTokens: BN | number, poolLiquidity: BN | number, lpSupply: BN | number): BN;
/**
 * Calculate expected payout for a bet
 */
export declare function calculateExpectedPayout(bet: number[], wager: BN | number, houseEdgeBps?: number): CalculatedPayout;
/**
 * Calculate fee breakdown for a wager
 */
export declare function calculateFees(wager: BN | number, creatorFeeBps?: number, whiskyFeeBps?: number, poolFeeBps?: number, jackpotFeeBps?: number): FeeBreakdown;
/**
 * Validate a bet configuration
 */
export declare function validateBet(bet: number[]): BetValidation;
/**
 * Validate a wager amount
 */
export declare function validateWager(wager: BN | number, minWager: BN | number, maxWager: BN | number, availableLiquidity: BN | number): WagerValidation;
/**
 * Format a BN amount with decimals
 */
export declare function formatTokenAmount(amount: BN, decimals?: number): string;
/**
 * Parse a token amount string to BN
 */
export declare function parseTokenAmount(amount: string, decimals?: number): BN;
/**
 * Format percentage with specified decimal places
 */
export declare function formatPercentage(value: number, decimals?: number): string;
/**
 * Format multiplier (e.g., 2.5x)
 */
export declare function formatMultiplier(multiplierBps: number): string;
/**
 * Safely fetch account info
 */
export declare function safeGetAccountInfo(connection: Connection, address: PublicKey): Promise<AccountInfo<Buffer> | null>;
/**
 * Check if account exists
 */
export declare function accountExists(connection: Connection, address: PublicKey): Promise<boolean>;
/**
 * Generate a random client seed
 */
export declare function generateClientSeed(): string;
/**
 * Generate random metadata
 */
export declare function generateMetadata(prefix?: string): string;
/**
 * Parse program error from transaction error
 */
export declare function parseProgramError(error: any): {
    code?: number;
    message: string;
};
/**
 * Sleep for specified milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Retry async operation with exponential backoff
 */
export declare function retryWithBackoff<T>(operation: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
