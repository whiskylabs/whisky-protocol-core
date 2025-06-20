/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - COMPLETE API REFERENCE 🎮
 * ============================================================================
 *
 * This file contains ALL functions available in the Whisky Gaming SDK.
 * Use this as your integration guide for building gaming applications.
 */
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
export interface WhiskyGamingAPI {
    initializePlayer(): Promise<TransactionResult>;
    placeBet(params: PlaceBetParams): Promise<GameResult>;
    claimWinnings(gameAddress: PublicKey): Promise<TransactionResult>;
    closePlayerAccount(): Promise<TransactionResult>;
    createPool(params: CreatePoolParams): Promise<TransactionResult>;
    depositLiquidity(params: DepositLiquidityParams): Promise<TransactionResult>;
    withdrawLiquidity(params: WithdrawLiquidityParams): Promise<TransactionResult>;
    getPlayer(userAddress?: PublicKey): Promise<Player>;
    getGame(gameAddress: PublicKey): Promise<Game>;
    getPool(poolAddress: PublicKey): Promise<Pool>;
    settleGameWithRNG(gameAddress: PublicKey, rngSeed: string, nextRngSeedHashed: string): Promise<TransactionResult>;
    provideRNGSeedHash(gameAddress: PublicKey, nextRngSeedHashed: string): Promise<TransactionResult>;
    getProtocolState(): Promise<WhiskyState>;
    createCoinFlipBet(): number[];
    createDiceRollBet(): number[];
    createWeightedDiceBet(bias?: number): number[];
    createRouletteBet(): number[];
    createCustomBet(weights: number[]): number[];
    createSlotsBet(reels: number[][]): number[];
    createLotteryBet(totalNumbers: number, winningNumbers: number): number[];
    createBinaryBet(yesWeight: number, noWeight: number): number[];
    createPredictionMarketBet(probabilities: number[]): number[];
    getPlayerStats(userAddress?: PublicKey): Promise<PlayerStats>;
    getPoolStats(poolAddress: PublicKey): Promise<PoolStats>;
    getGameAnalytics(timeRange?: 'hour' | 'day' | 'week' | 'month'): Promise<GameAnalytics>;
    getPendingGames(): Promise<PendingGame[]>;
    findPoolsForToken(tokenMint: PublicKey): Promise<PublicKey[]>;
    getUserGames(userAddress?: PublicKey): Promise<PublicKey[]>;
    simulateGameResult(bet: number[], clientSeed?: string): GameSimulation;
    placeBetBatch(params: PlaceBetParams[]): Promise<GameResult[]>;
    claimWinningsBatch(gameAddresses: PublicKey[]): Promise<TransactionResult[]>;
    calculateLpTokensForDeposit(poolAddress: PublicKey, depositAmount: number): Promise<number>;
    calculateWithdrawalForLpTokens(poolAddress: PublicKey, lpTokens: number): Promise<number>;
    estimateGasFees(): Promise<GasFeeEstimate>;
    calculateExpectedPayout(bet: number[], wager: number, houseEdgeBps?: number): CalculatedPayout;
    calculateFees(wager: number, creatorFeeBps?: number, whiskyFeeBps?: number, poolFeeBps?: number, jackpotFeeBps?: number): FeeBreakdown;
    validateBet(bet: number[]): BetValidation;
}
export interface PlaceBetParams {
    pool: PublicKey;
    amount: number;
    bet: number[];
    clientSeed?: string;
    creatorFeeBps?: number;
    jackpotFeeBps?: number;
    metadata?: string;
    userTokenAccount?: PublicKey;
}
export interface CreatePoolParams {
    tokenMint: PublicKey;
    poolAuthority: PublicKey;
    minWager?: number;
    maxWager?: number;
    creatorFeeBps?: number;
    houseEdgeBps?: number;
    lookupAddress?: PublicKey;
}
export interface DepositLiquidityParams {
    pool: PublicKey;
    amount: number;
    tokenMint: PublicKey;
    userTokenAccount?: PublicKey;
}
export interface WithdrawLiquidityParams {
    pool: PublicKey;
    lpAmount: number;
    tokenMint: PublicKey;
    userTokenAccount?: PublicKey;
    userLpAccount?: PublicKey;
}
export interface TransactionResult {
    signature: string;
    success: boolean;
    error?: string;
    data?: any;
}
export interface GameResult extends TransactionResult {
    game: PublicKey;
    isWin: boolean;
    payout: number;
    result: number;
    expectedReturn: number;
}
export interface Player {
    user: PublicKey;
    nonce: BN;
    totalGames: BN;
    totalWagered: BN;
    totalWinnings: BN;
    netProfitLoss: BN;
    lastGameAt: BN;
    createdAt: BN;
    isActive: boolean;
}
export interface Game {
    user: PublicKey;
    pool: PublicKey;
    status: GameStatus;
    wager: BN;
    bet: number[];
    result: number;
    payout: BN;
    creatorFeeBps: number;
    jackpotFeeBps: number;
    clientSeed: string;
    metadata: string;
    createdAt: BN;
    completedAt?: BN;
    isWin: boolean;
}
export interface Pool {
    poolAuthority: PublicKey;
    underlyingTokenMint: PublicKey;
    lpMint: PublicKey;
    minWager: BN;
    maxWager: BN;
    creatorFeeBps: BN;
    houseEdgeBps: BN;
    totalLiquidity: BN;
    lpSupply: BN;
    plays: BN;
    volume: BN;
    feesCollected: BN;
    createdAt: BN;
    isActive: boolean;
    lookupAddress?: PublicKey;
}
export interface WhiskyState {
    authority: PublicKey;
    rngAddress: PublicKey;
    antiSpamFee: BN;
    whiskyFeeBps: BN;
    maxCreatorFeeBps: BN;
    poolCreationFee: BN;
    maxHouseEdgeBps: BN;
    defaultPoolFeeBps: BN;
    jackpotToUserBps: BN;
    jackpotToCreatorBps: BN;
    jackpotToPoolBps: BN;
    jackpotToWhiskyBps: BN;
    bonusRatioBps: BN;
    maxWager: BN;
    minPoolBalance: BN;
    poolCreationAllowed: boolean;
    playingAllowed: boolean;
    withdrawalsAllowed: boolean;
    depositsAllowed: boolean;
    antiSpamAuthority: PublicKey;
}
export interface PlayerStats {
    address: PublicKey;
    config: Player;
    winRate: number;
    avgBetSize: number;
    profitLossRatio: number;
    totalROI: number;
    favoritePools: PublicKey[];
}
export interface PoolStats {
    address: PublicKey;
    config: Pool;
    totalValueLocked: number;
    lpTokenPrice: number;
    volume24h: number;
    totalVolume: number;
    activePlayers: number;
    apy: number;
    houseEdge: number;
}
export interface GameAnalytics {
    totalGames: number;
    totalVolume: number;
    totalPayouts: number;
    averageWager: number;
    winRate: number;
    popularPools: PublicKey[];
    gameTypes: Record<string, number>;
}
export interface PendingGame {
    address: PublicKey;
    game: Game;
    timeWaiting: number;
    status: string;
}
export interface GameSimulation {
    outcome: number;
    multiplier: number;
    isWin: boolean;
}
export interface GasFeeEstimate {
    initializePlayer: number;
    placeBet: number;
    claimWinnings: number;
    createPool: number;
    depositLiquidity: number;
    withdrawLiquidity: number;
}
export interface CalculatedPayout {
    totalPayout: BN;
    multiplierBps: number;
    probability: number;
    houseEdge: number;
    expectedValue: number;
}
export interface FeeBreakdown {
    creatorFee: BN;
    whiskyFee: BN;
    poolFee: BN;
    jackpotFee: BN;
    totalFees: BN;
    netWager: BN;
}
export interface BetValidation {
    isValid: boolean;
    errors: string[];
    totalWeight: number;
    outcomes: number;
    maxPayout: BN;
    houseEdge: number;
}
export declare enum GameStatus {
    None = 0,
    ResultRequested = 1,
    Ready = 2,
    Completed = 3,
    Failed = 4
}
/**
 * EXAMPLE 1: Simple Coin Flip Game
 *
 * ```typescript
 * import { WhiskyGamingClient } from '@/whisky-core-sdk';
 *
 * const client = new WhiskyGamingClient(config);
 *
 * // Initialize player
 * await client.initializePlayer();
 *
 * // Place coin flip bet
 * const result = await client.placeBet({
 *   pool: coinFlipPoolAddress,
 *   amount: 1000000, // 1 token
 *   bet: client.createCoinFlipBet(), // [50, 50]
 *   clientSeed: 'heads-or-tails'
 * });
 *
 * // After RNG settlement, claim winnings
 * await client.claimWinnings(result.game);
 * ```
 */
