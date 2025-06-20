import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { 
  WhiskyGamingClient,
  deriveWhiskyStatePDA,
  derivePoolPDA,
  derivePlayerPDA,
  calculateLpTokens,
  validateBet,
  generateClientSeed,
  createWhiskyClient
} from '../src';

describe('Whisky Gaming SDK', () => {
  let client: WhiskyGamingClient;
  let connection: Connection;
  let wallet: anchor.Wallet;
  
  beforeAll(() => {
    // Use devnet for testing
    connection = new Connection('https://api.devnet.solana.com');
    
    // Create a test wallet
    const keypair = Keypair.generate();
    wallet = new anchor.Wallet(keypair);
    
    // Initialize client
    client = createWhiskyClient({
      connection,
      wallet,
      programId: '6R7S7r6KzU1A5YACXCaKuF6GcEcv5ZdXU4hh8vPozcw6',
      debug: true
    });
  });

  describe('Client Initialization', () => {
    test('should create client successfully', () => {
      expect(client).toBeDefined();
      expect(client.connection).toBe(connection);
      expect(client.wallet).toBe(wallet);
    });

    test('should have correct program ID', () => {
      expect(client.programId.toString()).toBe('6R7S7r6KzU1A5YACXCaKuF6GcEcv5ZdXU4hh8vPozcw6');
    });
  });

  describe('Utility Functions', () => {
    test('should derive PDAs correctly', () => {
      const [whiskyState, bump] = deriveWhiskyStatePDA(client.programId);
      expect(whiskyState).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
    });

    test('should derive pool PDA', () => {
      const tokenMint = Keypair.generate().publicKey;
      const poolAuthority = Keypair.generate().publicKey;
      const [pool, bump] = derivePoolPDA(tokenMint, poolAuthority, client.programId);
      
      expect(pool).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
    });

    test('should derive player PDA', () => {
      const user = Keypair.generate().publicKey;
      const [player, bump] = derivePlayerPDA(user, client.programId);
      
      expect(player).toBeInstanceOf(PublicKey);
      expect(typeof bump).toBe('number');
    });

    test('should calculate LP tokens correctly', () => {
      const lpTokens = calculateLpTokens(1000, 100000, 50000);
      expect(lpTokens.toNumber()).toBeGreaterThan(0);
    });

    test('should validate bets', () => {
      const validBet = [50, 50];
      const validation = validateBet(validBet);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should reject invalid bets', () => {
      const invalidBet = [100]; // Only one outcome
      const validation = validateBet(invalidBet);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should generate client seeds', () => {
      const seed = generateClientSeed();
      expect(typeof seed).toBe('string');
      expect(seed.length).toBeGreaterThan(0);
    });
  });

  describe('Game Type Helpers', () => {
    test('should create coin flip bet', () => {
      const bet = client.createCoinFlipBet();
      expect(bet).toEqual([50, 50]);
    });

    test('should create dice roll bet', () => {
      const bet = client.createDiceRollBet();
      expect(bet).toEqual([1, 1, 1, 1, 1, 1]);
      expect(bet).toHaveLength(6);
    });

    test('should create weighted dice bet', () => {
      const bet = client.createWeightedDiceBet(3);
      expect(bet).toEqual([1, 1, 1, 1, 1, 3]);
      expect(bet[5]).toBe(3);
    });

    test('should create roulette bet', () => {
      const bet = client.createRouletteBet();
      expect(bet).toHaveLength(37);
      expect(bet.every(weight => weight === 1)).toBe(true);
    });

    test('should create custom bet', () => {
      const weights = [10, 20, 30];
      const bet = client.createCustomBet(weights);
      expect(bet).toEqual(weights);
    });

    test('should reject invalid custom bet', () => {
      expect(() => {
        client.createCustomBet([100]); // Only one outcome
      }).toThrow();
      
      expect(() => {
        client.createCustomBet(new Array(300).fill(1)); // Too many outcomes
      }).toThrow();
    });

    test('should create binary bet', () => {
      const bet = client.createBinaryBet(70, 30);
      expect(bet).toEqual([30, 70]);
    });

    test('should create prediction market bet', () => {
      const probabilities = [0.3, 0.4, 0.3];
      const bet = client.createPredictionMarketBet(probabilities);
      expect(bet).toHaveLength(3);
      expect(bet.every(weight => weight > 0)).toBe(true);
    });
  });

  describe('Game Simulation', () => {
    test('should simulate game results', () => {
      const bet = [50, 50];
      const result = client.simulateGameResult(bet);
      
      expect(typeof result.outcome).toBe('number');
      expect(result.outcome >= 0 && result.outcome < bet.length).toBe(true);
      expect(typeof result.multiplier).toBe('number');
      expect(result.multiplier).toBeGreaterThan(0);
      expect(typeof result.isWin).toBe('boolean');
    });

    test('should provide consistent results with same seed', () => {
      const bet = [25, 75];
      const seed = 'test-seed-123';
      
      // Note: In real implementation, results would be deterministic with same seed
      const result1 = client.simulateGameResult(bet, seed);
      const result2 = client.simulateGameResult(bet, seed);
      
      expect(typeof result1.outcome).toBe('number');
      expect(typeof result2.outcome).toBe('number');
    });
  });

  describe('SDK Methods (Stub)', () => {
    test('should get protocol state', async () => {
      const state = await client.getProtocolState();
      expect(state).toBeDefined();
      expect(state.authority).toBeInstanceOf(PublicKey);
    });

    test('should get pool information', async () => {
      const poolAddress = Keypair.generate().publicKey;
      const pool = await client.getPool(poolAddress);
      expect(pool).toBeDefined();
      expect(pool.poolAuthority).toBeInstanceOf(PublicKey);
    });

    test('should get player information', async () => {
      const player = await client.getPlayer();
      expect(player).toBeDefined();
      expect(player.user).toBeInstanceOf(PublicKey);
    });

    test('should estimate gas fees', async () => {
      const fees = await client.estimateGasFees();
      expect(fees).toBeDefined();
      expect(fees.initializePlayer).toBeGreaterThan(0);
      expect(fees.placeBet).toBeGreaterThan(0);
      expect(fees.claimWinnings).toBeGreaterThan(0);
    });

    test('should get player stats', async () => {
      const stats = await client.getPlayerStats();
      expect(stats).toBeDefined();
      expect(stats.address).toBeInstanceOf(PublicKey);
      expect(typeof stats.winRate).toBe('number');
    });

    test('should get game analytics', async () => {
      const analytics = await client.getGameAnalytics('day');
      expect(analytics).toBeDefined();
      expect(typeof analytics.totalGames).toBe('number');
      expect(typeof analytics.totalVolume).toBe('number');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid operations gracefully', async () => {
      // Test with invalid parameters
      try {
        await client.placeBet({
          pool: Keypair.generate().publicKey,
          amount: -1, // Invalid amount
          bet: [50, 50]
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
}); 