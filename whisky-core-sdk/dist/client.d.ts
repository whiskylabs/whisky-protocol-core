import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
export interface WhiskyState {
    authority: PublicKey;
    rngAddress: PublicKey;
    antiSpamFee: BN;
    whiskyFeeBps: BN;
    poolCreationAllowed: boolean;
    playingAllowed: boolean;
}
export interface Pool {
    poolAuthority: PublicKey;
    underlyingTokenMint: PublicKey;
    minWager: BN;
    plays: BN;
}
export interface Player {
    user: PublicKey;
    nonce: BN;
}
export interface Game {
    user: PublicKey;
    status: GameStatus;
    wager: BN;
    bet: number[];
    result: number;
}
export declare enum GameStatus {
    None = 0,
    ResultRequested = 1,
    Ready = 2
}
export interface WhiskyClientConfig {
    connection: Connection;
    wallet: anchor.Wallet;
    programId: string | PublicKey;
    cluster?: string;
    commitment?: anchor.web3.Commitment;
}
export interface CreatePoolParams {
    tokenMint: PublicKey;
    poolAuthority: PublicKey;
    lookupAddress?: PublicKey;
}
export interface DepositParams {
    pool: PublicKey;
    amount: number;
    tokenMint: PublicKey;
}
export interface PlaceBetParams {
    pool: PublicKey;
    amount: number;
    bet: number[];
    clientSeed?: string;
    creatorFeeBps?: number;
    jackpotFeeBps?: number;
    metadata?: string;
}
/**
 * Main client for interacting with the Whisky Gaming Protocol
 */
export declare class WhiskyGamingClient {
    connection: Connection;
    wallet: anchor.Wallet;
    program: Program;
    programId: PublicKey;
    constructor(config: WhiskyClientConfig);
    /**
     * Initialize the Whisky Gaming Protocol
     */
    initializeProtocol(): Promise<string>;
    /**
     * Get protocol state
     */
    getProtocolState(): Promise<WhiskyState>;
    /**
     * Create a new gaming pool
     */
    createPool(params: CreatePoolParams): Promise<string>;
    /**
     * Deposit liquidity to a pool
     */
    depositLiquidity(params: DepositParams): Promise<string>;
    /**
     * Initialize player account
     */
    initializePlayer(): Promise<string>;
    /**
     * Place a bet
     */
    placeBet(params: PlaceBetParams): Promise<string>;
    /**
     * Claim winnings
     */
    claimWinnings(): Promise<string>;
    /**
     * Get pool information
     */
    getPool(poolAddress: PublicKey): Promise<Pool>;
    /**
     * Get player information
     */
    getPlayer(playerAddress?: PublicKey): Promise<Player>;
    /**
     * Get game information
     */
    getGame(gameAddress?: PublicKey): Promise<Game>;
    /**
     * Find pool address for a token mint and authority
     */
    findPoolAddress(tokenMint: PublicKey, poolAuthority: PublicKey): PublicKey;
    /**
     * Calculate expected LP tokens for a deposit
     */
    calculateLpTokens(depositAmount: number, poolLiquidity: number, lpSupply: number): number;
    /**
     * Calculate expected return from a bet
     */
    calculateExpectedReturn(bet: number[], wager: number): number;
}