/**
 * EXAMPLE 2: Custom Dice Game
 *
 * ```typescript
 * // Create weighted dice (6 is 3x more likely)
 * const weightedDice = client.createWeightedDiceBet(3); // [1,1,1,1,1,3]
 *
 * const result = await client.placeBet({
 *   pool: dicePoolAddress,
 *   amount: 2000000,
 *   bet: weightedDice,
 *   creatorFeeBps: 200, // 2% to game creator
 *   jackpotFeeBps: 100  // 1% to jackpot
 * });
 * ```
 */
/**
 * EXAMPLE 3: Liquidity Provider
 *
 * ```typescript
 * // Deposit liquidity to earn fees from all games
 * await client.depositLiquidity({
 *   pool: popularPoolAddress,
 *   amount: 100000000, // 100 tokens
 *   tokenMint: usdcMint
 * });
 *
 * // Check pool performance
 * const stats = await client.getPoolStats(popularPoolAddress);
 * console.log(`APY: ${stats.apy}%, TVL: $${stats.totalValueLocked}`);
 * ```
 */
/**
 * EXAMPLE 4: Batch Operations
 *
 * ```typescript
 * // Place multiple bets at once
 * const batchResults = await client.placeBetBatch([
 *   { pool: pool1, amount: 1000, bet: [50, 50] },
 *   { pool: pool2, amount: 2000, bet: [1,1,1,1,1,1] },
 *   { pool: pool3, amount: 3000, bet: [25, 75] }
 * ]);
 *
 * // Claim winnings from multiple games
 * const claimResults = await client.claimWinningsBatch([
 *   gameAddress1, gameAddress2, gameAddress3
 * ]);
 * ```
 */
