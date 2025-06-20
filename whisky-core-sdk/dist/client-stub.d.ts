import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import type { WhiskySDKConfig, CreatePoolParams, DepositLiquidityParams, WithdrawLiquidityParams, PlaceBetParams, GameResult, TransactionResult, PoolStats, PlayerStats, SDKOptions, WhiskyState, Pool, Player, Game } from './types';
/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - STUB CLIENT (COMPILES WITHOUT ERRORS) 🎮
 * ============================================================================
 *
 * This is a working stub implementation that:
 * - Compiles without TypeScript errors
 * - Provides the complete API surface
 * - Returns mock data for development
 * - Can be easily replaced with real IDL integration
 */
export declare class WhiskyGamingClient {
    connection: Connection;
    wallet: anchor.Wallet;
    program: any;
    programId: PublicKey;
    options: SDKOptions;
    private _debug;
    constructor(config: WhiskySDKConfig, options?: SDKOptions);
    private log;
    private sendTransaction;
    get user(): anchor.web3.PublicKey;
    /**
     * Initialize the Whisky Gaming Protocol (admin only)
     */
    initializeProtocol(): Promise<TransactionResult>;
    /**
     * Get the current protocol state
     */
    getProtocolState(): Promise<WhiskyState>;
    /**
     * Create a new gaming pool
     */
    createPool(params: CreatePoolParams): Promise<TransactionResult>;
    /**
     * Deposit liquidity to a pool
     */
    depositLiquidity(params: DepositLiquidityParams): Promise<TransactionResult>;
    /**
     * Withdraw liquidity from a pool
     */
    withdrawLiquidity(params: WithdrawLiquidityParams): Promise<TransactionResult>;
    /**
     * Get pool information
     */
    getPool(poolAddress: PublicKey): Promise<Pool>;
    /**
     * Get pool statistics
     */
    getPoolStats(poolAddress: PublicKey): Promise<PoolStats>;
    /**
     * Initialize a player account
     */
    initializePlayer(): Promise<TransactionResult>;
    /**
     * Get player information
     */
    getPlayer(userAddress?: PublicKey): Promise<Player>;
    /**
     * Place a bet in a pool
     */
    placeBet(params: PlaceBetParams): Promise<GameResult>;
    /**
     * Claim winnings from a completed game
     */
    claimWinnings(gameAddress: PublicKey): Promise<TransactionResult>;
    /**
     * Get game information
     */
    getGame(gameAddress: PublicKey): Promise<Game>;
    /**
     * Find all pools for a specific token
     */
    findPoolsForToken(tokenMint: PublicKey): Promise<PublicKey[]>;
    /**
     * Get user's games across all pools
     */
    getUserGames(userAddress?: PublicKey): Promise<PublicKey[]>;
    /**
     * Calculate expected LP tokens for a deposit
     */
    calculateLpTokensForDeposit(poolAddress: PublicKey, depositAmount: number): Promise<number>;
    /**
     * Calculate withdrawal amount for LP tokens
     */
    calculateWithdrawalForLpTokens(poolAddress: PublicKey, lpTokens: number): Promise<number>;
    /**
     * Close player account to reclaim rent
     */
    closePlayerAccount(): Promise<TransactionResult>;
    /**
     * Settle game with RNG result (RNG authority only)
     */
    settleGameWithRNG(gameAddress: PublicKey, rngSeed: string, nextRngSeedHashed: string): Promise<TransactionResult>;
    /**
     * Provide next RNG seed hash (RNG authority only)
     */
    provideRNGSeedHash(gameAddress: PublicKey, nextRngSeedHashed: string): Promise<TransactionResult>;
    /**
     * Get player statistics across all pools
     */
    getPlayerStats(userAddress?: PublicKey): Promise<PlayerStats>;
    /**
     * Create a coin flip bet (50/50 odds)
     */
    createCoinFlipBet(): number[];
    /**
     * Create a dice roll bet (1-6, equal odds)
     */
    createDiceRollBet(): number[];
    /**
     * Create a weighted dice bet (bias towards 6)
     */
    createWeightedDiceBet(bias?: number): number[];
    /**
     * Create a roulette bet (European style, 37 slots)
     */
    createRouletteBet(): number[];
    /**
     * Create a custom weighted bet
     */
    createCustomBet(weights: number[]): number[];
    /**
     * Simulate a game result (for testing)
     */
    simulateGameResult(bet: number[], clientSeed?: string): {
        outcome: number;
        multiplier: number;
        isWin: boolean;
    };
    /**
     * Estimate gas fees for operations
     */
    estimateGasFees(): Promise<{
        initializePlayer: number;
        placeBet: number;
        claimWinnings: number;
        createPool: number;
        depositLiquidity: number;
        withdrawLiquidity: number;
    }>;
    /**
     * Place multiple bets in sequence
     */
    placeBetBatch(params: PlaceBetParams[]): Promise<GameResult[]>;
    /**
     * Claim winnings from multiple games
     */
    claimWinningsBatch(gameAddresses: PublicKey[]): Promise<TransactionResult[]>;
    /**
     * Create a slots-style bet with weighted reels
     */
    createSlotsBet(reels: number[][]): number[];
    /**
     * Create a lottery-style bet
     */
    createLotteryBet(totalNumbers: number, winningNumbers: number): number[];
    /**
     * Create a binary option bet (yes/no with custom odds)
     */
    createBinaryBet(yesWeight: number, noWeight: number): number[];
    /**
     * Create a multi-outcome prediction market bet
     */
    createPredictionMarketBet(probabilities: number[]): number[];
    /**
     * Get comprehensive game analytics
     */
    getGameAnalytics(timeRange?: 'hour' | 'day' | 'week' | 'month'): Promise<{
        totalGames: number;
        totalVolume: number;
        totalPayouts: number;
        averageWager: number;
        winRate: number;
        popularPools: PublicKey[];
        gameTypes: Record<string, number>;
    }>;
    /**
     * Monitor pending games and their status
     */
    getPendingGames(): Promise<Array<{
        address: PublicKey;
        game: Game;
        timeWaiting: number;
        status: string;
    }>>;
}
