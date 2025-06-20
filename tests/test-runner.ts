import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createMint, mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import BN from "bn.js";

/**
 * ============================================================================
 * 🧪 WHISKY GAMING PROTOCOL - TEST RUNNER & UTILITIES
 * ============================================================================
 */

export interface TestConfig {
  connection: Connection;
  programId: anchor.web3.PublicKey;
  provider: anchor.AnchorProvider;
  accounts: {
    authority: Keypair;
    rngProvider: Keypair;
    poolAuthority: Keypair;
    users: Keypair[];
    creator: Keypair;
  };
  tokens: {
    mainToken: anchor.web3.PublicKey;
    bonusToken: anchor.web3.PublicKey;
  };
  constants: {
    INITIAL_MINT_AMOUNT: BN;
    LARGE_DEPOSIT: BN;
    MEDIUM_DEPOSIT: BN;
    SMALL_WAGER: BN;
    LARGE_WAGER: BN;
  };
}

export class TestRunner {
  public config: TestConfig;
  private _initialized = false;

  constructor() {
    this.config = {} as TestConfig;
  }

  /**
   * Initialize the test environment
   */
  async initialize(): Promise<void> {
    if (this._initialized) return;

    console.log("🚀 Initializing Whisky Protocol Test Environment");

    // Set up provider
    this.config.provider = anchor.AnchorProvider.env();
    anchor.setProvider(this.config.provider);

    this.config.connection = this.config.provider.connection;
    this.config.programId = new anchor.web3.PublicKey('Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw');

    // Generate test accounts
    this.config.accounts = {
      authority: Keypair.generate(),
      rngProvider: Keypair.generate(),
      poolAuthority: Keypair.generate(),
      users: [Keypair.generate(), Keypair.generate(), Keypair.generate()],
      creator: Keypair.generate()
    };

    // Set up constants
    this.config.constants = {
      INITIAL_MINT_AMOUNT: new BN(1_000_000_000_000), // 1M tokens
      LARGE_DEPOSIT: new BN(100_000_000_000), // 100K tokens
      MEDIUM_DEPOSIT: new BN(10_000_000_000), // 10K tokens
      SMALL_WAGER: new BN(1_000_000), // 1 token
      LARGE_WAGER: new BN(100_000_000), // 100 tokens
    };

    // Fund all accounts
    await this.fundAccounts();

    // Create test tokens
    await this.createTestTokens();

    // Mint tokens to test accounts
    await this.mintTestTokens();

    this._initialized = true;
    console.log("✅ Test environment initialized successfully");
  }

  /**
   * Fund all test accounts with SOL
   */
  private async fundAccounts(): Promise<void> {
    const allAccounts = [
      this.config.accounts.authority,
      this.config.accounts.rngProvider,
      this.config.accounts.poolAuthority,
      this.config.accounts.creator,
      ...this.config.accounts.users
    ];

    console.log(`💰 Funding ${allAccounts.length} test accounts...`);

    for (const account of allAccounts) {
      await this.config.connection.requestAirdrop(
        account.publicKey, 
        10 * LAMPORTS_PER_SOL
      );
    }

    // Wait for airdrops to confirm
    await this.sleep(3000);
  }

  /**
   * Create test tokens
   */
  private async createTestTokens(): Promise<void> {
    console.log("🪙 Creating test tokens...");

    this.config.tokens = {
      mainToken: await createMint(
        this.config.connection,
        this.config.accounts.authority,
        this.config.accounts.authority.publicKey,
        this.config.accounts.authority.publicKey,
        9 // 9 decimals
      ),
      bonusToken: await createMint(
        this.config.connection,
        this.config.accounts.authority,
        this.config.accounts.authority.publicKey,
        this.config.accounts.authority.publicKey,
        9
      )
    };

    console.log(`  - Main Token: ${this.config.tokens.mainToken.toString()}`);
    console.log(`  - Bonus Token: ${this.config.tokens.bonusToken.toString()}`);
  }

  /**
   * Mint test tokens to accounts
   */
  private async mintTestTokens(): Promise<void> {
    console.log("🎁 Minting tokens to test accounts...");

    const recipients = [
      this.config.accounts.poolAuthority,
      this.config.accounts.creator,
      ...this.config.accounts.users
    ];

    for (const recipient of recipients) {
      const userAta = await getOrCreateAssociatedTokenAccount(
        this.config.connection,
        this.config.accounts.authority,
        this.config.tokens.mainToken,
        recipient.publicKey
      );

      await mintTo(
        this.config.connection,
        this.config.accounts.authority,
        this.config.tokens.mainToken,
        userAta.address,
        this.config.accounts.authority,
        this.config.constants.INITIAL_MINT_AMOUNT.toNumber()
      );
    }
  }

  /**
   * Get a test user by index
   */
  getUser(index: number = 0): Keypair {
    if (index >= this.config.accounts.users.length) {
      throw new Error(`User index ${index} out of bounds`);
    }
    return this.config.accounts.users[index];
  }

