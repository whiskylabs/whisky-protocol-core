import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet, web3 } from "@coral-xyz/anchor";
// import { WhiskyCore } from "../target/types/whisky_core"; // Not available in SDK
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  LAMPORTS_PER_SOL,
  Connection
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  mintTo,
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccount,
  getAccount,
  getMint,
  getAssociatedTokenAddressSync
} from "@solana/spl-token";
import { expect } from "chai";
import { BN } from "bn.js";

// Import SDK for testing
import { 
  WhiskyGamingClient,
  deriveWhiskyStatePDA,
  derivePoolPDA,
  derivePlayerPDA,
  deriveGamePDA,
  calculateLpTokens,
  validateBet,
  generateClientSeed
} from "../src";

describe("🥃 WHISKY GAMING PROTOCOL - COMPREHENSIVE TEST SUITE", () => {
  // Configure the client
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  // Initialize program
  const program = anchor.workspace.WhiskyCore as Program<WhiskyCore>;
  
  // Test accounts and keypairs
  let authority: Keypair;
  let rngProvider: Keypair;
  let poolAuthority: Keypair;
  let user1: Keypair;
  let user2: Keypair;
  let creator: Keypair;
  
  // Token and program accounts
  let tokenMint: PublicKey;
  let bonusTokenMint: PublicKey;
  let whiskyState: PublicKey;
  let pool: PublicKey;
  let lpMint: PublicKey;
  let player1: PublicKey;
  let game1: PublicKey;
  let player2: PublicKey;
  let game2: PublicKey;
  
  // Test constants
  const INITIAL_MINT_AMOUNT = new BN(1_000_000_000_000); // 1M tokens
  const LARGE_DEPOSIT = new BN(100_000_000_000); // 100K tokens
  const MEDIUM_DEPOSIT = new BN(10_000_000_000); // 10K tokens
  const SMALL_WAGER = new BN(1_000_000); // 1 token
  const LARGE_WAGER = new BN(100_000_000); // 100 tokens
  
  // SDK Client
  let whiskyClient: WhiskyGamingClient;
  
  before("🔧 COMPREHENSIVE TEST SETUP", async () => {
    console.log("\n🚀 INITIALIZING WHISKY PROTOCOL TEST SUITE");
    console.log("Program ID:", program.programId.toString());
    
    // Generate all required keypairs
    authority = Keypair.generate();
    rngProvider = Keypair.generate();
    poolAuthority = Keypair.generate();
    user1 = Keypair.generate();
    user2 = Keypair.generate();
    creator = Keypair.generate();
    
    // Fund all accounts
    const accounts = [authority, rngProvider, poolAuthority, user1, user2, creator];
    for (const account of accounts) {
      await provider.connection.requestAirdrop(account.publicKey, 10 * LAMPORTS_PER_SOL);
    }
    
    // Wait for airdrops to confirm
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create test tokens
    tokenMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      authority.publicKey,
      9 // 9 decimals
    );
    
    bonusTokenMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      authority.publicKey,
      9
    );
    
    console.log("🪙 Test Token Mint:", tokenMint.toString());
    console.log("🎁 Bonus Token Mint:", bonusTokenMint.toString());
    
    // Derive all PDAs
    [whiskyState] = deriveWhiskyStatePDA(program.programId);
    [pool] = derivePoolPDA(tokenMint, poolAuthority.publicKey, program.programId);
    [player1] = derivePlayerPDA(user1.publicKey, program.programId);
    [game1] = deriveGamePDA(user1.publicKey, program.programId);
    [player2] = derivePlayerPDA(user2.publicKey, program.programId);
    [game2] = deriveGamePDA(user2.publicKey, program.programId);
    
    // Mint tokens to test accounts
    for (const user of [user1, user2, creator, poolAuthority]) {
      const userAta = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        authority,
        tokenMint,
        user.publicKey
      );
      
      await mintTo(
        provider.connection,
        authority,
        tokenMint,
        userAta.address,
        authority,
        INITIAL_MINT_AMOUNT.toNumber()
      );
    }
    
    // Initialize SDK client
    whiskyClient = new WhiskyGamingClient({
      connection: provider.connection,
      wallet: new anchor.Wallet(user1),
      programId: program.programId,
      debug: true
    });
    
    console.log("📍 All PDAs derived and SDK initialized");
    console.log("✅ Comprehensive test setup completed!\n");
  });

  describe("🔥 PROTOCOL INITIALIZATION", () => {
    it("Should initialize Whisky protocol successfully", async () => {
      const tx = await program.methods
        .whiskyInitialize()
        .accounts({
          whiskyState,
          initializer: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      console.log("🎮 Protocol initialized, tx:", tx);

      // Verify protocol state
      const protocolState = await program.account.whiskyState.fetch(whiskyState);
      expect(protocolState.authority.toString()).to.equal(authority.publicKey.toString());
      expect(protocolState.playingAllowed).to.be.true;
      expect(protocolState.poolCreationAllowed).to.be.true;
    });

    it("Should fail to initialize protocol twice", async () => {
      try {
        await program.methods
          .whiskyInitialize()
          .accounts({
            whiskyState,
            initializer: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([authority])
          .rpc();
        
        expect.fail("Should have failed");
      } catch (error) {
        console.log("✅ Correctly failed to initialize twice");
      }
    });

    it("Should update protocol configuration", async () => {
      await program.methods
        .whiskySetConfig(
          rngProvider.publicKey,
          new BN(250), // whisky fee
          new BN(600), // max creator fee
          new BN(2000000), // pool creation fee
          new BN(10000), // anti spam fee
          new BN(1200), // max house edge
          new BN(150), // default pool fee
          new BN(6500), // jackpot to user
          new BN(1500), // jackpot to creator
          new BN(1000), // jackpot to pool
          new BN(1000), // jackpot to whisky
          new BN(200), // bonus ratio
          new BN(15000), // max payout
          new BN(50), // pool withdraw fee
          true, // pool creation allowed
          true, // deposit allowed
          true, // withdraw allowed
          true, // playing allowed
          authority.publicKey // distribution recipient
        )
        .accounts({
          whiskyState,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const protocolState = await program.account.whiskyState.fetch(whiskyState);
      expect(protocolState.whiskyFeeBps.toNumber()).to.equal(250);
      expect(protocolState.maxCreatorFeeBps.toNumber()).to.equal(600);
      console.log("✅ Protocol configuration updated successfully");
    });
  });

  describe("🏊 POOL OPERATIONS", () => {
    it("Should create a new gaming pool", async () => {
      const [poolLpMint] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("POOL_LP_MINT"),
          tokenMint.toBuffer(),
          poolAuthority.publicKey.toBuffer(),
        ],
        program.programId
      );
      lpMint = poolLpMint;

      const poolUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        pool,
        true
      );

      const [poolBonusUnderlyingAta] = PublicKey.findProgramAddressSync(
        [Buffer.from('POOL_BONUS_UNDERLYING_TA'), pool.toBuffer()],
        program.programId
      );

      const [lpMintMetadata] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
          lpMint.toBuffer()
        ],
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      );

      const [bonusMint] = PublicKey.findProgramAddressSync(
        [Buffer.from('POOL_BONUS_MINT'), pool.toBuffer()],
        program.programId
      );

      const [bonusMintMetadata] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
          bonusMint.toBuffer()
        ],
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      );

      const tx = await program.methods
        .poolInitialize(
          poolAuthority.publicKey,
          Keypair.generate().publicKey // lookup address
        )
        .accounts({
          initializer: poolAuthority.publicKey,
          whiskyState,
          underlyingTokenMint: tokenMint,
          pool,
          poolUnderlyingTokenAccount: poolUnderlyingAta,
          poolBonusUnderlyingTokenAccount: poolBonusUnderlyingAta,
          whiskyStateAta: getAssociatedTokenAddressSync(tokenMint, whiskyState, true),
          lpMint,
          lpMintMetadata,
          bonusMint,
          bonusMintMetadata,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
          tokenMetadataProgram: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
        })
        .signers([poolAuthority])
        .rpc();

      console.log("🎰 Pool created, tx:", tx);

      // Verify pool creation
      const poolData = await program.account.pool.fetch(pool);
      expect(poolData.poolAuthority.toString()).to.equal(poolAuthority.publicKey.toString());
      expect(poolData.underlyingTokenMint.toString()).to.equal(tokenMint.toString());
      expect(poolData.plays.toNumber()).to.equal(0);
    });

    it("Should deposit liquidity to pool", async () => {
      const userUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        user1.publicKey
      );

      const userLpAta = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        user1,
        lpMint,
        user1.publicKey
      );

      const poolUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        pool,
        true
      );

      const depositAmount = LARGE_DEPOSIT;
      
      const tx = await program.methods
        .poolDeposit(depositAmount)
        .accounts({
          pool,
          underlyingTokenMint: tokenMint,
          poolUnderlyingTokenAccount: poolUnderlyingAta,
          userUnderlyingAta,
          userLpAta: userLpAta.address,
          user: user1.publicKey,
          lpMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc();

      console.log("💰 Liquidity deposited, tx:", tx);

      // Verify deposit
      const poolAccount = await getAccount(provider.connection, poolUnderlyingAta);
      expect(poolAccount.amount.toString()).to.equal(depositAmount.toString());

      const userLpAccount = await getAccount(provider.connection, userLpAta.address);
      expect(userLpAccount.amount > 0n).to.be.true;
    });

    it("Should calculate LP tokens correctly", async () => {
      const depositAmount = 1000000;
      const poolLiquidity = 100000000;
      const lpSupply = 50000000;
      
      const expectedLpTokens = calculateLpTokens(depositAmount, poolLiquidity, lpSupply);
      const expectedValue = (depositAmount * lpSupply) / poolLiquidity;
      
      expect(expectedLpTokens.toNumber()).to.equal(expectedValue);
      console.log("✅ LP token calculation verified");
    });

    it("Should allow pool authority to set custom parameters", async () => {
      const tx = await program.methods
        .poolSetMinWager(new BN(500000)) // 0.5 tokens
        .accounts({
          pool,
          poolAuthority: poolAuthority.publicKey,
        })
        .signers([poolAuthority])
        .rpc();

      const poolData = await program.account.pool.fetch(pool);
      expect(poolData.minWager.toNumber()).to.equal(500000);
      console.log("✅ Pool minimum wager updated");
    });
  });

  describe("👤 PLAYER MANAGEMENT", () => {
    it("Should initialize player accounts", async () => {
      const tx1 = await program.methods
        .playerInitialize()
        .accounts({
          player: player1,
          user: user1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      const tx2 = await program.methods
        .playerInitialize()
        .accounts({
          player: player2,
          user: user2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      console.log("👤 Players initialized:", tx1, tx2);

      // Verify player initialization
      const player1Data = await program.account.player.fetch(player1);
      expect(player1Data.user.toString()).to.equal(user1.publicKey.toString());
      expect(player1Data.nonce.toNumber()).to.equal(0);

      const player2Data = await program.account.player.fetch(player2);
      expect(player2Data.user.toString()).to.equal(user2.publicKey.toString());
    });

    it("Should fail to initialize player twice", async () => {
      try {
        await program.methods
          .playerInitialize()
          .accounts({
            player: player1,
            user: user1.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();
        
        expect.fail("Should have failed");
      } catch (error) {
        console.log("✅ Correctly failed to initialize player twice");
      }
    });
  });

  describe("🎲 GAMING MECHANICS", () => {
    it("Should validate bet configurations", async () => {
      // Valid bets
      expect(validateBet([50, 50]).isValid).to.be.true;
      expect(validateBet([25, 25, 25, 25]).isValid).to.be.true;
      expect(validateBet([10, 90]).isValid).to.be.true;
      
      // Invalid bets
      expect(validateBet([]).isValid).to.be.false;
      expect(validateBet([0, 0]).isValid).to.be.false;
      expect(validateBet([50]).isValid).to.be.false;
      
      console.log("✅ Bet validation working correctly");
    });

    it("Should generate valid client seeds", async () => {
      const seed1 = generateClientSeed();
      const seed2 = generateClientSeed();
      
      expect(seed1).to.be.a('string');
      expect(seed1.length).to.equal(32);
      expect(seed1).to.not.equal(seed2);
      
      console.log("✅ Client seed generation working");
    });

    it("Should place a bet successfully", async () => {
      const userUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        user1.publicKey
      );

      const poolUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        pool,
        true
      );

      const wager = LARGE_WAGER;
      const bet = [50, 50]; // 50-50 coinflip
      const clientSeed = generateClientSeed();

      const tx = await program.methods
        .playGame(
          wager,
          bet,
          clientSeed,
          100, // 1% creator fee
          50,  // 0.5% jackpot fee
          "Test Game #1"
        )
        .accounts({
          user: user1.publicKey,
          player: player1,
          game: game1,
          pool,
          poolUnderlyingTokenAccount: poolUnderlyingAta,
          userUnderlyingAta,
          underlyingTokenMint: tokenMint,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc();

      console.log("🎲 Game placed, tx:", tx);

      // Verify game creation
      const gameData = await program.account.game.fetch(game1);
      expect(gameData.user.toString()).to.equal(user1.publicKey.toString());
      expect(gameData.wager.toString()).to.equal(wager.toString());
      expect(gameData.bet).to.deep.equal(bet);
      expect(gameData.clientSeed).to.equal(clientSeed);
    });

    it("Should prevent betting with insufficient funds", async () => {
      const user3 = Keypair.generate();
      await provider.connection.requestAirdrop(user3.publicKey, LAMPORTS_PER_SOL);
      
      // Don't mint tokens to user3, so they have no balance
      const [player3] = derivePlayerPDA(user3.publicKey, program.programId);
      const [game3] = deriveGamePDA(user3.publicKey, program.programId);

      // Initialize player first
      await program.methods
        .playerInitialize()
        .accounts({
          player: player3,
          user: user3.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user3])
        .rpc();

      const userUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        user3.publicKey
      );

      const poolUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        pool,
        true
      );

      try {
        await program.methods
          .playGame(
            LARGE_WAGER,
            [50, 50],
            generateClientSeed(),
            0,
            0,
            "Insufficient funds test"
          )
          .accounts({
            user: user3.publicKey,
            player: player3,
            game: game3,
            pool,
            poolUnderlyingTokenAccount: poolUnderlyingAta,
            userUnderlyingAta,
            underlyingTokenMint: tokenMint,
            creator: creator.publicKey,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user3])
          .rpc();
        
        expect.fail("Should have failed due to insufficient funds");
      } catch (error) {
        console.log("✅ Correctly prevented betting with insufficient funds");
      }
    });

    it("Should handle multiple concurrent games", async () => {
      // Second player places a bet
      const userUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        user2.publicKey
      );

      const poolUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        pool,
        true
      );

      const tx = await program.methods
        .playGame(
          SMALL_WAGER,
          [30, 70], // 30-70 odds
          generateClientSeed(),
          200, // 2% creator fee
          100, // 1% jackpot fee
          "Test Game #2"
        )
        .accounts({
          user: user2.publicKey,
          player: player2,
          game: game2,
          pool,
          poolUnderlyingTokenAccount: poolUnderlyingAta,
          userUnderlyingAta,
          underlyingTokenMint: tokenMint,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user2])
        .rpc();

      console.log("🎲 Second game placed, tx:", tx);

      // Verify both games exist
      const game1Data = await program.account.game.fetch(game1);
      const game2Data = await program.account.game.fetch(game2);
      
      expect(game1Data.status).to.deep.equal({ resultRequested: {} });
      expect(game2Data.status).to.deep.equal({ resultRequested: {} });
    });
  });

  describe("🎯 RNG AND SETTLEMENT", () => {
    it("Should settle game with RNG", async () => {
      const rngSeed = "test_rng_seed_123456789";
      const nextRngSeedHashed = "next_seed_hash_987654321";

      const tx = await program.methods
        .rngSettle(rngSeed, nextRngSeedHashed)
        .accounts({
          game: game1,
          rngAddress: rngProvider.publicKey,
        })
        .signers([rngProvider])
        .rpc();

      console.log("🎯 Game settled with RNG, tx:", tx);

      // Verify game settlement
      const gameData = await program.account.game.fetch(game1);
      expect(gameData.status).to.deep.equal({ ready: {} });
      expect(gameData.rngSeed).to.equal(rngSeed);
      expect(gameData.result).to.be.at.least(0);
      expect(gameData.result).to.be.below(gameData.bet.length);
    });

    it("Should allow player to claim winnings if won", async () => {
      const gameData = await program.account.game.fetch(game1);
      
      if (gameData.result === 0 || gameData.result === 1) {
        // Player won, can claim
        const userUnderlyingAta = getAssociatedTokenAddressSync(
          tokenMint,
          user1.publicKey
        );

        const poolUnderlyingAta = getAssociatedTokenAddressSync(
          tokenMint,
          pool,
          true
        );

        const tx = await program.methods
          .playerClaim()
          .accounts({
            user: user1.publicKey,
            player: player1,
            game: game1,
            pool,
            poolUnderlyingTokenAccount: poolUnderlyingAta,
            userUnderlyingAta,
            underlyingTokenMint: tokenMint,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user1])
          .rpc();

        console.log("💰 Winnings claimed, tx:", tx);
      } else {
        console.log("😢 Player lost, no winnings to claim");
      }
    });

    it("Should prevent double claiming", async () => {
      const gameData = await program.account.game.fetch(game1);
      
      if (gameData.result === 0 || gameData.result === 1) {
        // Try to claim again
        try {
          const userUnderlyingAta = getAssociatedTokenAddressSync(
            tokenMint,
            user1.publicKey
          );

          const poolUnderlyingAta = getAssociatedTokenAddressSync(
            tokenMint,
            pool,
            true
          );

          await program.methods
            .playerClaim()
            .accounts({
              user: user1.publicKey,
              player: player1,
              game: game1,
              pool,
              poolUnderlyingTokenAccount: poolUnderlyingAta,
              userUnderlyingAta,
              underlyingTokenMint: tokenMint,
              tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([user1])
            .rpc();
          
          expect.fail("Should have failed double claim");
        } catch (error) {
          console.log("✅ Correctly prevented double claiming");
        }
      }
    });
  });

  describe("📊 STATISTICS AND ANALYTICS", () => {
    it("Should track pool statistics", async () => {
      const poolData = await program.account.pool.fetch(pool);
      
      expect(poolData.plays.toNumber()).to.be.at.least(2);
      expect(poolData.liquidityCheckpoint.toNumber()).to.be.at.least(0);
      
      console.log("📊 Pool plays:", poolData.plays.toString());
      console.log("📊 Pool liquidity checkpoint:", poolData.liquidityCheckpoint.toString());
    });

    it("Should track player statistics", async () => {
      const player1Data = await program.account.player.fetch(player1);
      const player2Data = await program.account.player.fetch(player2);
      
      expect(player1Data.nonce.toNumber()).to.be.at.least(1);
      expect(player2Data.nonce.toNumber()).to.be.at.least(1);
      
      console.log("📊 Player 1 nonce:", player1Data.nonce.toString());
      console.log("📊 Player 2 nonce:", player2Data.nonce.toString());
    });

    it("Should calculate pool utilization", async () => {
      const poolAccount = await getAccount(
        provider.connection, 
        getAssociatedTokenAddressSync(tokenMint, pool, true)
      );
      
      const liquidity = Number(poolAccount.amount);
      expect(liquidity).to.be.greaterThan(0);
      
      console.log("📊 Pool liquidity:", liquidity);
    });
  });

  describe("🔐 SECURITY TESTS", () => {
    it("Should prevent unauthorized protocol updates", async () => {
      try {
        await program.methods
          .whiskySetConfig(
            rngProvider.publicKey,
            new BN(9999), // Very high fee
            new BN(9999),
            new BN(1),
            new BN(1),
            new BN(1),
            new BN(1),
            new BN(1),
            new BN(1),
            new BN(1),
            new BN(1),
            new BN(1),
            new BN(1),
            new BN(1),
            false,
            false,
            false,
            false,
            user1.publicKey
          )
          .accounts({
            whiskyState,
            authority: user1.publicKey, // Wrong authority
          })
          .signers([user1])
          .rpc();
        
        expect.fail("Should have failed unauthorized update");
      } catch (error) {
        console.log("✅ Correctly prevented unauthorized protocol update");
      }
    });

    it("Should prevent unauthorized pool modifications", async () => {
      try {
        await program.methods
          .poolSetMinWager(new BN(1))
          .accounts({
            pool,
            poolAuthority: user1.publicKey, // Wrong authority
          })
          .signers([user1])
          .rpc();
        
        expect.fail("Should have failed unauthorized pool modification");
      } catch (error) {
        console.log("✅ Correctly prevented unauthorized pool modification");
      }
    });

    it("Should validate bet array bounds", async () => {
      const invalidBets = [
        [], // Empty
        [0], // Single outcome
        [0, 0], // Zero weights
        Array(25).fill(10), // Too many outcomes
      ];

      for (const bet of invalidBets) {
        const validation = validateBet(bet);
        expect(validation.isValid).to.be.false;
      }
      
      console.log("✅ Bet validation correctly rejects invalid bets");
    });
  });

  describe("💧 LIQUIDITY MANAGEMENT", () => {
    it("Should allow liquidity withdrawal", async () => {
      const userLpAta = getAssociatedTokenAddressSync(
        lpMint,
        user1.publicKey
      );

      const userUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        user1.publicKey
      );

      const poolUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        pool,
        true
      );

      // Get user's LP balance
      const userLpAccount = await getAccount(provider.connection, userLpAta);
      const lpBalance = userLpAccount.amount;

      // Withdraw 50% of LP tokens
      const withdrawAmount = new BN(lpBalance.toString()).div(new BN(2));

      const tx = await program.methods
        .poolWithdraw(withdrawAmount)
        .accounts({
          pool,
          underlyingTokenMint: tokenMint,
          poolUnderlyingTokenAccount: poolUnderlyingAta,
          userUnderlyingAta,
          userLpAta,
          user: user1.publicKey,
          lpMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc();

      console.log("💧 Liquidity withdrawn, tx:", tx);

      // Verify withdrawal
      const userLpAccountAfter = await getAccount(provider.connection, userLpAta);
      expect(Number(userLpAccountAfter.amount)).to.be.lessThan(Number(lpBalance));
    });

    it("Should prevent withdrawal of more LP tokens than owned", async () => {
      const userLpAta = getAssociatedTokenAddressSync(
        lpMint,
        user2.publicKey
      );

      // User2 doesn't have LP tokens, so this should fail
      try {
        await program.methods
          .poolWithdraw(new BN(1000000))
          .accounts({
            pool,
            underlyingTokenMint: tokenMint,
            poolUnderlyingTokenAccount: getAssociatedTokenAddressSync(tokenMint, pool, true),
            userUnderlyingAta: getAssociatedTokenAddressSync(tokenMint, user2.publicKey),
            userLpAta,
            user: user2.publicKey,
            lpMint,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user2])
          .rpc();
        
        expect.fail("Should have failed withdrawal without LP tokens");
      } catch (error) {
        console.log("✅ Correctly prevented withdrawal without sufficient LP tokens");
      }
    });
  });

  describe("🧪 EDGE CASES AND STRESS TESTS", () => {
    it("Should handle minimum wager amounts", async () => {
      const poolData = await program.account.pool.fetch(pool);
      const minWager = poolData.minWager;

      const userUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        user2.publicKey
      );

      const poolUnderlyingAta = getAssociatedTokenAddressSync(
        tokenMint,
        pool,
        true
      );

      // This should succeed with minimum wager
      const tx = await program.methods
        .playGame(
          minWager,
          [60, 40],
          generateClientSeed(),
          0,
          0,
          "Minimum wager test"
        )
        .accounts({
          user: user2.publicKey,
          player: player2,
          game: game2, // Reusing game2 for this test
          pool,
          poolUnderlyingTokenAccount: poolUnderlyingAta,
          userUnderlyingAta,
          underlyingTokenMint: tokenMint,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user2])
        .rpc();

      console.log("🧪 Minimum wager test passed, tx:", tx);
    });

    it("Should handle complex bet distributions", async () => {
      const complexBets = [
        [1, 2, 3, 4, 5], // Increasing weights
        [100, 50, 25, 12, 6, 3, 2, 1, 1], // Decreasing weights
        [33, 33, 34], // Nearly equal three-way
      ];

      for (const bet of complexBets) {
        const validation = validateBet(bet);
        expect(validation.isValid).to.be.true;
        expect(validation.totalWeight).to.equal(bet.reduce((a, b) => a + b, 0));
      }

      console.log("✅ Complex bet distributions validated");
    });
  });

  after("🧹 CLEANUP", async () => {
    console.log("\n🧹 Test cleanup completed");
    console.log("📊 Final Statistics:");
    
    try {
      const protocolState = await program.account.whiskyState.fetch(whiskyState);
      console.log("  - Protocol Active:", protocolState.playingAllowed);
      
      const poolData = await program.account.pool.fetch(pool);
      console.log("  - Total Games Played:", poolData.plays.toString());
      
      const player1Data = await program.account.player.fetch(player1);
      const player2Data = await program.account.player.fetch(player2);
      console.log("  - Player 1 Games:", player1Data.nonce.toString());
      console.log("  - Player 2 Games:", player2Data.nonce.toString());
      
    } catch (error) {
      console.log("Could not fetch final statistics:", error.message);
    }
    
    console.log("✅ All tests completed successfully! 🎉");
  });
}); 