"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhiskyGamingClient = void 0;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const types_1 = require("./types");
const utils_1 = require("./utils");
const errors_1 = require("./errors");
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
        // Simplified program initialization
        this.program = {
            methods: {},
            account: {},
            programId: this.programId
        };
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
            // TODO: Replace with real instruction when IDL is integrated
            this.log('Protocol initialization requested');
            return {
                signature: 'mock_signature_' + Date.now(),
                success: true,
                data: { message: 'Protocol initialized (stub)' }
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
        try {
            // Return mock state for development
            return {
                authority: this.user,
                rngAddress: web3_js_1.PublicKey.default,
                whiskyFeeBps: 200,
                maxCreatorFeeBps: 500,
                poolCreationAllowed: true,
                playingAllowed: true,
                antiSpamFee: new bn_js_1.default(1000),
                poolCreationFee: new bn_js_1.default(5000),
                maxHouseEdgeBps: 1000,
                defaultPoolFeeBps: 300,
                maxPoolCount: 1000,
                totalPools: 5,
                totalVolume: new bn_js_1.default(1000000),
                totalFees: new bn_js_1.default(10000),
                createdAt: new bn_js_1.default(Date.now() / 1000),
                lastUpdatedAt: new bn_js_1.default(Date.now() / 1000)
            };
        }
        catch (error) {
            throw new errors_1.WhiskyConfigError('Failed to fetch protocol state', error);
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
            this.log('Pool creation requested', params);
            return {
                signature: 'mock_signature_' + Date.now(),
                success: true,
                data: {
                    pool: (0, utils_1.derivePoolPDA)(params.tokenMint, params.poolAuthority, this.programId)[0],
                    message: 'Pool created (stub)'
                }
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
            this.log('Liquidity deposit requested', params);
            return {
                signature: 'mock_signature_' + Date.now(),
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
            this.log('Liquidity withdrawal requested', params);
            return {
                signature: 'mock_signature_' + Date.now(),
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
            // Return mock pool data
            return {
                poolAuthority: web3_js_1.PublicKey.default,
                underlyingTokenMint: web3_js_1.PublicKey.default,
                lpMint: web3_js_1.PublicKey.default,
                minWager: 1000,
                maxWager: 1000000,
                totalLiquidity: new bn_js_1.default(1000000),
                lpSupply: new bn_js_1.default(500000),
                creatorFeeBps: 0,
                houseEdgeBps: 300,
                volume: new bn_js_1.default(50000),
                plays: 100,
                feesCollected: new bn_js_1.default(5000),
                createdAt: new bn_js_1.default(Date.now() / 1000),
                isActive: true
            };
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
            return {
                address: poolAddress,
                config: pool,
                totalValueLocked: 1000000,
                lpTokenPrice: 2.0,
                volume24h: 50000,
                totalVolume: 500000,
                activePlayers: 25,
                apy: 12.5,
                houseEdge: 3.0
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
            this.log('Player initialization requested');
            return {
                signature: 'mock_signature_' + Date.now(),
                success: true,
                data: {
                    player: (0, utils_1.derivePlayerPDA)(this.user, this.programId)[0],
                    message: 'Player initialized (stub)'
                }
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
        try {
            return {
                user: userAddress || this.user,
                nonce: 5,
                gamesPlayed: 10,
                totalWagered: new bn_js_1.default(50000),
                totalWon: new bn_js_1.default(55000),
                totalGames: 10,
                totalWinnings: new bn_js_1.default(55000),
                netProfitLoss: new bn_js_1.default(5000),
                lastGameAt: new bn_js_1.default(Date.now() / 1000),
                winRate: 65.0,
                avgBetSize: new bn_js_1.default(5000)
            };
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
            this.log('Bet placed', { amount: params.amount, bet: params.bet });
            const game = (0, utils_1.deriveGamePDA)(this.user, this.programId)[0];
            const expectedPayout = (0, utils_1.calculateExpectedPayout)(params.bet, params.amount);
            return {
                signature: 'mock_signature_' + Date.now(),
                success: true,
                game,
                isWin: false,
                payout: 0,
                result: 0,
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
            this.log('Winnings claim requested', { game: gameAddress.toString() });
            return {
                signature: 'mock_signature_' + Date.now(),
                success: true,
                data: { game: gameAddress, payout: 2000 }
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
            return {
                user: this.user,
                pool: web3_js_1.PublicKey.default,
                tokenMint: web3_js_1.PublicKey.default,
                status: types_1.GameStatus.Ready,
                wager: new bn_js_1.default(1000),
                bet: [50, 50],
                result: 1,
                payout: new bn_js_1.default(2000),
                isWin: true,
                createdAt: new bn_js_1.default(Date.now() / 1000),
                clientSeed: 'test-seed'
            };
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
            // Return mock pool addresses
            return [
                new web3_js_1.PublicKey('11111111111111111111111111111112'),
                new web3_js_1.PublicKey('11111111111111111111111111111113')
            ];
        }
        catch (error) {
            throw new errors_1.WhiskyPoolError('Failed to find pools for token', error);
        }
    }
    /**
     * Get user's games across all pools
     */
    async getUserGames(userAddress) {
        try {
            // Return mock game addresses
            return [
                new web3_js_1.PublicKey('11111111111111111111111111111114'),
                new web3_js_1.PublicKey('11111111111111111111111111111115')
            ];
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
            const lpTokens = (0, utils_1.calculateLpTokens)(depositAmount, 1000000, 500000);
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
            const withdrawAmount = (0, utils_1.calculateWithdrawAmount)(lpTokens, 1000000, 500000);
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
            this.log('Player account close requested');
            return {
                signature: 'mock_signature_' + Date.now(),
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
            this.log('RNG settlement requested', { gameAddress: gameAddress.toString() });
            return {
                signature: 'mock_signature_' + Date.now(),
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
            this.log('RNG seed hash requested', { gameAddress: gameAddress.toString() });
            return {
                signature: 'mock_signature_' + Date.now(),
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
        try {
            return {
                address: userAddress || this.user,
                config: await this.getPlayer(userAddress),
                winRate: 65.5,
                avgBetSize: 2500,
                profitLossRatio: 1.15,
                totalROI: 15.2,
                favoritePools: []
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
            const baseFee = 5000;
            return {
                initializePlayer: baseFee + 2000,
                placeBet: baseFee + 1000,
                claimWinnings: baseFee + 500,
                createPool: baseFee + 5000,
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
        const outcomes = [];
        for (let i = 0; i < reels[0].length; i++) {
            for (let j = 0; j < reels[1].length; j++) {
                for (let k = 0; k < reels[2].length; k++) {
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
        for (let i = 0; i < winningNumbers; i++) {
            outcomes[i] = 1000;
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
            return {
                totalGames: 150,
                totalVolume: 500000,
                totalPayouts: 480000,
                averageWager: 3333,
                winRate: 45.5,
                popularPools: [
                    new web3_js_1.PublicKey('11111111111111111111111111111112'),
                    new web3_js_1.PublicKey('11111111111111111111111111111113')
                ],
                gameTypes: {
                    coinflip: 75,
                    dice: 45,
                    roulette: 20,
                    custom: 10
                }
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
            const game = await this.getGame(new web3_js_1.PublicKey('11111111111111111111111111111114'));
            return [{
                    address: new web3_js_1.PublicKey('11111111111111111111111111111114'),
                    game,
                    timeWaiting: 5000,
                    status: 'Waiting for RNG'
                }];
        }
        catch (error) {
            throw new errors_1.WhiskyGameError('Failed to get pending games', error);
        }
    }
}
exports.WhiskyGamingClient = WhiskyGamingClient;
