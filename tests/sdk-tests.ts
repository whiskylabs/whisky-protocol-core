import { expect } from "chai";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { BN } from "bn.js";

// Import SDK components
import {
  WhiskyGamingClient,
  createWhiskyClient,
  deriveWhiskyStatePDA,
  derivePoolPDA,
  derivePlayerPDA,
  deriveGamePDA,
  calculateLpTokens,
  calculateWithdrawAmount,
  calculateExpectedPayout,
  calculateFees,
  validateBet,
  validateWager,
  generateClientSeed,
  formatTokenAmount,
  parseTokenAmount,
  bpsToPercent,
  percentToBps,
  formatPercentage,
  formatMultiplier,
  WHISKY_PROGRAM_ID,
  DEFAULT_WHISKY_FEE_BPS,
  SDK_VERSION
} from "../whisky-core-sdk/src";

describe("🧪 WHISKY SDK - COMPREHENSIVE UNIT TESTS", () => {
  
  describe("🔧 SDK Configuration", () => {
    it("Should create SDK client with correct configuration", () => {
      const mockConnection = {} as Connection;
      const mockWallet = {} as any;
      
      const config = {
        connection: mockConnection,
        wallet: mockWallet,
        programId: WHISKY_PROGRAM_ID,
        cluster: 'devnet' as const,
        debug: true
      };

      const client = createWhiskyClient(config);
      expect(client).to.be.instanceOf(WhiskyGamingClient);
    });

    it("Should export correct SDK version", () => {
      expect(SDK_VERSION).to.equal('1.0.0');
    });

    it("Should have correct program ID", () => {
      expect(WHISKY_PROGRAM_ID.toString()).to.equal('Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw');
    });
  });

  describe("🎯 PDA Derivation Functions", () => {
    const testProgramId = new PublicKey('11111111111111111111111111111111');
    const testTokenMint = new PublicKey('So11111111111111111111111111111111111111112');
    const testAuthority = new PublicKey('22222222222222222222222222222222222222222');
    const testUser = new PublicKey('33333333333333333333333333333333333333333');

    it("Should derive Whisky State PDA correctly", () => {
      const [pda, bump] = deriveWhiskyStatePDA(testProgramId);
      
      expect(pda).to.be.instanceOf(PublicKey);
      expect(bump).to.be.a('number');
      expect(bump).to.be.at.least(0);
      expect(bump).to.be.at.most(255);
    });

    it("Should derive Pool PDA correctly", () => {
      const [pda, bump] = derivePoolPDA(testTokenMint, testAuthority, testProgramId);
      
      expect(pda).to.be.instanceOf(PublicKey);
      expect(bump).to.be.a('number');
      
      // Should be deterministic
      const [pda2] = derivePoolPDA(testTokenMint, testAuthority, testProgramId);
      expect(pda.toString()).to.equal(pda2.toString());
    });

    it("Should derive Player PDA correctly", () => {
      const [pda, bump] = derivePlayerPDA(testUser, testProgramId);
      
      expect(pda).to.be.instanceOf(PublicKey);
      expect(bump).to.be.a('number');
    });

    it("Should derive Game PDA correctly", () => {
      const [pda, bump] = deriveGamePDA(testUser, testProgramId);
      
      expect(pda).to.be.instanceOf(PublicKey);
      expect(bump).to.be.a('number');
    });

    it("Should generate different PDAs for different inputs", () => {
      const user1 = new PublicKey('33333333333333333333333333333333333333333');
      const user2 = new PublicKey('44444444444444444444444444444444444444444');
      
      const [pda1] = derivePlayerPDA(user1, testProgramId);
      const [pda2] = derivePlayerPDA(user2, testProgramId);
      
      expect(pda1.toString()).to.not.equal(pda2.toString());
    });
  });

  describe("🧮 Mathematical Calculations", () => {
    describe("LP Token Calculations", () => {
      it("Should calculate LP tokens for first deposit", () => {
        const depositAmount = new BN(1000000);
        const poolLiquidity = new BN(0);
        const lpSupply = new BN(0);
        
        const lpTokens = calculateLpTokens(depositAmount, poolLiquidity, lpSupply);
        expect(lpTokens.toString()).to.equal(depositAmount.toString());
      });

      it("Should calculate LP tokens for subsequent deposits", () => {
        const depositAmount = new BN(1000000);
        const poolLiquidity = new BN(5000000);
        const lpSupply = new BN(2500000);
        
        const lpTokens = calculateLpTokens(depositAmount, poolLiquidity, lpSupply);
        const expected = depositAmount.mul(lpSupply).div(poolLiquidity);
        expect(lpTokens.toString()).to.equal(expected.toString());
      });

      it("Should calculate withdrawal amounts correctly", () => {
        const lpTokens = new BN(500000);
        const poolLiquidity = new BN(10000000);
        const lpSupply = new BN(5000000);
        
        const withdrawAmount = calculateWithdrawAmount(lpTokens, poolLiquidity, lpSupply);
        const expected = lpTokens.mul(poolLiquidity).div(lpSupply);
        expect(withdrawAmount.toString()).to.equal(expected.toString());
      });

      it("Should handle edge case of zero LP supply", () => {
        const lpTokens = new BN(1000);
        const poolLiquidity = new BN(5000000);
        const lpSupply = new BN(0);
        
        const withdrawAmount = calculateWithdrawAmount(lpTokens, poolLiquidity, lpSupply);
        expect(withdrawAmount.toString()).to.equal('0');
      });
    });

    describe("Payout Calculations", () => {
      it("Should calculate expected payout for fair bet", () => {
        const bet = [50, 50]; // 50-50 odds
        const wager = new BN(1000000);
        const houseEdge = 200; // 2%
        
        const payout = calculateExpectedPayout(bet, wager, houseEdge);
        
        expect(payout.houseEdge).to.equal(0.02);
        expect(payout.totalPayout.gt(wager)).to.be.true;
      });

      it("Should calculate payout for multi-outcome bet", () => {
        const bet = [25, 25, 25, 25]; // Four equal outcomes
        const wager = new BN(1000000);
        
        const payout = calculateExpectedPayout(bet, wager);
        expect(payout.outcomes).to.be.undefined; // This property doesn't exist in the return type
        expect(payout.totalPayout.gt(new BN(0))).to.be.true;
      });

      it("Should handle uneven bet distributions", () => {
        const bet = [10, 90]; // 10% vs 90% odds
        const wager = new BN(1000000);
        
        const payout = calculateExpectedPayout(bet, wager);
        expect(payout.totalPayout.gt(wager)).to.be.true;
      });

      it("Should throw error for zero total weight", () => {
        const bet = [0, 0];
        const wager = new BN(1000000);
        
        expect(() => calculateExpectedPayout(bet, wager)).to.throw('Total bet weight cannot be zero');
      });
    });

    describe("Fee Calculations", () => {
      it("Should calculate fees correctly", () => {
        const wager = new BN(1000000);
        const creatorFee = 100; // 1%
        const whiskyFee = 200; // 2%
        const poolFee = 100; // 1%
        const jackpotFee = 50; // 0.5%
        
        const fees = calculateFees(wager, creatorFee, whiskyFee, poolFee, jackpotFee);
        
        expect(fees.creatorFee.toString()).to.equal('10000');
        expect(fees.whiskyFee.toString()).to.equal('20000');
        expect(fees.poolFee.toString()).to.equal('10000');
        expect(fees.jackpotFee.toString()).to.equal('5000');
        expect(fees.totalFees.toString()).to.equal('45000');
        expect(fees.netWager.toString()).to.equal('955000');
      });

      it("Should calculate fees with default values", () => {
        const wager = new BN(1000000);
        const fees = calculateFees(wager);
        
        expect(fees.creatorFee.toString()).to.equal('0');
        expect(fees.whiskyFee.toString()).to.equal('20000'); // 2%
        expect(fees.poolFee.toString()).to.equal('10000'); // 1%
        expect(fees.jackpotFee.toString()).to.equal('5000'); // 0.5%
      });
    });

    describe("Basis Points Conversions", () => {
      it("Should convert basis points to percentage", () => {
        expect(bpsToPercent(100)).to.equal(0.01); // 1%
        expect(bpsToPercent(250)).to.equal(0.025); // 2.5%
        expect(bpsToPercent(10000)).to.equal(1); // 100%
      });

      it("Should convert percentage to basis points", () => {
        expect(percentToBps(0.01)).to.equal(100);
        expect(percentToBps(0.025)).to.equal(250);
        expect(percentToBps(1)).to.equal(10000);
      });

      it("Should handle edge cases", () => {
        expect(bpsToPercent(0)).to.equal(0);
        expect(percentToBps(0)).to.equal(0);
      });
    });
  });

  describe("✅ Validation Functions", () => {
    describe("Bet Validation", () => {
      it("Should validate correct bets", () => {
        const validBets = [
          [50, 50],
          [25, 25, 25, 25],
          [10, 20, 30, 40],
          [1, 1], // Minimum weights
        ];

        validBets.forEach(bet => {
          const validation = validateBet(bet);
          expect(validation.isValid).to.be.true;
          expect(validation.errors).to.be.empty;
        });
      });

      it("Should reject invalid bets", () => {
        const invalidBets = [
          [], // Empty
          [50], // Single outcome
          [0, 50], // Zero weight
          [-10, 60], // Negative weight
          Array(25).fill(10), // Too many outcomes
        ];

        invalidBets.forEach(bet => {
          const validation = validateBet(bet);
          expect(validation.isValid).to.be.false;
          expect(validation.errors.length).to.be.greaterThan(0);
        });
      });

      it("Should calculate total weight correctly", () => {
        const bet = [10, 20, 30, 40];
        const validation = validateBet(bet);
        
        expect(validation.totalWeight).to.equal(100);
        expect(validation.outcomes).to.equal(4);
      });
    });

    describe("Wager Validation", () => {
      it("Should validate correct wagers", () => {
        const wager = new BN(1000000);
        const minWager = new BN(500000);
        const maxWager = new BN(5000000);
        const liquidity = new BN(10000000);
        
        const validation = validateWager(wager, minWager, maxWager, liquidity);
        expect(validation.isValid).to.be.true;
        expect(validation.errors).to.be.empty;
      });

      it("Should reject wagers below minimum", () => {
        const wager = new BN(100000);
        const minWager = new BN(500000);
        const maxWager = new BN(5000000);
        const liquidity = new BN(10000000);
        
        const validation = validateWager(wager, minWager, maxWager, liquidity);
        expect(validation.isValid).to.be.false;
        expect(validation.errors.some(error => error.includes('at least'))).to.be.true;
      });

      it("Should reject wagers above maximum", () => {
        const wager = new BN(10000000);
        const minWager = new BN(500000);
        const maxWager = new BN(5000000);
        const liquidity = new BN(20000000);
        
        const validation = validateWager(wager, minWager, maxWager, liquidity);
        expect(validation.isValid).to.be.false;
        expect(validation.errors.some(error => error.includes('cannot exceed'))).to.be.true;
      });

      it("Should reject wagers exceeding liquidity", () => {
        const wager = new BN(15000000);
        const minWager = new BN(500000);
        const maxWager = new BN(20000000);
        const liquidity = new BN(10000000);
        
        const validation = validateWager(wager, minWager, maxWager, liquidity);
        expect(validation.isValid).to.be.false;
        expect(validation.errors.some(error => error.includes('Insufficient liquidity'))).to.be.true;
      });
    });
  });

  describe("🎲 Random Generation", () => {
    it("Should generate valid client seeds", () => {
      const seed1 = generateClientSeed();
      const seed2 = generateClientSeed();
      
      expect(seed1).to.be.a('string');
      expect(seed1.length).to.equal(32);
      expect(seed2).to.be.a('string');
      expect(seed2.length).to.equal(32);
      expect(seed1).to.not.equal(seed2);
    });

    it("Should generate alphanumeric seeds only", () => {
      const seed = generateClientSeed();
      const alphanumericRegex = /^[A-Za-z0-9]+$/;
      
      expect(alphanumericRegex.test(seed)).to.be.true;
    });

    it("Should generate unique seeds consistently", () => {
      const seeds = new Set();
      for (let i = 0; i < 100; i++) {
        seeds.add(generateClientSeed());
      }
      
      expect(seeds.size).to.equal(100); // All should be unique
    });
  });

  describe("📝 Formatting Functions", () => {
    describe("Token Amount Formatting", () => {
      it("Should format token amounts correctly", () => {
        const amount1 = new BN('1000000000'); // 1 token with 9 decimals
        expect(formatTokenAmount(amount1, 9)).to.equal('1');
        
        const amount2 = new BN('1500000000'); // 1.5 tokens
        expect(formatTokenAmount(amount2, 9)).to.equal('1.5');
        
        const amount3 = new BN('123456789'); // 0.123456789 tokens
        expect(formatTokenAmount(amount3, 9)).to.equal('0.123456789');
      });

      it("Should handle zero amounts", () => {
        const amount = new BN('0');
        expect(formatTokenAmount(amount, 9)).to.equal('0');
      });

      it("Should trim trailing zeros", () => {
        const amount = new BN('1000000000'); // 1 token exactly
        expect(formatTokenAmount(amount, 9)).to.equal('1');
      });
    });

    describe("Token Amount Parsing", () => {
      it("Should parse token amounts correctly", () => {
        expect(parseTokenAmount('1', 9).toString()).to.equal('1000000000');
        expect(parseTokenAmount('1.5', 9).toString()).to.equal('1500000000');
        expect(parseTokenAmount('0.123456789', 9).toString()).to.equal('123456789');
      });

      it("Should handle whole numbers", () => {
        expect(parseTokenAmount('100', 6).toString()).to.equal('100000000');
      });

      it("Should handle decimals with fewer digits", () => {
        expect(parseTokenAmount('1.5', 9).toString()).to.equal('1500000000');
      });

      it("Should be reversible with formatTokenAmount", () => {
        const original = new BN('1234567890');
        const formatted = formatTokenAmount(original, 9);
        const parsed = parseTokenAmount(formatted, 9);
        
        expect(parsed.toString()).to.equal(original.toString());
      });
    });

    describe("Percentage and Multiplier Formatting", () => {
      it("Should format percentages correctly", () => {
        expect(formatPercentage(0.1)).to.equal('10.00%');
        expect(formatPercentage(0.025)).to.equal('2.50%');
        expect(formatPercentage(1.5, 1)).to.equal('150.0%');
      });

      it("Should format multipliers correctly", () => {
        expect(formatMultiplier(20000)).to.equal('2.00x'); // 2x
        expect(formatMultiplier(15000)).to.equal('1.50x'); // 1.5x
        expect(formatMultiplier(250000)).to.equal('25.00x'); // 25x
      });
    });
  });

  describe("🔧 Utility Functions", () => {
    it("Should have correct default constants", () => {
      expect(DEFAULT_WHISKY_FEE_BPS).to.equal(200); // 2%
    });

    it("Should handle edge cases in calculations", () => {
      // Test division by zero protection
      const lpTokens = calculateLpTokens(1000, 0, 0);
      expect(lpTokens.toString()).to.equal('1000');
      
      const withdrawAmount = calculateWithdrawAmount(1000, 5000, 0);
      expect(withdrawAmount.toString()).to.equal('0');
    });
  });

  describe("🛡️ Error Handling", () => {
    it("Should handle invalid inputs gracefully", () => {
      // Test with invalid bet arrays
      expect(() => validateBet([])).to.not.throw();
      expect(() => validateBet([0, 0])).to.not.throw();
      
      // Test with invalid amounts
      const validation = validateWager(
        new BN(-1), 
        new BN(100), 
        new BN(1000), 
        new BN(5000)
      );
      expect(validation.isValid).to.be.false;
    });

    it("Should validate PDA derivation inputs", () => {
      // Test with valid PublicKeys
      expect(() => deriveWhiskyStatePDA(WHISKY_PROGRAM_ID)).to.not.throw();
      
      // Test with different program IDs
      const customProgramId = new PublicKey('11111111111111111111111111111111');
      expect(() => deriveWhiskyStatePDA(customProgramId)).to.not.throw();
    });
  });

  describe("🧪 Integration Test Scenarios", () => {
    it("Should simulate complete LP lifecycle", () => {
      // Initial state
      const initialDeposit = new BN(1000000);
      const poolLiquidity = new BN(0);
      const lpSupply = new BN(0);
      
      // First deposit
      const lpTokens1 = calculateLpTokens(initialDeposit, poolLiquidity, lpSupply);
      expect(lpTokens1.toString()).to.equal(initialDeposit.toString());
      
      // Second deposit
      const secondDeposit = new BN(500000);
      const newPoolLiquidity = poolLiquidity.add(initialDeposit);
      const newLpSupply = lpSupply.add(lpTokens1);
      
      const lpTokens2 = calculateLpTokens(secondDeposit, newPoolLiquidity, newLpSupply);
      expect(lpTokens2.gt(new BN(0))).to.be.true;
      
      // Withdrawal
      const totalLpSupply = newLpSupply.add(lpTokens2);
      const totalLiquidity = newPoolLiquidity.add(secondDeposit);
      
      const withdrawAmount = calculateWithdrawAmount(lpTokens1, totalLiquidity, totalLpSupply);
      expect(withdrawAmount.gt(new BN(0))).to.be.true;
    });

    it("Should simulate game payout scenarios", () => {
      const wager = new BN(1000000);
      
      // Test different bet types
      const coinflip = [50, 50];
      const dice = [16, 16, 16, 16, 16, 20]; // Six-sided with slight bias
      const lottery = [1, 99]; // Very unlikely win
      
      const payouts = [coinflip, dice, lottery].map(bet => 
        calculateExpectedPayout(bet, wager)
      );
      
      // All should have positive expected values
      payouts.forEach(payout => {
        expect(payout.expectedValue).to.be.greaterThan(0);
        expect(payout.totalPayout.gt(new BN(0))).to.be.true;
      });
    });

    it("Should handle complex fee scenarios", () => {
      const wager = new BN(10000000); // 10 tokens
      
      // High fee scenario
      const highFees = calculateFees(wager, 500, 300, 200, 100); // 11% total
      expect(highFees.totalFees.lt(wager)).to.be.true; // Fees should be less than wager
      
      // No fee scenario
      const noFees = calculateFees(wager, 0, 0, 0, 0);
      expect(noFees.totalFees.toString()).to.equal('0');
      expect(noFees.netWager.toString()).to.equal(wager.toString());
    });
  });

  describe("📊 Performance and Limits", () => {
    it("Should handle large numbers correctly", () => {
      const largeWager = new BN('1000000000000000000'); // Very large number
      const fees = calculateFees(largeWager);
      
      expect(fees.totalFees.gt(new BN(0))).to.be.true;
      expect(fees.netWager.lt(largeWager)).to.be.true;
    });

    it("Should handle maximum bet array size", () => {
      const maxBet = Array(20).fill(5); // Maximum allowed outcomes
      const validation = validateBet(maxBet);
      
      expect(validation.isValid).to.be.true;
      expect(validation.outcomes).to.equal(20);
      expect(validation.totalWeight).to.equal(100);
    });

    it("Should perform calculations efficiently", () => {
      const start = Date.now();
      
      // Perform many calculations
      for (let i = 0; i < 1000; i++) {
        calculateLpTokens(1000 + i, 5000000, 2500000);
        validateBet([50, 50]);
        generateClientSeed();
      }
      
      const duration = Date.now() - start;
      expect(duration).to.be.lessThan(1000); // Should complete in under 1 second
    });
  });
}); 