import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress 
} from '@solana/spl-token';
import BN from 'bn.js';

// Types (these would normally be generated from IDL)
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

export enum GameStatus {
  None = 0,
  ResultRequested = 1,
  Ready = 2,
}

// Configuration interface
export interface WhiskyClientConfig {
  connection: Connection;
  wallet: anchor.Wallet;
  programId: string | PublicKey;
  cluster?: string;
  commitment?: anchor.web3.Commitment;
}

// Operation parameters
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
export class WhiskyGamingClient {
  public connection: Connection;
  public wallet: anchor.Wallet;
  public program: Program;
  public programId: PublicKey;

  constructor(config: WhiskyClientConfig) {
    this.connection = config.connection;
    this.wallet = config.wallet;
    this.programId = typeof config.programId === 'string' 
      ? new PublicKey(config.programId) 
      : config.programId;

    // Set up provider
    const provider = new anchor.AnchorProvider(
      this.connection,
      this.wallet,
      { commitment: config.commitment || 'confirmed' }
    );

    // Initialize program (you'd load the actual IDL here)
    // For now, we'll use a mock setup
    this.program = new Program({} as any, this.programId, provider);
  }

  // ================================
  // PROTOCOL MANAGEMENT
  // ================================

  /**
   * Initialize the Whisky Gaming Protocol
   */
  async initializeProtocol(): Promise<string> {
    const [whiskyState] = PublicKey.findProgramAddressSync(
      [Buffer.from('WHISKY_STATE')],
      this.programId
    );

    const tx = await this.program.methods
      .whiskyInitialize()
      .accounts({
        whiskyState,
        initializer: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Get protocol state
   */
  async getProtocolState(): Promise<WhiskyState> {
    const [whiskyState] = PublicKey.findProgramAddressSync(
      [Buffer.from('WHISKY_STATE')],
      this.programId
    );

    return await this.program.account.whiskyState.fetch(whiskyState);
  }

  // ================================
  // POOL OPERATIONS
  // ================================

  /**
   * Create a new gaming pool
   */
  async createPool(params: CreatePoolParams): Promise<string> {
    const [pool] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('POOL'),
        params.tokenMint.toBuffer(),
        params.poolAuthority.toBuffer(),
      ],
      this.programId
    );

    const [lpMint] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('POOL_LP_MINT'),
        params.tokenMint.toBuffer(),
        params.poolAuthority.toBuffer(),
      ],
      this.programId
    );

    const [whiskyState] = PublicKey.findProgramAddressSync(
      [Buffer.from('WHISKY_STATE')],
      this.programId
    );

    const poolUnderlyingAta = await getAssociatedTokenAddress(
      params.tokenMint,
      pool,
      true
    );

    const poolJackpotAta = await getAssociatedTokenAddress(
      params.tokenMint,
      pool,  
      true
    );

