# 🚀 Quick Start Guide - Whisky Gaming SDK

---

## 🛠️ **Step 1: Installation**

Create a new project and install the SDK:

```bash
# Create new project
mkdir my-whisky-game
cd my-whisky-game
npm init -y

# Install the SDK and dependencies
npm install @whisky-core/sdk @solana/web3.js @solana/wallet-adapter-base

# Install TypeScript (optional but recommended)
npm install -D typescript @types/node ts-node
```

---

## 🔧 **Step 2: Basic Setup**

Create `index.ts` with basic configuration:

```typescript
import { 
  WhiskyGamingClient, 
  createWhiskyClient,
  WHISKY_PROGRAM_ID 
} from '@whisky-core/sdk';
import { 
  Connection, 
  clusterApiUrl, 
  Keypair,
  PublicKey 
} from '@solana/web3.js';

// 🌐 Connect to Solana devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// 🔑 Create a test wallet (for demo purposes)
const wallet = {
  publicKey: Keypair.generate().publicKey,
  signTransaction: async (tx) => tx,
  signAllTransactions: async (txs) => txs,
};

// 🥃 Initialize Whisky client
const client = createWhiskyClient({
  connection,
  wallet,
  programId: WHISKY_PROGRAM_ID,
  cluster: 'devnet'
});

console.log('🎮 Whisky Gaming Client initialized!');
console.log('📍 Program ID:', WHISKY_PROGRAM_ID.toString());
```

---

## 🎮 **Step 3: Your First Game**

Let's create a simple coin flip game:

```typescript
async function createCoinFlipGame() {
  try {
    // 👤 Initialize player account
    console.log('🏗️ Initializing player...');
    await client.initializePlayer();
    console.log('✅ Player initialized!');

    // 🎲 Place a coin flip bet
    console.log('🎯 Placing coin flip bet...');
    const betResult = await client.placeBet({
      pool: new PublicKey('YourPoolAddressHere'), // We'll get this in step 4
      amount: 1000000, // 0.001 tokens
      bet: [50, 50], // 50% heads, 50% tails
      clientSeed: 'my-random-seed-' + Date.now(),
      metadata: 'Coin flip game'
    });

    // 🎉 Check results
    if (betResult.isWin) {
      console.log('🎉 YOU WON!');
      console.log(`💰 Payout: ${betResult.payout} tokens`);
    } else {
      console.log('😢 You lost, better luck next time!');
    }

    console.log(`🎲 Result: ${betResult.result}`);
    console.log(`🔗 Transaction: ${betResult.signature}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the game
createCoinFlipGame();
```

---

## 🏦 **Step 4: Working with Pools**

Before you can play, you need a liquidity pool. Here's how to find or create one:

### 📊 **Finding Existing Pools**

```typescript
async function findPools() {
  try {
    // Get protocol state
    const protocolState = await client.getProtocolState();
    console.log('📊 Protocol State:', protocolState);

    // Find pools by token mint
    const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    const poolAddress = client.findPoolAddress(usdcMint, wallet.publicKey);
    
    console.log('🏊 Pool Address:', poolAddress.toString());
    
    // Get pool information
    const pool = await client.getPool(poolAddress);
    console.log('🏦 Pool Info:', pool);

    return poolAddress;
  } catch (error) {
    console.error('❌ Error finding pools:', error.message);
    return null;
  }
}
```

### 🏗️ **Creating a New Pool**

```typescript
async function createNewPool() {
  try {
    // Create a new gaming pool
    const poolTx = await client.createPool({
      tokenMint: new PublicKey('So11111111111111111111111111111111111111112'), // SOL
      poolAuthority: wallet.publicKey,
      minWager: 100000, // 0.0001 SOL minimum
      maxWager: 10000000000, // 10 SOL maximum
      creatorFeeBps: 100, // 1% creator fee
      houseEdgeBps: 200, // 2% house edge
    });

    console.log('🏗️ Pool created!');
    console.log('🔗 Transaction:', poolTx);

    return poolTx;
  } catch (error) {
    console.error('❌ Error creating pool:', error.message);
  }
}
```

---

## 💰 **Step 5: Adding Liquidity**

As a pool creator, you'll want to add liquidity so players can bet:

```typescript
async function addLiquidity(poolAddress: PublicKey) {
  try {
    const depositTx = await client.depositLiquidity({
      pool: poolAddress,
      amount: 1000000000, // 1 SOL
      tokenMint: new PublicKey('So11111111111111111111111111111111111111112'),
    });

    console.log('💰 Liquidity added!');
    console.log('🔗 Transaction:', depositTx);

    // Check LP token balance
    const lpBalance = await client.getLpTokenBalance(poolAddress);
    console.log('🪙 LP Tokens:', lpBalance);

  } catch (error) {
    console.error('❌ Error adding liquidity:', error.message);
  }
}
```

---

## 📊 **Step 6: Analytics & Monitoring**

Track your game's performance:

```typescript
async function showAnalytics(poolAddress: PublicKey) {
  try {
    // Get pool statistics
    const poolStats = await client.getPoolStats(poolAddress);
    console.log('📊 Pool Statistics:');
    console.log(`  💰 TVL: ${poolStats.totalValueLocked} SOL`);
    console.log(`  📈 24h Volume: ${poolStats.volume24h} SOL`);
    console.log(`  🏆 Players: ${poolStats.activePlayers}`);
    console.log(`  💹 APY: ${poolStats.apy}%`);

    // Get player statistics
    const playerStats = await client.getPlayerStats();
    console.log('👤 Player Statistics:');
    console.log(`  🎮 Games Played: ${playerStats.config.totalGames}`);
    console.log(`  💰 Total Wagered: ${playerStats.config.totalWagered}`);
    console.log(`  🏆 Win Rate: ${playerStats.winRate}%`);
    console.log(`  📈 ROI: ${playerStats.totalROI}%`);

  } catch (error) {
    console.error('❌ Error fetching analytics:', error.message);
  }
}
```

---

## 🔄 **Step 7: Complete Example**

Here's a complete working example that puts it all together:

```typescript
import { 
  WhiskyGamingClient,
  createWhiskyClient,
  WHISKY_PROGRAM_ID,
  generateClientSeed
} from '@whisky-core/sdk';
import { Connection, clusterApiUrl, Keypair, PublicKey } from '@solana/web3.js';

