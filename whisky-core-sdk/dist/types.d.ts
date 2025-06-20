import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - COMPREHENSIVE TYPE DEFINITIONS 🎮
 * ============================================================================
 */
export interface WhiskyState {
    /** Protocol authority with admin powers */
    authority: PublicKey;
    /** Random number generator address */
    rngAddress: PublicKey;
    /** Fee for anti-spam protection (in lamports) */
    antiSpamFee: BN;
    /** Whisky protocol fee in basis points */
    whiskyFeeBps: BN;
    /** Maximum creator fee allowed in basis points */
    maxCreatorFeeBps: BN;
    /** Fee for creating pools (in lamports) */
    poolCreationFee: BN;
    /** Maximum house edge in basis points */
    maxHouseEdgeBps: BN;
    /** Default pool fee in basis points */
    defaultPoolFeeBps: BN;
    /** Jackpot distribution: percentage to user */
    jackpotToUserBps: BN;
    /** Jackpot distribution: percentage to creator */
    jackpotToCreatorBps: BN;
    /** Jackpot distribution: percentage to pool */
    jackpotToPoolBps: BN;
    /** Jackpot distribution: percentage to whisky */
    jackpotToWhiskyBps: BN;
    /** Bonus multiplier ratio */
    bonusRatioBps: BN;
    /** Maximum wager amount */
    maxWager: BN;
    /** Minimum pool balance requirement */
    minPoolBalance: BN;
    /** Whether new pools can be created */
    poolCreationAllowed: boolean;
    /** Whether playing is currently allowed */
    playingAllowed: boolean;
    /** Whether withdrawals are allowed */
    withdrawalsAllowed: boolean;
    /** Whether deposits are allowed */
    depositsAllowed: boolean;
    /** Anti-spam settings authority */
    antiSpamAuthority: PublicKey;
}
export interface Pool {
    /** Pool authority (creator/manager) */
    poolAuthority: PublicKey;
    /** Underlying token mint for the pool */
    underlyingTokenMint: PublicKey;
    /** Pool's LP token mint */
    lpMint: PublicKey;
    /** Minimum wager amount for this pool */
    minWager: BN;
    /** Maximum wager amount for this pool */
    maxWager: BN;
    /** Creator fee for this pool in basis points */
    creatorFeeBps: BN;
    /** House edge for this pool in basis points */
    houseEdgeBps: BN;
    /** Current total liquidity in the pool */
    totalLiquidity: BN;
    /** Total LP tokens in circulation */
    lpSupply: BN;
    /** Number of games played in this pool */
    plays: BN;
    /** Total volume processed by this pool */
    volume: BN;
    /** Total fees collected by the pool */
    feesCollected: BN;
    /** Pool creation timestamp */
    createdAt: BN;
    /** Whether the pool is active */
    isActive: boolean;
    /** Optional lookup table address for optimization */
    lookupAddress?: PublicKey;
}
export interface Player {
    /** Player's wallet address */
    user: PublicKey;
    /** Current nonce for randomness */
    nonce: BN;
    /** Total games played by this player */
    totalGames: BN;
    /** Total wagered amount */
    totalWagered: BN;
    /** Total winnings */
    totalWinnings: BN;
    /** Player's profit/loss */
    netProfitLoss: BN;
    /** Last game timestamp */
    lastGameAt: BN;
    /** Player registration timestamp */
    createdAt: BN;
    /** Whether player account is active */
    isActive: boolean;
}
export interface Game {
    /** Player who initiated the game */
    user: PublicKey;
    /** Pool where the game is being played */
    pool: PublicKey;
    /** Token mint used for the game */
    tokenMint: PublicKey;
    /** Current game status */
    status: GameStatus;
    /** Wager amount in tokens */
    wager: BN;
    /** Player's bet array */
    bet: number[];
    /** Random result from RNG */
    result: number;
    /** Payout amount (if won) */
    payout: BN;
    /** Creator fee for this game */
    creatorFeeBps: number;
    /** Jackpot fee for this game */
    jackpotFeeBps: number;
    /** Client seed for additional randomness */
    clientSeed: string;
    /** Game metadata */
    metadata: string;
    /** Game creation timestamp */
    createdAt: BN;
    /** Game completion timestamp */
    completedAt?: BN;
    /** Whether this was a winning game */
    isWin: boolean;
}
export declare enum GameStatus {
    /** No active game */
    None = 0,
    /** Result requested from RNG */
    ResultRequested = 1,
    /** Game ready to be settled */
    Ready = 2,
    /** Game completed */
    Completed = 3,
    /** Game failed/cancelled */
    Failed = 4
}
export interface ProtocolConfig {
    rngAddress: PublicKey;
    whiskyFeeBps: number;
    maxCreatorFeeBps: number;
    poolCreationFee: number;
    antiSpamFee: number;
    maxHouseEdgeBps: number;
    defaultPoolFeeBps: number;
    jackpotToUserBps: number;
    jackpotToCreatorBps: number;
    jackpotToPoolBps: number;
    jackpotToWhiskyBps: number;
    bonusRatioBps: number;
    maxWager: number;
    minPoolBalance: number;
    poolCreationAllowed: boolean;
    playingAllowed: boolean;
    withdrawalsAllowed: boolean;
    depositsAllowed: boolean;
    antiSpamAuthority: PublicKey;
}
export interface PoolConfig {
    tokenMint: PublicKey;
    poolAuthority: PublicKey;
    minWager?: number;
    maxWager?: number;
    creatorFeeBps?: number;
    houseEdgeBps?: number;
    lookupAddress?: PublicKey;
}
export interface CreatePoolParams {
    /** Token mint for the pool */
    tokenMint: PublicKey;
    /** Pool authority (creator) */
    poolAuthority: PublicKey;
    /** Minimum wager amount */
    minWager?: number;
    /** Maximum wager amount */
    maxWager?: number;
    /** Creator fee in basis points */
    creatorFeeBps?: number;
    /** House edge in basis points */
    houseEdgeBps?: number;
    /** Optional lookup table for optimization */
    lookupAddress?: PublicKey;
}
export interface DepositLiquidityParams {
    /** Pool to deposit into */
    pool: PublicKey;
    /** Amount to deposit */
    amount: number;
    /** Token mint */
    tokenMint: PublicKey;
    /** User's token account */
    userTokenAccount?: PublicKey;
}
export interface WithdrawLiquidityParams {
    /** Pool to withdraw from */
    pool: PublicKey;
    /** LP tokens to burn */
    lpAmount: number;
    /** Token mint */
    tokenMint: PublicKey;
    /** User's token account */
    userTokenAccount?: PublicKey;
    /** User's LP token account */
    userLpAccount?: PublicKey;
}
export interface PlaceBetParams {
    /** Pool to bet in */
    pool: PublicKey;
    /** Wager amount */
    amount: number;
    /** Bet array (odds/weights) */
    bet: number[];
    /** Client seed for additional randomness */
    clientSeed?: string;
    /** Creator fee override */
    creatorFeeBps?: number;
    /** Jackpot fee override */
    jackpotFeeBps?: number;
    /** Game metadata */
    metadata?: string;
    /** User's token account */
    userTokenAccount?: PublicKey;
    /** Game creator address */
    creator?: PublicKey;
}
export interface ClaimWinningsParams {
    /** Pool where winnings are */
    pool: PublicKey;
    /** Game to claim from */
    game: PublicKey;
    /** User's token account */
    userTokenAccount?: PublicKey;
}
export interface TransactionResult {
    /** Transaction signature */
    signature: string;
    /** Transaction success status */
    success: boolean;
    /** Error message if failed */
    error?: string;
    /** Additional data */
    data?: any;
}
export interface GameResult extends TransactionResult {
    /** Game account address */
    game: PublicKey;
    /** Whether the bet won */
    isWin: boolean;
    /** Winning amount */
    payout: number;
    /** RNG result */
    result: number;
    /** Expected return */
    expectedReturn: number;
}
export interface PoolStats {
    /** Pool address */
    address: PublicKey;
    /** Pool configuration */
    config: Pool;
    /** Current TVL */
    totalValueLocked: number;
    /** LP token price */
    lpTokenPrice: number;
    /** 24h volume */
    volume24h: number;
    /** Total volume */
    totalVolume: number;
    /** Number of active players */
    activePlayers: number;
    /** Pool APY */
    apy: number;
    /** House edge */
    houseEdge: number;
}
export interface PlayerStats {
    /** Player address */
    address: PublicKey;
    /** Player configuration */
    config: Player;
    /** Win rate percentage */
    winRate: number;
    /** Average bet size */
    avgBetSize: number;
    /** Profit/Loss ratio */
    profitLossRatio: number;
    /** Total ROI */
    totalROI: number;
    /** Favorite pools */
    favoritePools: PublicKey[];
}
export interface GamePlayedEvent {
    player: PublicKey;
    pool: PublicKey;
    game: PublicKey;
    wager: BN;
    bet: number[];
    result: number;
    payout: BN;
    isWin: boolean;
    timestamp: BN;
}
export interface LiquidityDepositedEvent {
    depositor: PublicKey;
    pool: PublicKey;
    amount: BN;
    lpTokens: BN;
    timestamp: BN;
}
export interface LiquidityWithdrawnEvent {
    withdrawer: PublicKey;
    pool: PublicKey;
    lpTokensBurned: BN;
    amountWithdrawn: BN;
    timestamp: BN;
}
export interface PoolCreatedEvent {
    creator: PublicKey;
    pool: PublicKey;
    tokenMint: PublicKey;
    timestamp: BN;
}
export interface BetOdds {
    outcome: number;
    probability: number;
    payout: number;
    expectedValue: number;
}
export interface PoolMetrics {
    totalLiquidity: number;
    utilization: number;
    volume24h: number;
    feesEarned24h: number;
    activeGames: number;
    avgGameSize: number;
}
export interface RiskMetrics {
    maxLoss: number;
    valueAtRisk: number;
    sharpeRatio: number;
    volatility: number;
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
export interface PoolLiquidity {
    underlying: BN;
    bonus: BN;
    jackpot: BN;
    total: BN;
    utilizationRate: number;
}
export interface BetValidation {
    isValid: boolean;
    errors: string[];
    totalWeight: number;
    outcomes: number;
    maxPayout: BN;
    houseEdge: number;
}
export interface WagerValidation {
    isValid: boolean;
    errors: string[];
    minWager: BN;
    maxWager: BN;
    availableLiquidity: BN;
}
export interface WhiskySDKConfig {
    /** Solana connection */
    connection: import('@solana/web3.js').Connection;
    /** Wallet for signing transactions */
    wallet: import('@coral-xyz/anchor').Wallet;
    /** Whisky Gaming program ID */
    programId: string | PublicKey;
    /** Cluster configuration */
    cluster?: 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';
    /** Commitment level */
    commitment?: import('@solana/web3.js').Commitment;
    /** Enable debug logging */
    debug?: boolean;
}
export interface SDKOptions {
    /** Skip account validation */
    skipAccountValidation?: boolean;
    /** Custom timeout for transactions */
    timeout?: number;
    /** Enable automatic retry */
    enableRetry?: boolean;
    /** Maximum retry attempts */
    maxRetries?: number;
}