    const tx = await this.program.methods
      .poolInitialize(
        params.poolAuthority,
        params.lookupAddress || anchor.web3.Keypair.generate().publicKey
      )
      .accounts({
        whiskyState,
        pool,
        underlyingTokenMint: params.tokenMint,
        poolAuthority: params.poolAuthority,
        lpMint,
        poolUnderlyingTokenAccount: poolUnderlyingAta,
        poolJackpotTokenAccount: poolJackpotAta,
        user: this.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Deposit liquidity to a pool
   */
  async depositLiquidity(params: DepositParams): Promise<string> {
    const [whiskyState] = PublicKey.findProgramAddressSync(
      [Buffer.from('WHISKY_STATE')],
      this.programId
    );

    const userTokenAta = await getAssociatedTokenAddress(
      params.tokenMint,
      this.wallet.publicKey
    );

    const poolUnderlyingAta = await getAssociatedTokenAddress(
      params.tokenMint,
      params.pool,
      true
    );

    // Get LP mint address
    const poolData = await this.program.account.pool.fetch(params.pool);
    const [lpMint] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('POOL_LP_MINT'),
        params.tokenMint.toBuffer(),
        poolData.poolAuthority.toBuffer(),
      ],
      this.programId
    );

    const userLpAta = await getAssociatedTokenAddress(
      lpMint,
      this.wallet.publicKey
    );

    const tx = await this.program.methods
      .poolDeposit(new BN(params.amount))
      .accounts({
        whiskyState,
        pool: params.pool,
        underlyingTokenMint: params.tokenMint,
        lpMint,
        poolUnderlyingTokenAccount: poolUnderlyingAta,
        userUnderlyingAta: userTokenAta,
        userLpAta: userLpAta,
        user: this.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  // ================================
  // GAMING OPERATIONS
  // ================================

  /**
   * Initialize player account
   */
  async initializePlayer(): Promise<string> {
    const [player] = PublicKey.findProgramAddressSync(
      [Buffer.from('PLAYER'), this.wallet.publicKey.toBuffer()],
      this.programId
    );

    const [game] = PublicKey.findProgramAddressSync(
      [Buffer.from('GAME'), this.wallet.publicKey.toBuffer()],
      this.programId
    );

    const tx = await this.program.methods
      .playerInitialize()
      .accounts({
        player,
        game,
        user: this.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Place a bet
   */
  async placeBet(params: PlaceBetParams): Promise<string> {
    const [whiskyState] = PublicKey.findProgramAddressSync(
      [Buffer.from('WHISKY_STATE')],
      this.programId
    );

    const [player] = PublicKey.findProgramAddressSync(
      [Buffer.from('PLAYER'), this.wallet.publicKey.toBuffer()],
      this.programId
    );

    const [game] = PublicKey.findProgramAddressSync(
      [Buffer.from('GAME'), this.wallet.publicKey.toBuffer()],
      this.programId
    );

    const poolData = await this.program.account.pool.fetch(params.pool);
    const tokenMint = poolData.underlyingTokenMint;

    const userTokenAta = await getAssociatedTokenAddress(
      tokenMint,
      this.wallet.publicKey
    );

    const playerAta = await getAssociatedTokenAddress(
      tokenMint,
      player,
      true
    );

    const poolUnderlyingAta = await getAssociatedTokenAddress(
      tokenMint,
      params.pool,
      true
    );

    const tx = await this.program.methods
      .playGame(
        new BN(params.amount),
        params.bet,
        params.clientSeed || '',
        params.creatorFeeBps || 0,
        params.jackpotFeeBps || 0,
        params.metadata || ''
      )
      .accounts({
        whiskyState,
        pool: params.pool,
        player,
        game,
        underlyingTokenMint: tokenMint,
        poolUnderlyingTokenAccount: poolUnderlyingAta,
        userUnderlyingAta: userTokenAta,
        playerAta: playerAta,
        creator: this.wallet.publicKey, // Using user as creator for simplicity
        user: this.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Claim winnings
   */
  async claimWinnings(): Promise<string> {
    const [player] = PublicKey.findProgramAddressSync(
      [Buffer.from('PLAYER'), this.wallet.publicKey.toBuffer()],
      this.programId
    );

    const [game] = PublicKey.findProgramAddressSync(
      [Buffer.from('GAME'), this.wallet.publicKey.toBuffer()],
      this.programId
    );

    const gameData = await this.program.account.game.fetch(game);
    const tokenMint = gameData.tokenMint;

    const userTokenAta = await getAssociatedTokenAddress(
      tokenMint,
      this.wallet.publicKey
    );

    const playerAta = await getAssociatedTokenAddress(
      tokenMint,
      player,
      true
    );

    const tx = await this.program.methods
      .playerClaim()
      .accounts({
        player,
        game,
        underlyingTokenMint: tokenMint,
        playerAta: playerAta,
        userUnderlyingAta: userTokenAta,
        user: this.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  // ================================
  // DATA FETCHING
  // ================================

  /**
   * Get pool information
   */
  async getPool(poolAddress: PublicKey): Promise<Pool> {
    return await this.program.account.pool.fetch(poolAddress);
  }

  /**
   * Get player information
   */
  async getPlayer(playerAddress?: PublicKey): Promise<Player> {
    const address = playerAddress || PublicKey.findProgramAddressSync(
      [Buffer.from('PLAYER'), this.wallet.publicKey.toBuffer()],
      this.programId
    )[0];

    return await this.program.account.player.fetch(address);
  }

  /**
   * Get game information
   */
  async getGame(gameAddress?: PublicKey): Promise<Game> {
    const address = gameAddress || PublicKey.findProgramAddressSync(
      [Buffer.from('GAME'), this.wallet.publicKey.toBuffer()],
      this.programId
    )[0];

    return await this.program.account.game.fetch(address);
  }

  // ================================
  // UTILITIES
  // ================================

  /**
   * Find pool address for a token mint and authority
   */
  findPoolAddress(tokenMint: PublicKey, poolAuthority: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('POOL'),
        tokenMint.toBuffer(),
        poolAuthority.toBuffer(),
      ],
      this.programId
    )[0];
  }

  /**
   * Calculate expected LP tokens for a deposit
   */
  calculateLpTokens(depositAmount: number, poolLiquidity: number, lpSupply: number): number {
    if (lpSupply === 0 || poolLiquidity === 0) {
      return depositAmount;
    }
    return (depositAmount * lpSupply) / poolLiquidity;
  }

  /**
   * Calculate expected return from a bet
   */
  calculateExpectedReturn(bet: number[], wager: number): number {
    const totalWeight = bet.reduce((sum, weight) => sum + weight, 0);
    let expectedValue = 0;

    for (let i = 0; i < bet.length; i++) {
      if (bet[i] > 0) {
        const probability = bet[i] / totalWeight;
        const multiplier = totalWeight / bet[i];
        const payout = wager * multiplier;
        expectedValue += probability * payout;
      }
    }

    return expectedValue;
  }
} 