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
exports.WhiskyGamingClient = exports.GameStatus = void 0;
const anchor = __importStar(require("@coral-xyz/anchor"));
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const bn_js_1 = __importDefault(require("bn.js"));
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["None"] = 0] = "None";
    GameStatus[GameStatus["ResultRequested"] = 1] = "ResultRequested";
    GameStatus[GameStatus["Ready"] = 2] = "Ready";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
/**
 * Main client for interacting with the Whisky Gaming Protocol
 */
class WhiskyGamingClient {
    constructor(config) {
        this.connection = config.connection;
        this.wallet = config.wallet;
        this.programId = typeof config.programId === 'string'
            ? new web3_js_1.PublicKey(config.programId)
            : config.programId;
        // Set up provider
        const provider = new anchor.AnchorProvider(this.connection, this.wallet, { commitment: config.commitment || 'confirmed' });
        // Initialize program (you'd load the actual IDL here)
        // For now, we'll use a mock setup
        this.program = new anchor_1.Program({}, this.programId, provider);
    }
    // ================================
    // PROTOCOL MANAGEMENT
    // ================================
    /**
     * Initialize the Whisky Gaming Protocol
     */
    async initializeProtocol() {
        const [whiskyState] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('WHISKY_STATE')], this.programId);
        const tx = await this.program.methods
            .whiskyInitialize()
            .accounts({
            whiskyState,
            initializer: this.wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .rpc();
        return tx;
    }
    /**
     * Get protocol state
     */
    async getProtocolState() {
        const [whiskyState] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('WHISKY_STATE')], this.programId);
        return await this.program.account.whiskyState.fetch(whiskyState);
    }
    // ================================
    // POOL OPERATIONS
    // ================================
    /**
     * Create a new gaming pool
     */
    async createPool(params) {
        const [pool] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from('POOL'),
            params.tokenMint.toBuffer(),
            params.poolAuthority.toBuffer(),
        ], this.programId);
        const [lpMint] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from('POOL_LP_MINT'),
            params.tokenMint.toBuffer(),
            params.poolAuthority.toBuffer(),
        ], this.programId);
        const [whiskyState] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('WHISKY_STATE')], this.programId);
        const poolUnderlyingAta = await (0, spl_token_1.getAssociatedTokenAddress)(params.tokenMint, pool, true);
        const poolJackpotAta = await (0, spl_token_1.getAssociatedTokenAddress)(params.tokenMint, pool, true);
        const tx = await this.program.methods
            .poolInitialize(params.poolAuthority, params.lookupAddress || anchor.web3.Keypair.generate().publicKey)
            .accounts({
            whiskyState,
            pool,
            underlyingTokenMint: params.tokenMint,
            poolAuthority: params.poolAuthority,
            lpMint,
            poolUnderlyingTokenAccount: poolUnderlyingAta,
            poolJackpotTokenAccount: poolJackpotAta,
            user: this.wallet.publicKey,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .rpc();
        return tx;
    }
    /**
     * Deposit liquidity to a pool
     */
    async depositLiquidity(params) {
        const [whiskyState] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('WHISKY_STATE')], this.programId);
        const userTokenAta = await (0, spl_token_1.getAssociatedTokenAddress)(params.tokenMint, this.wallet.publicKey);
        const poolUnderlyingAta = await (0, spl_token_1.getAssociatedTokenAddress)(params.tokenMint, params.pool, true);
        // Get LP mint address
        const poolData = await this.program.account.pool.fetch(params.pool);
        const [lpMint] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from('POOL_LP_MINT'),
            params.tokenMint.toBuffer(),
            poolData.poolAuthority.toBuffer(),
        ], this.programId);
        const userLpAta = await (0, spl_token_1.getAssociatedTokenAddress)(lpMint, this.wallet.publicKey);
        const tx = await this.program.methods
            .poolDeposit(new bn_js_1.default(params.amount))
            .accounts({
            whiskyState,
            pool: params.pool,
            underlyingTokenMint: params.tokenMint,
            lpMint,
            poolUnderlyingTokenAccount: poolUnderlyingAta,
            userUnderlyingAta: userTokenAta,
            userLpAta: userLpAta,
            user: this.wallet.publicKey,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId,
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
    async initializePlayer() {
        const [player] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('PLAYER'), this.wallet.publicKey.toBuffer()], this.programId);
        const [game] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('GAME'), this.wallet.publicKey.toBuffer()], this.programId);
        const tx = await this.program.methods
            .playerInitialize()
            .accounts({
            player,
            game,
            user: this.wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .rpc();
        return tx;
    }
    /**
     * Place a bet
     */
    async placeBet(params) {
        const [whiskyState] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('WHISKY_STATE')], this.programId);
        const [player] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('PLAYER'), this.wallet.publicKey.toBuffer()], this.programId);
        const [game] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('GAME'), this.wallet.publicKey.toBuffer()], this.programId);
        const poolData = await this.program.account.pool.fetch(params.pool);
        const tokenMint = poolData.underlyingTokenMint;
        const userTokenAta = await (0, spl_token_1.getAssociatedTokenAddress)(tokenMint, this.wallet.publicKey);
        const playerAta = await (0, spl_token_1.getAssociatedTokenAddress)(tokenMint, player, true);
        const poolUnderlyingAta = await (0, spl_token_1.getAssociatedTokenAddress)(tokenMint, params.pool, true);
        const tx = await this.program.methods
            .playGame(new bn_js_1.default(params.amount), params.bet, params.clientSeed || '', params.creatorFeeBps || 0, params.jackpotFeeBps || 0, params.metadata || '')
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
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .rpc();
        return tx;
    }
    /**
     * Claim winnings
     */
    async claimWinnings() {
        const [player] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('PLAYER'), this.wallet.publicKey.toBuffer()], this.programId);
        const [game] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('GAME'), this.wallet.publicKey.toBuffer()], this.programId);
        const gameData = await this.program.account.game.fetch(game);
        const tokenMint = gameData.tokenMint;
        const userTokenAta = await (0, spl_token_1.getAssociatedTokenAddress)(tokenMint, this.wallet.publicKey);
        const playerAta = await (0, spl_token_1.getAssociatedTokenAddress)(tokenMint, player, true);
        const tx = await this.program.methods
            .playerClaim()
            .accounts({
            player,
            game,
            underlyingTokenMint: tokenMint,
            playerAta: playerAta,
            userUnderlyingAta: userTokenAta,
            user: this.wallet.publicKey,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
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
    async getPool(poolAddress) {
        return await this.program.account.pool.fetch(poolAddress);
    }
    /**
     * Get player information
     */
    async getPlayer(playerAddress) {
        const address = playerAddress || web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('PLAYER'), this.wallet.publicKey.toBuffer()], this.programId)[0];
        return await this.program.account.player.fetch(address);
    }
    /**
     * Get game information
     */
    async getGame(gameAddress) {
        const address = gameAddress || web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('GAME'), this.wallet.publicKey.toBuffer()], this.programId)[0];
        return await this.program.account.game.fetch(address);
    }
    // ================================
    // UTILITIES
    // ================================
    /**
     * Find pool address for a token mint and authority
     */
    findPoolAddress(tokenMint, poolAuthority) {
        return web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from('POOL'),
            tokenMint.toBuffer(),
            poolAuthority.toBuffer(),
        ], this.programId)[0];
    }
    /**
     * Calculate expected LP tokens for a deposit
     */
    calculateLpTokens(depositAmount, poolLiquidity, lpSupply) {
        if (lpSupply === 0 || poolLiquidity === 0) {
            return depositAmount;
        }
        return (depositAmount * lpSupply) / poolLiquidity;
    }
    /**
     * Calculate expected return from a bet
     */
    calculateExpectedReturn(bet, wager) {
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
exports.WhiskyGamingClient = WhiskyGamingClient;
