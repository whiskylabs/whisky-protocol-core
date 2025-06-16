import { PublicKey } from '@solana/web3.js';
/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - UTILITY FUNCTIONS 🛠️
 * ============================================================================
 */
/**
 * Derive the Whisky State PDA
 */
export declare function deriveWhiskyStatePDA(programId: PublicKey): [PublicKey, number];
/**
 * Derive Pool PDA
 */
export declare function derivePoolPDA(tokenMint: PublicKey, poolAuthority: PublicKey, programId: PublicKey): [PublicKey, number];
/**
 * Derive LP Mint PDA
 */
export declare function deriveLpMintPDA(tokenMint: PublicKey, poolAuthority: PublicKey, programId: PublicKey): [PublicKey, number];
/**
 * Derive Player PDA
 */
export declare function derivePlayerPDA(user: PublicKey, programId: PublicKey): [PublicKey, number];
/**
 * Derive Game PDA
 */
export declare function deriveGamePDA(user: PublicKey, programId: PublicKey): [PublicKey, number];
/**
 * Calculate LP tokens for deposit
 */
export declare function calculateLpTokens(depositAmount: number, poolLiquidity: number, lpSupply: number): number;
/**
 * Calculate withdrawal amount from LP tokens
 */
export declare function calculateWithdrawalAmount(lpTokens: number, poolLiquidity: number, lpSupply: number): number;
/**
 * Calculate expected return from bet
 */
export declare function calculateExpectedReturn(bet: number[], wager: number): number;
/**
 * Calculate house edge for a pool
 */
export declare function calculateHouseEdge(totalVolume: number, totalPayouts: number, feesCollected: number): number;
/**
 * Calculate pool utilization
 */
export declare function calculatePoolUtilization(activeWagers: number, totalLiquidity: number): number;
/**
 * Calculate APY for LP providers
 */
export declare function calculateAPY(feesEarned24h: number, totalLiquidity: number): number;
/**
 * Validate bet array
 */
export declare function validateBet(bet: number[]): {
    valid: boolean;
    error?: string;
};
/**
 * Validate wager amount
 */
export declare function validateWager(amount: number, minWager: number, maxWager: number, poolLiquidity: number): {
    valid: boolean;
    error?: string;
};
/**
 * Format number with proper decimals
 */
export declare function formatTokenAmount(amount: number, decimals?: number): string;
/**
 * Format percentage
 */
export declare function formatPercentage(value: number, decimals?: number): string;
/**
 * Format currency
 */
export declare function formatCurrency(amount: number, currency?: string): string;
/**
 * Convert BN to number
 */
export declare function bnToNumber(bn: BN, decimals?: number): number;
/**
 * Convert number to BN
 */
export declare function numberToBN(num: number, decimals?: number): BN;
/**
 * Generate random client seed
 */
export declare function generateClientSeed(): string;
/**
 * Hash function for deterministic randomness
 */
export declare function hashSeed(seed: string): number;
/**
 * Get current Unix timestamp
 */
export declare function getCurrentTimestamp(): number;
/**
 * Format timestamp to readable date
 */
export declare function formatTimestamp(timestamp: number): string;
/**
 * Calculate time difference in human readable format
 */
export declare function getTimeDifference(timestamp: number): string;
/**
 * Parse Anchor error messages
 */
export declare function parseAnchorError(error: any): string;
/**
 * Retry mechanism for failed transactions
 */
export declare function retryOperation<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
/**
 * Calculate win rate
 */
export declare function calculateWinRate(wins: number, totalGames: number): number;
/**
 * Calculate ROI (Return on Investment)
 */
export declare function calculateROI(totalWagered: number, netProfitLoss: number): number;
/**
 * Calculate Sharpe ratio for risk assessment
 */
export declare function calculateSharpeRatio(returns: number[], riskFreeRate?: number): number;
export declare const PROGRAM_ID = "Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw";
export declare const BASIS_POINTS_SCALE = 10000;
export declare const DEFAULT_COMMITMENT = "confirmed";
export declare const MAX_RETRIES = 3;
export declare const RETRY_DELAY = 1000;
/**
 * Check if value is a valid PublicKey
 */
export declare function isPublicKey(value: any): value is PublicKey;
/**
 * Check if value is a valid BN
 */
export declare function isBN(value: any): value is BN;