  /**
   * Create a new test user with funded account
   */
  async createNewUser(): Promise<Keypair> {
    const newUser = Keypair.generate();
    
    // Fund with SOL
    await this.config.connection.requestAirdrop(
      newUser.publicKey, 
      5 * LAMPORTS_PER_SOL
    );

    // Create and fund token account
    const userAta = await getOrCreateAssociatedTokenAccount(
      this.config.connection,
      this.config.accounts.authority,
      this.config.tokens.mainToken,
      newUser.publicKey
    );

    await mintTo(
      this.config.connection,
      this.config.accounts.authority,
      this.config.tokens.mainToken,
      userAta.address,
      this.config.accounts.authority,
      this.config.constants.INITIAL_MINT_AMOUNT.toNumber()
    );

    return newUser;
  }

  /**
   * Clean up test environment
   */
  async cleanup(): Promise<void> {
    console.log("🧹 Cleaning up test environment...");
    // Add any cleanup logic here
  }

  /**
   * Utility function to wait
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get random test values
   */
  getRandomWager(): BN {
    const min = this.config.constants.SMALL_WAGER.toNumber();
    const max = this.config.constants.LARGE_WAGER.toNumber();
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    return new BN(random);
  }

  getRandomBet(): number[] {
    const betTypes = [
      [50, 50], // Coinflip
      [33, 33, 34], // Three-way
      [25, 25, 25, 25], // Four-way
      [10, 90], // Unlikely win
      [1, 99], // Very unlikely win
      [20, 20, 20, 20, 20], // Five-way
    ];
    
    return betTypes[Math.floor(Math.random() * betTypes.length)];
  }

  /**
   * Log test result
   */
  logResult(testName: string, success: boolean, details?: any): void {
    const icon = success ? "✅" : "❌";
    console.log(`${icon} ${testName}`);
    if (details) {
      console.log(`   Details:`, details);
    }
  }

  /**
   * Generate test report
   */
  generateReport(results: Array<{name: string, success: boolean, duration?: number}>): void {
    console.log("\n📊 TEST REPORT");
    console.log("=".repeat(50));
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Pass Rate: ${passRate}%`);
    
    if (results.some(r => r.duration)) {
      const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
      console.log(`Total Duration: ${totalDuration}ms`);
    }
    
    console.log("\nDetailed Results:");
    results.forEach(result => {
      const icon = result.success ? "✅" : "❌";
      const duration = result.duration ? ` (${result.duration}ms)` : "";
      console.log(`  ${icon} ${result.name}${duration}`);
    });
    
    console.log("=".repeat(50));
  }
}

/**
 * Singleton test runner instance
 */
export const testRunner = new TestRunner();

/**
 * Test helper functions
 */
export class TestHelpers {
  /**
   * Assert that a transaction was successful
   */
  static assertTransactionSuccess(tx: string): void {
    if (!tx || tx.length < 44) {
      throw new Error(`Invalid transaction signature: ${tx}`);
    }
  }

  /**
   * Assert that two BN values are equal
   */
  static assertBNEqual(actual: BN, expected: BN, message?: string): void {
    if (!actual.eq(expected)) {
      throw new Error(
        message || `Expected ${expected.toString()}, got ${actual.toString()}`
      );
    }
  }

  /**
   * Assert that a value is within a range
   */
  static assertWithinRange(value: number, min: number, max: number, message?: string): void {
    if (value < min || value > max) {
      throw new Error(
        message || `Value ${value} not within range [${min}, ${max}]`
      );
    }
  }

  /**
   * Generate a random string
   */
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Measure execution time
   */
  static async measureTime<T>(fn: () => Promise<T>): Promise<{result: T, duration: number}> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }

  /**
   * Retry operation with exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (i === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

/**
 * Test data generators
 */
export class TestDataGenerators {
  /**
   * Generate test bet configurations
   */
  static generateBetConfigurations(): number[][] {
    return [
      [50, 50], // Equal probability
      [25, 75], // Unequal probability
      [33, 33, 34], // Three outcomes
      [20, 20, 20, 20, 20], // Five outcomes
      [10, 10, 10, 10, 10, 10, 10, 10, 10, 10], // Ten outcomes
      [1, 99], // Very skewed
      [90, 10], // Highly likely win
    ];
  }

  /**
   * Generate test wager amounts
   */
  static generateWagerAmounts(): BN[] {
    return [
      new BN(1000000), // 1 token
      new BN(5000000), // 5 tokens
      new BN(10000000), // 10 tokens
      new BN(50000000), // 50 tokens
      new BN(100000000), // 100 tokens
    ];
  }

  /**
   * Generate test metadata
   */
  static generateMetadata(): string[] {
    return [
      "Simple coinflip",
      "Multi-outcome dice roll",
      "High stakes poker",
      "Lottery draw",
      "Sports betting",
      "Prediction market",
    ];
  }

  /**
   * Generate test fee configurations
   */
  static generateFeeConfigurations(): Array<{creator: number, jackpot: number}> {
    return [
      { creator: 0, jackpot: 0 }, // No fees
      { creator: 100, jackpot: 50 }, // 1% creator, 0.5% jackpot
      { creator: 200, jackpot: 100 }, // 2% creator, 1% jackpot
      { creator: 500, jackpot: 250 }, // 5% creator, 2.5% jackpot
    ];
  }
}

/**
 * Export everything for easy testing
 */
export * from "./whisky-core";
export * from "./sdk-tests"; 