async function main() {
  // Setup
  const connection = new Connection(clusterApiUrl('devnet'));
  const wallet = {
    publicKey: Keypair.generate().publicKey,
    signTransaction: async (tx) => tx,
    signAllTransactions: async (txs) => txs,
  };

  const client = createWhiskyClient({
    connection,
    wallet,
    programId: WHISKY_PROGRAM_ID
  });

  try {
    console.log('🚀 Starting Whisky Gaming Demo...\n');

    // 1. Initialize player
    console.log('👤 Initializing player...');
    await client.initializePlayer();
    console.log('✅ Player ready!\n');

    // 2. Find or create pool
    console.log('🏊 Looking for pools...');
    const poolAddress = await findBestPool(client);
    console.log(`🏦 Using pool: ${poolAddress}\n`);

    // 3. Play some games
    console.log('🎮 Playing 3 games...\n');
    for (let i = 1; i <= 3; i++) {
      console.log(`🎲 Game ${i}:`);
      await playRoulette(client, poolAddress, i);
      console.log('');
    }

    // 4. Show final stats
    console.log('📊 Final Statistics:');
    await showFinalStats(client, poolAddress);

  } catch (error) {
    console.error('💥 Demo failed:', error.message);
  }
}

async function findBestPool(client: WhiskyGamingClient): Promise<PublicKey> {
  // In practice, you'd fetch this from an API or the protocol
  return new PublicKey('11111111111111111111111111111111'); // Placeholder
}

async function playRoulette(client: WhiskyGamingClient, pool: PublicKey, gameNum: number) {
  const colors = ['red', 'black', 'green'];
  const bet = gameNum === 1 ? [48, 48, 4] : // Red/Black/Green
           gameNum === 2 ? [33, 33, 34] : // Even distribution
                           [70, 25, 5];   // Risky red bet

  const result = await client.placeBet({
    pool,
    amount: 500000 * gameNum, // Increasing bets
    bet,
    clientSeed: generateClientSeed(),
    metadata: `Roulette game ${gameNum}`
  });

  const winColor = colors[result.result] || 'unknown';
  console.log(`  🎯 Bet on: [${bet.join(', ')}] (Red/Black/Green)`);
  console.log(`  🎰 Result: ${result.result} (${winColor})`);
  console.log(`  ${result.isWin ? '🎉 WIN' : '😢 LOSE'} - Payout: ${result.payout}`);
}

async function showFinalStats(client: WhiskyGamingClient, pool: PublicKey) {
  const playerStats = await client.getPlayerStats();
  const poolStats = await client.getPoolStats(pool);

  console.log(`  👤 Games played: ${playerStats.config.totalGames}`);
  console.log(`  💰 Total wagered: ${playerStats.config.totalWagered}`);
  console.log(`  🏆 Win rate: ${playerStats.winRate.toFixed(1)}%`);
  console.log(`  📈 Pool TVL: ${poolStats.totalValueLocked}`);
}

// Run the demo
main().catch(console.error);
```

---

## 🎯 **What's Next?**

Congratulations! 🎉 You've just built your first Whisky Gaming application. Here's what to explore next:

### 🔧 **Development**
- [📖 API Reference](./api/README.md) - Complete SDK documentation
- [🎮 Game Examples](./examples/casino.md) - More complex game types
- [🏦 Pool Management](./guides/create-pools.md) - Advanced pool features
- [🔒 Security Guide](./guides/security.md) - Best practices

### 🚀 **Production**
- [⚡ Optimization](./advanced/optimization.md) - Performance tuning
- [📊 Analytics](./guides/analytics.md) - Advanced monitoring
- [🌐 Deployment](./guides/deployment.md) - Going live
- [🤝 Integration](./advanced/plugins.md) - Third-party services

### 💡 **Inspiration**
- [🎰 Casino Examples](./examples/casino.md) - Slots, poker, blackjack
- [🎯 Prediction Markets](./examples/predictions.md) - Sports betting, elections
- [🏆 Tournaments](./examples/tournaments.md) - Competitive gaming
- [💎 NFT Gaming](./examples/nft-gaming.md) - Asset-based games

---

## 🆘 **Need Help?**

- 💬 **Discord**: [Join our community](https://discord.gg/whisky-gaming)
- 📧 **Email**: [dev@whisky.game](mailto:dev@whisky.game)
- 🐛 **Issues**: [GitHub Issues](https://github.com/whisky-gaming/sdk/issues)
- 📖 **Docs**: [Complete Documentation](./README.md)

---

**🎮 Happy gaming! Welcome to the future of DeFi gaming on Solana! 🚀** 