/**
 * EXAMPLE 5: Analytics Dashboard
 *
 * ```typescript
 * // Get comprehensive analytics
 * const playerStats = await client.getPlayerStats();
 * const gameAnalytics = await client.getGameAnalytics('day');
 * const pendingGames = await client.getPendingGames();
 *
 * console.log(`Win Rate: ${playerStats.winRate}%`);
 * console.log(`Total Volume: ${gameAnalytics.totalVolume}`);
 * console.log(`Pending Games: ${pendingGames.length}`);
 * ```
 */
/**
 * PRE-BUILT GAME TYPES:
 *
 * 1. Coin Flip: client.createCoinFlipBet() -> [50, 50]
 * 2. Dice Roll: client.createDiceRollBet() -> [1,1,1,1,1,1]
 * 3. Weighted Dice: client.createWeightedDiceBet(3) -> [1,1,1,1,1,3]
 * 4. Roulette: client.createRouletteBet() -> [1,1,1,...,1] (37 outcomes)
 * 5. Slots: client.createSlotsBet([[1,2,1], [1,1,2], [2,1,1]])
 * 6. Lottery: client.createLotteryBet(100, 5) -> 5 winning out of 100
 * 7. Binary: client.createBinaryBet(30, 70) -> 30% yes, 70% no
 * 8. Prediction: client.createPredictionMarketBet([0.25, 0.35, 0.40])
 * 9. Custom: client.createCustomBet([10, 20, 30, 40])
 */
/**
 * PDA DERIVATION FUNCTIONS (10):
 * - deriveWhiskyStatePDA()
 * - derivePoolPDA()
 * - derivePoolLpMintPDA()
 * - derivePoolJackpotPDA()
 * - derivePoolBonusMintPDA()
 * - derivePoolBonusUnderlyingPDA()
 * - derivePlayerPDA()
 * - deriveGamePDA()
 * - getUserTokenAccount()
 * - getPoolTokenAccount()
 *
 * CALCULATION FUNCTIONS (8):
 * - calculateLpTokens()
 * - calculateWithdrawAmount()
 * - calculateExpectedPayout()
 * - calculateFees()
 * - calculateJackpotProbability()
 * - calculateMultiplier()
 * - calculateHouseEdge()
 * - bpsToPercent()
 *
 * VALIDATION FUNCTIONS (4):
 * - validateBet()
 * - validateWager()
 * - validateHouseEdge()
 * - validateMaxPayout()
 *
 * FORMATTING FUNCTIONS (6):
 * - formatTokenAmount()
 * - parseTokenAmount()
 * - formatPercentage()
 * - formatMultiplier()
 * - generateClientSeed()
 * - generateMetadata()
 *
 * HELPER FUNCTIONS (4):
 * - retryWithBackoff()
 * - parseProgramError()
 * - safeGetAccountInfo()
 * - accountExists()
 */
/**
 * TOTAL FUNCTIONS AVAILABLE:
 *
 * Core Functions: 13
 * Game Type Helpers: 9
 * Analytics & Stats: 7
 * Batch Operations: 2
 * Calculations: 6
 * Utility Functions: 32+
 *
 * GRAND TOTAL: 69+ Functions
 *
 * This gives developers everything needed to build:
 * - Casino dApps
 * - Gaming platforms
 * - Prediction markets
 * - Lottery systems
 * - Binary options
 * - Esports betting
 * - Skill games
 * - Liquidity provision
 * - Analytics dashboards
 * - Gaming bots
 */
export default WhiskyGamingAPI;
