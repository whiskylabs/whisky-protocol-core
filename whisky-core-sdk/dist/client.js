"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhiskyGamingClient = void 0;
const anchor = __importStar(require("@coral-xyz/anchor"));
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const bn_js_1 = __importDefault(require("bn.js"));
const types_1 = require("./types");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const errors_1 = require("./errors");
/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - MAIN CLIENT 🎮
 * ============================================================================
 */
class WhiskyGamingClient {
    constructor(config, options = {}) {
        this.connection = config.connection;
        this.wallet = config.wallet;
        this.programId = new web3_js_1.PublicKey('6R7S7r6KzU1A5YACXCaKuF6GcEcv5ZdXU4hh8vPozcw6');
        this.options = {
            skipAccountValidation: false,
            timeout: 30000,
            enableRetry: true,
            maxRetries: 3,
            ...options
        };
        this._debug = config.debug || false;
        // Set up provider
        const provider = new anchor.AnchorProvider(this.connection, this.wallet, {
            commitment: config.commitment || constants_1.COMMITMENT_LEVEL,
            preflightCommitment: constants_1.PREFLIGHT_COMMITMENT
        });
        // Initialize program with minimal IDL structure
        const minimalIdl = {
            version: "0.1.0",
            name: "whisky_core",
            instructions: [],
            accounts: [],
            metadata: { address: this.programId.toString() }
        };
        this.program = new anchor_1.Program(minimalIdl, provider);
        this.log('WhiskyGamingClient initialized', {
            programId: this.programId.toString(),
            wallet: this.wallet.publicKey.toString(),
            cluster: config.cluster || 'unknown'
        });
    }
    // ================================
    // UTILITY METHODS
    // ================================
    log(message, data) {
        if (this._debug) {
            console.log(`[WhiskySDK] ${message}`, data || '');
        }
    }
    async sendTransaction(transaction) {
        const blockhash = await this.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash.blockhash;
        transaction.feePayer = this.wallet.publicKey;
        const signedTx = await this.wallet.signTransaction(transaction);
        const signature = await this.connection.sendRawTransaction(signedTx.serialize());
        await this.connection.confirmTransaction(signature);
        return signature;
    }
    async withRetry(operation, operationName) {
        if (!this.options.enableRetry) {
            return operation();
        }
        try {
            return await (0, utils_1.retryWithBackoff)(operation, this.options.maxRetries, 1000);
        }
        catch (error) {
            this.log(`Operation failed: ${operationName}`, error);
            throw new errors_1.WhiskyError(`Failed to execute ${operationName}: ${(0, utils_1.parseProgramError)(error).message}`, 'OPERATION_FAILED', error);
        }
    }
    get user() {
        return this.wallet.publicKey;
    }
    // ================================
    // PROTOCOL MANAGEMENT
    // ================================
    /**
     * Initialize the Whisky Gaming Protocol (admin only)
     */
    async initializeProtocol() {
        try {
            const [whiskyState] = (0, utils_1.deriveWhiskyStatePDA)(this.programId);
            const instruction = await this.program.methods
                .whiskyInitialize()
                .accounts({
                whiskyState,
                initializer: this.user,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction();
            const transaction = new web3_js_1.Transaction().add(instruction);
            const signature = await this.sendTransaction(transaction);
            this.log('Protocol initialized', { signature, whiskyState: whiskyState.toString() });
            return {
                signature,
                success: true,
                data: { whiskyState }
            };
        }
        catch (error) {
            throw new errors_1.WhiskyConfigError('Failed to initialize protocol', error);
        }
    }
    /**
     * Get the current protocol state
     */
    async getProtocolState() {
        const [whiskyState] = (0, utils_1.deriveWhiskyStatePDA)(this.programId);
        try {
            const accountInfo = await this.connection.getAccountInfo(whiskyState);
            if (!accountInfo) {
                throw new Error('Protocol state not found');
            }
            // In a real implementation, you would deserialize the account data
            return {};
        }
        catch (error) {
            throw new errors_1.WhiskyConfigError('Failed to fetch protocol state', error);
        }
    }
    /**
     * Update protocol configuration (admin only)
     */
    async updateProtocolConfig(config) {
        try {
            const [whiskyState] = (0, utils_1.deriveWhiskyStatePDA)(this.programId);
            const instruction = await this.program.methods
                .whiskySetConfig(config.rngAddress || web3_js_1.PublicKey.default, new bn_js_1.default(config.whiskyFee || 200), new bn_js_1.default(config.maxCreatorFee || 500), new bn_js_1.default(config.poolCreationFee || 1000000), new bn_js_1.default(config.antiSpamFee || 5000), new bn_js_1.default(config.maxHouseEdge || 1000), new bn_js_1.default(config.defaultPoolFee || 100), new bn_js_1.default(config.jackpotPayoutToUserBps || 7000), new bn_js_1.default(config.jackpotPayoutToCreatorBps || 1000), new bn_js_1.default(config.jackpotPayoutToPoolBps || 1000), new bn_js_1.default(config.jackpotPayoutToWhiskyBps || 1000), new bn_js_1.default(config.bonusToJackpotRatioBps || 100), new bn_js_1.default(config.maxPayoutBps || 10000), new bn_js_1.default(config.poolWithdrawFeeBps || 100), config.poolCreationAllowed ?? true, config.poolDepositAllowed ?? true, config.poolWithdrawAllowed ?? true, config.playingAllowed ?? true, config.distributionRecipient || this.user)
                .accounts({
                whiskyState,
                authority: this.user,
            })
                .instruction();
            const transaction = new web3_js_1.Transaction().add(instruction);
            const signature = await this.sendTransaction(transaction);
            return {
                signature,
                success: true,
                data: config
            };
        }
        catch (error) {
            throw new errors_1.WhiskyConfigError('Failed to update protocol configuration', error);
        }
    }
    // ================================
    // POOL OPERATIONS
    // ================================
    /**
     * Create a new gaming pool
     */
    async createPool(params) {
        try {
            const [whiskyState] = (0, utils_1.deriveWhiskyStatePDA)(this.programId);
            const [pool] = (0, utils_1.derivePoolPDA)(params.tokenMint, params.poolAuthority, this.programId);
            const [lpMint] = (0, utils_1.derivePoolLpMintPDA)(params.tokenMint, params.poolAuthority, this.programId);
            const poolUnderlyingAta = (0, utils_1.getPoolTokenAccount)(pool, params.tokenMint);
            const poolJackpotAta = (0, utils_1.getPoolTokenAccount)(pool, params.tokenMint); // Using same for jackpot
            const instruction = await this.program.methods
                .poolInitialize(params.poolAuthority, params.lookupAddress || anchor.web3.Keypair.generate().publicKey)
                .accounts({
                whiskyState,
                pool,
                underlyingTokenMint: params.tokenMint,
                poolAuthority: params.poolAuthority,
                lpMint,
                poolUnderlyingTokenAccount: poolUnderlyingAta,
                poolJackpotTokenAccount: poolJackpotAta,
                user: this.user,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction();
            const transaction = new web3_js_1.Transaction().add(instruction);
            const signature = await this.sendTransaction(transaction);
            this.log('Pool created', { signature, pool: pool.toString() });
            return {
                signature,
                success: true,
                data: { pool, lpMint, poolAuthority: params.poolAuthority }
            };
        }
        catch (error) {
            throw new errors_1.WhiskyPoolError('Failed to create pool', error);
        }
    }
    /**
     * Deposit liquidity to a pool
     */
    async depositLiquidity(params) {
        try {
            const poolAccount = await this.getPool(params.pool);
            const [whiskyState] = (0, utils_1.deriveWhiskyStatePDA)(this.programId);
            const [lpMint] = (0, utils_1.derivePoolLpMintPDA)(params.tokenMint, poolAccount.poolAuthority, this.programId);
            const poolUnderlyingAta = (0, utils_1.getPoolTokenAccount)(params.pool, params.tokenMint);
            const userUnderlyingAta = params.userTokenAccount || (0, utils_1.getUserTokenAccount)(this.user, params.tokenMint);
            const userLpAta = (0, utils_1.getUserTokenAccount)(this.user, lpMint);
            const instructions = [];
            // Create user's LP token account if it doesn't exist
            try {
                await this.connection.getAccountInfo(userLpAta);
            }
            catch {
                instructions.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(this.user, userLpAta, this.user, lpMint));
            }
            const depositInstruction = await this.program.methods
                .poolDeposit(new bn_js_1.default(params.amount))
                .accounts({
                whiskyState,
                pool: params.pool,
                underlyingTokenMint: params.tokenMint,
                lpMint,
                poolUnderlyingTokenAccount: poolUnderlyingAta,
                userUnderlyingAta,
                userLpAta,
                user: this.user,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction();
            instructions.push(depositInstruction);
            const transaction = new web3_js_1.Transaction().add(...instructions);
            const signature = await this.sendTransaction(transaction);
            this.log('Liquidity deposited', { signature, amount: params.amount });
            return {
                signature,
                success: true,
                data: { amount: params.amount, pool: params.pool }
            };
        }
        catch (error) {
            throw new errors_1.WhiskyPoolError('Failed to deposit liquidity', error);
        }
    }
    /**
     * Withdraw liquidity from a pool
     */
    async withdrawLiquidity(params) {
        try {
            const poolAccount = await this.getPool(params.pool);
            const [whiskyState] = (0, utils_1.deriveWhiskyStatePDA)(this.programId);
            const [lpMint] = (0, utils_1.derivePoolLpMintPDA)(params.tokenMint, poolAccount.poolAuthority, this.programId);
            const poolUnderlyingAta = (0, utils_1.getPoolTokenAccount)(params.pool, params.tokenMint);
            const userUnderlyingAta = params.userTokenAccount || (0, utils_1.getUserTokenAccount)(this.user, params.tokenMint);
            const userLpAta = params.userLpAccount || (0, utils_1.getUserTokenAccount)(this.user, lpMint);
            const instruction = await this.program.methods
                .poolWithdraw(new bn_js_1.default(params.lpAmount))
                .accounts({
                whiskyState,
                pool: params.pool,
                underlyingTokenMint: params.tokenMint,
                lpMint,
                poolUnderlyingTokenAccount: poolUnderlyingAta,
                userUnderlyingAta,
                userLpAta,
                user: this.user,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction();
            const transaction = new web3_js_1.Transaction().add(instruction);
            const signature = await this.sendTransaction(transaction);
            this.log('Liquidity withdrawn', { signature, lpAmount: params.lpAmount });
            return {
                signature,
                success: true,
                data: { lpAmount: params.lpAmount, pool: params.pool }
            };
        }
        catch (error) {
            throw new errors_1.WhiskyPoolError('Failed to withdraw liquidity', error);
        }
    }
    /**
     * Get pool information
     */
    async getPool(poolAddress) {
        try {
            const accountInfo = await this.connection.getAccountInfo(poolAddress);
            if (!accountInfo) {
                throw new Error('Pool not found');
            }
            // In a real implementation, you would deserialize the account data
            return { poolAuthority: web3_js_1.PublicKey.default, underlyingTokenMint: web3_js_1.PublicKey.default, plays: 0 };
        }
        catch (error) {
            throw new errors_1.WhiskyPoolError('Failed to fetch pool data', error);
        }
    }
    /**
     * Get pool statistics
     */
    async getPoolStats(poolAddress) {
        try {
            const pool = await this.getPool(poolAddress);
            // Get pool token account to calculate TVL
            const poolTokenAccount = (0, utils_1.getPoolTokenAccount)(poolAddress, pool.underlyingTokenMint);
            const accountInfo = await this.connection.getAccountInfo(poolTokenAccount);
            const totalValueLocked = accountInfo ? 0 : 0; // Would need to parse token account data
            return {
                address: poolAddress,
                config: pool,
                totalValueLocked,
                lpTokenPrice: 1, // Would calculate from LP mint supply
                volume24h: 0, // Would need to calculate from events
                totalVolume: Number(pool.plays || 0),
                activePlayers: 0, // Would need to calculate from player accounts
                apy: 0, // Would calculate from fees earned
                houseEdge: 0 // Would calculate from pool settings
            };
        }
        catch (error) {
            throw new errors_1.WhiskyPoolError('Failed to calculate pool stats', error);
        }
    }
    // ================================
    // PLAYER OPERATIONS
    // ================================
    /**
     * Initialize a player account
     */
    async initializePlayer() {
        try {
            const [player] = (0, utils_1.derivePlayerPDA)(this.user, this.programId);
            const [game] = (0, utils_1.deriveGamePDA)(this.user, this.programId);
            const instruction = await this.program.methods
                .playerInitialize()
                .accounts({
                player,
                game,
                user: this.user,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction();
            const transaction = new web3_js_1.Transaction().add(instruction);
            const signature = await this.sendTransaction(transaction);
            this.log('Player initialized', { signature, player: player.toString() });
            return {
                signature,
                success: true,
                data: { player }
            };
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to initialize player', error);
        }
    }
    /**
     * Get player information
     */
    async getPlayer(userAddress) {
        const user = userAddress || this.user;
        const [player] = (0, utils_1.derivePlayerPDA)(user, this.programId);
        try {
            return await this.program.account.player.fetch(player);
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to fetch player data', error);
        }
    }
    // ================================
    // GAMING OPERATIONS
    // ================================
    /**
     * Place a bet in a pool
     */
    async placeBet(params) {
        try {
            // Validate the bet
            const betValidation = (0, utils_1.validateBet)(params.bet);
            if (!betValidation.isValid) {
                throw new errors_1.WhiskyGameError(`Invalid bet: ${betValidation.errors.join(', ')}`);
            }
            const [whiskyState] = (0, utils_1.deriveWhiskyStatePDA)(this.programId);
            const pool = await this.getPool(params.pool);
            const [player] = (0, utils_1.derivePlayerPDA)(this.user, this.programId);
            const [game] = (0, utils_1.deriveGamePDA)(this.user, this.programId);
            const userTokenAccount = params.userTokenAccount || (0, utils_1.getUserTokenAccount)(this.user, pool.underlyingTokenMint);
            const poolUnderlyingAta = (0, utils_1.getPoolTokenAccount)(params.pool, pool.underlyingTokenMint);
            const playerAta = (0, utils_1.getUserTokenAccount)(player, pool.underlyingTokenMint);
            const clientSeed = params.clientSeed || (0, utils_1.generateClientSeed)();
            const creatorFeeBps = params.creatorFeeBps || 0;
            const jackpotFeeBps = params.jackpotFeeBps || 50;
            const instruction = await this.program.methods
                .playGame(new bn_js_1.default(params.amount), params.bet, clientSeed, creatorFeeBps, jackpotFeeBps, params.metadata || '')
                .accounts({
                whiskyState,
                pool: params.pool,
                player,
                game,
                underlyingTokenMint: pool.underlyingTokenMint,
                poolUnderlyingTokenAccount: poolUnderlyingAta,
                userUnderlyingAta: userTokenAccount,
                playerAta,
                creator: params.creator || this.user,
                user: this.user,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction();
            const transaction = new web3_js_1.Transaction().add(instruction);
            const signature = await this.sendTransaction(transaction);
            this.log('Bet placed', { signature, game: game.toString(), amount: params.amount });
            // Calculate expected payout
            const expectedPayout = (0, utils_1.calculateExpectedPayout)(params.bet, params.amount);
            return {
                signature,
                success: true,
                game,
                isWin: false, // Will be determined after RNG settlement
                payout: 0, // Will be set after settlement
                result: 0, // Will be set after settlement  
                expectedReturn: expectedPayout.expectedValue,
                data: { game, pool: params.pool, wager: params.amount }
            };
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to place bet', error);
        }
    }
    /**
     * Claim winnings from a completed game
     */
    async claimWinnings(gameAddress) {
        try {
            const game = await this.getGame(gameAddress);
            const [player] = (0, utils_1.derivePlayerPDA)(this.user, this.programId);
            const userTokenAccount = (0, utils_1.getUserTokenAccount)(this.user, game.tokenMint);
            const playerAta = (0, utils_1.getUserTokenAccount)(player, game.tokenMint);
            const instruction = await this.program.methods
                .playerClaim()
                .accounts({
                player,
                game: gameAddress,
                underlyingTokenMint: game.tokenMint,
                playerAta,
                userUnderlyingAta: userTokenAccount,
                user: this.user,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            })
                .instruction();
            const transaction = new web3_js_1.Transaction().add(instruction);
            const signature = await this.sendTransaction(transaction);
            this.log('Winnings claimed', { signature, game: gameAddress.toString() });
            return {
                signature,
                success: true,
                data: { game: gameAddress, payout: 0 } // Would get payout from game account
            };
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to claim winnings', error);
        }
    }
    /**
     * Get game information
     */
    async getGame(gameAddress) {
        try {
            return await this.program.account.game.fetch(gameAddress);
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to fetch game data', error);
        }
    }
    // ================================
    // UTILITY METHODS
    // ================================
    /**
     * Find all pools for a specific token
     */
    async findPoolsForToken(tokenMint) {
        try {
            const pools = await this.program.account.pool.all([
                {
                    memcmp: {
                        offset: 8 + 32, // Skip discriminator and pool_authority
                        bytes: tokenMint.toBase58()
                    }
                }
            ]);
            return pools.map((pool) => pool.publicKey);
        }
        catch (error) {
            throw new errors_1.WhiskyPoolError('Failed to find pools for token', error);
        }
    }
    /**
     * Get user's games across all pools
     */
    async getUserGames(userAddress) {
        const user = userAddress || this.user;
        try {
            const games = await this.program.account.game.all([
                {
                    memcmp: {
                        offset: 8 + 8, // Skip discriminator and nonce
                        bytes: user.toBase58()
                    }
                }
            ]);
            return games.map((game) => game.publicKey);
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to fetch user games', error);
        }
    }
    /**
     * Calculate expected LP tokens for a deposit
     */
    async calculateLpTokensForDeposit(poolAddress, depositAmount) {
        try {
            const pool = await this.getPool(poolAddress);
            // Would need to get actual pool liquidity and LP supply
            const lpTokens = (0, utils_1.calculateLpTokens)(depositAmount, 0, // pool liquidity
            0 // LP supply
            );
            return lpTokens.toNumber();
        }
        catch (error) {
            throw new errors_1.WhiskyPoolError('Failed to calculate LP tokens', error);
        }
    }
    /**
     * Calculate withdrawal amount for LP tokens
     */
    async calculateWithdrawalForLpTokens(poolAddress, lpTokens) {
        try {
            const pool = await this.getPool(poolAddress);
            const withdrawAmount = (0, utils_1.calculateWithdrawAmount)(lpTokens, 0, // pool liquidity
            0 // LP supply
            );
            return withdrawAmount.toNumber();
        }
        catch (error) {
            throw new errors_1.WhiskyPoolError('Failed to calculate withdrawal amount', error);
        }
    }
    /**
     * Close player account to reclaim rent
     */
    async closePlayerAccount() {
        try {
            const [player] = (0, utils_1.derivePlayerPDA)(this.user, this.programId);
            const [game] = (0, utils_1.deriveGamePDA)(this.user, this.programId);
            const instruction = await this.program.methods
                .playerClose()
                .accounts({
                player,
                game,
                user: this.user,
            })
                .instruction();
            const transaction = new web3_js_1.Transaction().add(instruction);
            const signature = await this.sendTransaction(transaction);
            this.log('Player account closed', { signature });
            return {
                signature,
                success: true
            };
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to close player account', error);
        }
    }
    // ================================
    // RNG FUNCTIONS (RNG Authority Only)
    // ================================
    /**
     * Settle game with RNG result (RNG authority only)
     */
    async settleGameWithRNG(gameAddress, rngSeed, nextRngSeedHashed) {
        try {
            const gameAccount = await this.getGame(gameAddress);
            const [whiskyState] = (0, utils_1.deriveWhiskyStatePDA)(this.programId);
            const poolUnderlyingTokenAccount = (0, utils_1.getPoolTokenAccount)(gameAccount.pool, gameAccount.tokenMint);
            const poolJackpotTokenAccount = (0, utils_1.getPoolTokenAccount)(gameAccount.pool, gameAccount.tokenMint);
            const instruction = await this.program.methods
                .rngSettle(rngSeed, nextRngSeedHashed)
                .accounts({
                whiskyState,
                game: gameAddress,
                poolUnderlyingTokenAccount,
                poolJackpotTokenAccount,
                pool: gameAccount.pool,
                underlyingTokenMint: gameAccount.tokenMint,
                rng: this.user,
            })
                .instruction();
            const transaction = new web3_js_1.Transaction().add(instruction);
            const signature = await this.sendTransaction(transaction);
            this.log('Game settled with RNG', { signature, gameAddress: gameAddress.toString() });
            return {
                signature,
                success: true,
                data: { rngSeed, nextRngSeedHashed }
            };
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to settle game with RNG', error);
        }
    }
    /**
     * Provide next RNG seed hash (RNG authority only)
     */
    async provideRNGSeedHash(gameAddress, nextRngSeedHashed) {
        try {
            const [whiskyState] = (0, utils_1.deriveWhiskyStatePDA)(this.programId);
            const instruction = await this.program.methods
                .rngProvideHashedSeed(nextRngSeedHashed)
                .accounts({
                whiskyState,
                game: gameAddress,
                rng: this.user,
            })
                .instruction();
            const transaction = new web3_js_1.Transaction().add(instruction);
            const signature = await this.sendTransaction(transaction);
            this.log('RNG seed hash provided', { signature, gameAddress: gameAddress.toString() });
            return {
                signature,
                success: true,
                data: { nextRngSeedHashed }
            };
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to provide RNG seed hash', error);
        }
    }
    // ================================
    // ADVANCED GAMING HELPERS
    // ================================
    /**
     * Get player statistics across all pools
     */
    async getPlayerStats(userAddress) {
        const user = userAddress || this.user;
        try {
            const player = await this.getPlayer(user);
            const games = await this.getUserGames(user);
            let totalWagered = 0;
            let totalWon = 0;
            let gamesPlayed = games.length;
            let gamesWon = 0;
            for (const gameAddress of games) {
                try {
                    const game = await this.getGame(gameAddress);
                    totalWagered += Number(game.wager || 0);
                    // Would need to calculate winnings from game result
                    if (game.status === types_1.GameStatus.Ready) {
                        gamesWon++;
                    }
                }
                catch (e) {
                    // Skip games that can't be fetched
                }
            }
            return {
                address: user,
                config: player,
                winRate: gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0,
                avgBetSize: gamesPlayed > 0 ? totalWagered / gamesPlayed : 0,
                profitLossRatio: totalWagered > 0 ? totalWon / totalWagered : 0,
                totalROI: totalWagered > 0 ? ((totalWon - totalWagered) / totalWagered) * 100 : 0,
                favoritePools: [] // Would need additional logic to determine favorite pools
            };
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to get player stats', error);
        }
    }
    /**
     * Create a coin flip bet (50/50 odds)
     */
    createCoinFlipBet() {
        return [50, 50];
    }
    /**
     * Create a dice roll bet (1-6, equal odds)
     */
    createDiceRollBet() {
        return [1, 1, 1, 1, 1, 1];
    }
    /**
     * Create a weighted dice bet (bias towards 6)
     */
    createWeightedDiceBet(bias = 2) {
        return [1, 1, 1, 1, 1, bias];
    }
    /**
     * Create a roulette bet (European style, 37 slots)
     */
    createRouletteBet() {
        return new Array(37).fill(1);
    }
    /**
     * Create a custom weighted bet
     */
    createCustomBet(weights) {
        if (weights.length < 2 || weights.length > 256) {
            throw new errors_1.WhiskyGameError('Bet must have between 2 and 256 outcomes');
        }
        return weights;
    }
    /**
     * Simulate a game result (for testing)
     */
    simulateGameResult(bet, clientSeed) {
        const totalWeight = bet.reduce((sum, weight) => sum + weight, 0);
        const randomValue = Math.random() * totalWeight;
        let cumulativeWeight = 0;
        let outcome = 0;
        for (let i = 0; i < bet.length; i++) {
            cumulativeWeight += bet[i];
            if (randomValue <= cumulativeWeight) {
                outcome = i;
                break;
            }
        }
        const multiplier = totalWeight / bet[outcome];
        return {
            outcome,
            multiplier,
            isWin: multiplier > 1
        };
    }
    /**
     * Estimate gas fees for operations
     */
    async estimateGasFees() {
        try {
            const baseFee = 5000; // Base transaction fee in lamports
            return {
                initializePlayer: baseFee + 2000, // Account creation
                placeBet: baseFee + 1000,
                claimWinnings: baseFee + 500,
                createPool: baseFee + 5000, // Multiple account creation
                depositLiquidity: baseFee + 1000,
                withdrawLiquidity: baseFee + 1000
            };
        }
        catch (error) {
            throw new errors_1.WhiskyError('Failed to estimate gas fees', 'ESTIMATION_FAILED', error);
        }
    }
    // ================================
    // BATCH OPERATIONS
    // ================================
    /**
     * Place multiple bets in sequence
     */
    async placeBetBatch(params) {
        const results = [];
        for (const betParams of params) {
            try {
                const result = await this.placeBet(betParams);
                results.push(result);
            }
            catch (error) {
                this.log('Batch bet failed', { error, params: betParams });
                results.push({
                    signature: '',
                    success: false,
                    game: new web3_js_1.PublicKey('11111111111111111111111111111111'),
                    isWin: false,
                    payout: 0,
                    result: 0,
                    expectedReturn: 0,
                    error: error.message
                });
            }
        }
        return results;
    }
    /**
     * Claim winnings from multiple games
     */
    async claimWinningsBatch(gameAddresses) {
        const results = [];
        for (const gameAddress of gameAddresses) {
            try {
                const result = await this.claimWinnings(gameAddress);
                results.push(result);
            }
            catch (error) {
                this.log('Batch claim failed', { error, gameAddress: gameAddress.toString() });
                results.push({
                    signature: '',
                    success: false,
                    error: error.message
                });
            }
        }
        return results;
    }
    // ================================
    // GAME TYPE HELPERS
    // ================================
    /**
     * Create a slots-style bet with weighted reels
     */
    createSlotsBet(reels) {
        // Flatten reels into weighted outcomes
        const outcomes = [];
        for (let i = 0; i < reels[0].length; i++) {
            for (let j = 0; j < reels[1].length; j++) {
                for (let k = 0; k < reels[2].length; k++) {
                    // Weight based on symbol frequency
                    const weight = reels[0][i] * reels[1][j] * reels[2][k];
                    outcomes.push(weight);
                }
            }
        }
        return outcomes;
    }
    /**
     * Create a lottery-style bet
     */
    createLotteryBet(totalNumbers, winningNumbers) {
        const outcomes = new Array(totalNumbers).fill(1);
        // Boost winning number probability
        for (let i = 0; i < winningNumbers; i++) {
            outcomes[i] = 1000; // Much higher weight for winning
        }
        return outcomes;
    }
    /**
     * Create a binary option bet (yes/no with custom odds)
     */
    createBinaryBet(yesWeight, noWeight) {
        return [noWeight, yesWeight];
    }
    /**
     * Create a multi-outcome prediction market bet
     */
    createPredictionMarketBet(probabilities) {
        // Convert probabilities to weights (inverse relationship)
        return probabilities.map(prob => Math.floor(1000 / Math.max(prob, 0.01)));
    }
    // ================================
    // ANALYTICS & MONITORING
    // ================================
    /**
     * Get comprehensive game analytics
     */
    async getGameAnalytics(timeRange = 'day') {
        try {
            const games = await this.getUserGames();
            let totalVolume = 0;
            let totalPayouts = 0;
            let wins = 0;
            const poolCounts = {};
            const gameTypes = {};
            for (const gameAddress of games) {
                try {
                    const game = await this.getGame(gameAddress);
                    totalVolume += Number(game.wager || 0);
                    if (game.status === types_1.GameStatus.Ready)
                        wins++;
                    const poolKey = game.pool.toString();
                    poolCounts[poolKey] = (poolCounts[poolKey] || 0) + 1;
                    // Classify game type based on bet array length
                    const betLength = game.bet?.length || 0;
                    let gameType = 'custom';
                    if (betLength === 2)
                        gameType = 'coinflip';
                    else if (betLength === 6)
                        gameType = 'dice';
                    else if (betLength === 37)
                        gameType = 'roulette';
                    gameTypes[gameType] = (gameTypes[gameType] || 0) + 1;
                }
                catch (e) {
                    // Skip failed game fetches
                }
            }
            const popularPools = Object.entries(poolCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([pool]) => new web3_js_1.PublicKey(pool));
            return {
                totalGames: games.length,
                totalVolume,
                totalPayouts,
                averageWager: games.length > 0 ? totalVolume / games.length : 0,
                winRate: games.length > 0 ? (wins / games.length) * 100 : 0,
                popularPools,
                gameTypes
            };
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to get game analytics', error);
        }
    }
    /**
     * Monitor pending games and their status
     */
    async getPendingGames() {
        try {
            const games = await this.getUserGames();
            const pending = [];
            const now = Date.now();
            for (const gameAddress of games) {
                try {
                    const game = await this.getGame(gameAddress);
                    if (game.status === types_1.GameStatus.ResultRequested) {
                        const timeWaiting = now - (Number(game.timestamp || 0) * 1000);
                        pending.push({
                            address: gameAddress,
                            game,
                            timeWaiting,
                            status: 'Waiting for RNG'
                        });
                    }
                }
                catch (e) {
                    // Skip failed fetches
                }
            }
            return pending;
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to get pending games', error);
        }
    }
}
exports.WhiskyGamingClient = WhiskyGamingClient;
