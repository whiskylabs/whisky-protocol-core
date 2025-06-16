# 📋 API Reference - Whisky Gaming SDK

**Complete TypeScript API documentation for the Whisky Gaming Protocol SDK**

---

## 🏗️ **Core Classes**

### 🎮 **WhiskyGamingClient**

The main client class for interacting with the Whisky Gaming Protocol.

```typescript
class WhiskyGamingClient {
  constructor(config: WhiskySDKConfig)
}
```

**Configuration:**
```typescript
interface WhiskySDKConfig {
  connection: Connection;
  wallet: Wallet;
  programId: string | PublicKey;
  cluster?: 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';
  commitment?: Commitment;
  debug?: boolean;
}
```

---

## 🏦 **Pool Operations**

### `createPool(params: CreatePoolParams): Promise<string>`

Creates a new gaming liquidity pool.

```typescript
interface CreatePoolParams {
  tokenMint: PublicKey;
  poolAuthority: PublicKey;
  minWager?: number;
  maxWager?: number;
  creatorFeeBps?: number;
  houseEdgeBps?: number;
  lookupAddress?: PublicKey;
}
```

**Example:**
```typescript
const poolTx = await client.createPool({
  tokenMint: solMint,
  poolAuthority: wallet.publicKey,
  minWager: 100000, // 0.0001 SOL
  maxWager: 10000000000, // 10 SOL
  creatorFeeBps: 100, // 1%
  houseEdgeBps: 200, // 2%
});
```

### `depositLiquidity(params: DepositLiquidityParams): Promise<string>`

Adds liquidity to an existing pool.

```typescript
interface DepositLiquidityParams {
  pool: PublicKey;
  amount: number;
  tokenMint: PublicKey;
  userTokenAccount?: PublicKey;
}
```

**Example:**
```typescript
const depositTx = await client.depositLiquidity({
  pool: poolAddress,
  amount: 1000000000, // 1 SOL
  tokenMint: solMint,
});
```

### `withdrawLiquidity(params: WithdrawLiquidityParams): Promise<string>`

Withdraws liquidity from a pool.

```typescript
interface WithdrawLiquidityParams {
  pool: PublicKey;
  lpAmount: number;
  tokenMint: PublicKey;
  userTokenAccount?: PublicKey;
  userLpAccount?: PublicKey;
}
```

### `getPool(poolAddress: PublicKey): Promise<Pool>`

Retrieves pool information.

```typescript
interface Pool {
  poolAuthority: PublicKey;
  underlyingTokenMint: PublicKey;
  lpMint: PublicKey;
  minWager: BN;
  maxWager: BN;
  creatorFeeBps: BN;
  houseEdgeBps: BN;
  totalLiquidity: BN;
  lpSupply: BN;
  plays: BN;
  volume: BN;
  feesCollected: BN;
  createdAt: BN;
  isActive: boolean;
  lookupAddress?: PublicKey;
}
```

### `getPoolStats(poolAddress: PublicKey): Promise<PoolStats>`

Gets comprehensive pool statistics.

```typescript
interface PoolStats {
  address: PublicKey;
  config: Pool;
  totalValueLocked: number;
  lpTokenPrice: number;
  volume24h: number;
  totalVolume: number;
  activePlayers: number;
  apy: number;
  houseEdge: number;
}
```

---

## 👤 **Player Operations**

### `initializePlayer(): Promise<string>`

Initializes a player account for the current wallet.

```typescript
const playerTx = await client.initializePlayer();
```

### `getPlayer(playerAddress?: PublicKey): Promise<Player>`

Retrieves player information.

```typescript
interface Player {
  user: PublicKey;
  nonce: BN;
  totalGames: BN;
  totalWagered: BN;
  totalWinnings: BN;
  netProfitLoss: BN;
  lastGameAt: BN;
  createdAt: BN;
  isActive: boolean;
}
```

### `getPlayerStats(playerAddress?: PublicKey): Promise<PlayerStats>`

Gets comprehensive player statistics.

```typescript
interface PlayerStats {
  address: PublicKey;
  config: Player;
  winRate: number;
  avgBetSize: number;
  profitLossRatio: number;
  totalROI: number;
  favoritePools: PublicKey[];
}
```

---

## 🎲 **Game Operations**

### `placeBet(params: PlaceBetParams): Promise<GameResult>`

Places a bet in a gaming pool.

```typescript
interface PlaceBetParams {
  pool: PublicKey;
  amount: number;
  bet: number[];
  clientSeed?: string;
  creatorFeeBps?: number;
  jackpotFeeBps?: number;
  metadata?: string;
  userTokenAccount?: PublicKey;
}
```

**Example:**
```typescript
const result = await client.placeBet({
  pool: poolAddress,
  amount: 1000000, // 0.001 tokens
  bet: [50, 30, 20], // Weighted outcomes
  clientSeed: 'my-random-seed',
  metadata: 'Coin flip game'
});

if (result.isWin) {
  console.log(`Won ${result.payout} tokens!`);
}
```

### `claimWinnings(params: ClaimWinningsParams): Promise<string>`

Claims winnings from a completed game.

```typescript
interface ClaimWinningsParams {
  pool: PublicKey;
  game: PublicKey;
  userTokenAccount?: PublicKey;
}
```

### `getGame(gameAddress?: PublicKey): Promise<Game>`

Retrieves game information.

```typescript
interface Game {
  user: PublicKey;
  pool: PublicKey;
  status: GameStatus;
  wager: BN;
  bet: number[];
  result: number;
  payout: BN;
  creatorFeeBps: number;
  jackpotFeeBps: number;
  clientSeed: string;
  metadata: string;
  createdAt: BN;
  completedAt?: BN;
  isWin: boolean;
}

enum GameStatus {
  None = 0,
  ResultRequested = 1,
  Ready = 2,
  Completed = 3,
  Failed = 4,
}
```

---

## ⚙️ **Protocol Operations**

### `initializeProtocol(): Promise<string>`

Initializes the Whisky Gaming Protocol (admin only).

### `getProtocolState(): Promise<WhiskyState>`

Retrieves the current protocol state.

```typescript
interface WhiskyState {
  authority: PublicKey;
  rngAddress: PublicKey;
  antiSpamFee: BN;
  whiskyFeeBps: BN;
  maxCreatorFeeBps: BN;
  poolCreationFee: BN;
  maxHouseEdgeBps: BN;
  defaultPoolFeeBps: BN;
  jackpotToUserBps: BN;
  jackpotToCreatorBps: BN;
  jackpotToPoolBps: BN;
  jackpotToWhiskyBps: BN;
  bonusRatioBps: BN;
  maxWager: BN;
  minPoolBalance: BN;
  poolCreationAllowed: boolean;
  playingAllowed: boolean;
  withdrawalsAllowed: boolean;
  depositsAllowed: boolean;
  antiSpamAuthority: PublicKey;
}
```

---

## 🔧 **Utility Functions**

### **PDA Derivation**

```typescript
// Derive protocol state PDA
function deriveWhiskyStatePDA(programId: PublicKey): [PublicKey, number]

// Derive pool PDA
function derivePoolPDA(
  tokenMint: PublicKey,
  poolAuthority: PublicKey,
  programId: PublicKey
): [PublicKey, number]

// Derive player PDA
function derivePlayerPDA(user: PublicKey, programId: PublicKey): [PublicKey, number]

// Derive game PDA
function deriveGamePDA(user: PublicKey, programId: PublicKey): [PublicKey, number]
```

### **Calculations**

```typescript
// Calculate LP tokens for deposit
function calculateLpTokens(
  depositAmount: number,
  poolLiquidity: number,
  lpSupply: number
): number

// Calculate expected return from bet
function calculateExpectedReturn(bet: number[], wager: number): number

// Calculate house edge
function calculateHouseEdge(
  totalVolume: number,
  totalPayouts: number,
  feesCollected: number
): number

// Calculate pool utilization
function calculatePoolUtilization(
  activeWagers: number,
  totalLiquidity: number
): number

// Calculate APY for LP providers
function calculateAPY(feesEarned24h: number, totalLiquidity: number): number
```

### **Validation**

```typescript
// Validate bet array
function validateBet(bet: number[]): { valid: boolean; error?: string }

// Validate wager amount
function validateWager(
  amount: number,
  minWager: number,
  maxWager: number,
  poolLiquidity: number
): { valid: boolean; error?: string }
```

### **Formatting**

```typescript
// Format token amount
function formatTokenAmount(amount: number, decimals?: number): string

// Format percentage
function formatPercentage(value: number, decimals?: number): string

// Convert BN to number
function bnToNumber(bn: BN, decimals?: number): number

// Convert number to BN
function numberToBN(num: number, decimals?: number): BN
```

### **Random Generation**

```typescript
// Generate random client seed
function generateClientSeed(): string

// Hash seed for deterministic randomness
function hashSeed(seed: string): number
```

---

## 🚨 **Error Handling**

### **Error Classes**

```typescript
class WhiskyError extends Error {
  code: string;
  originalError?: Error;
}

class WhiskyConfigError extends WhiskyError
class WhiskyTransactionError extends WhiskyError
class WhiskyPoolError extends WhiskyError
class WhiskyPlayerError extends WhiskyError
class WhiskyGameError extends WhiskyError
class WhiskyValidationError extends WhiskyError
class WhiskyNetworkError extends WhiskyError
```

### **Error Handling Functions**

```typescript
// Parse and categorize errors
function parseError(error: any): WhiskyError

// Handle async operations with error parsing
function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T>

// Retry with exponential backoff
function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries?: number,
  baseDelay?: number,
  maxDelay?: number
): Promise<T>

// Timeout wrapper
function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  timeoutMessage?: string
): Promise<T>
```

---

## 📊 **Event Types**

### **Game Events**

```typescript
interface GamePlayedEvent {
  player: PublicKey;
  pool: PublicKey;
  game: PublicKey;
  wager: BN;
  bet: number[];
  result: number;
  payout: BN;
  isWin: boolean;
  timestamp: BN;
}
```

### **Liquidity Events**

```typescript
interface LiquidityDepositedEvent {
  depositor: PublicKey;
  pool: PublicKey;
  amount: BN;
  lpTokens: BN;
  timestamp: BN;
}

interface LiquidityWithdrawnEvent {
  withdrawer: PublicKey;
  pool: PublicKey;
  lpTokensBurned: BN;
  amountWithdrawn: BN;
  timestamp: BN;
}
```

### **Pool Events**

```typescript
interface PoolCreatedEvent {
  creator: PublicKey;
  pool: PublicKey;
  tokenMint: PublicKey;
  timestamp: BN;
}
```

---

## 🔗 **Constants**

```typescript
// Program ID
const WHISKY_PROGRAM_ID: PublicKey

// PDA Seeds
const SEEDS: {
  WHISKY_STATE: string;
  POOL: string;
  POOL_LP_MINT: string;
  PLAYER: string;
  GAME: string;
}

// Protocol Limits
const LIMITS: {
  MAX_BASIS_POINTS: number;
  MAX_FEE_BPS: number;
  MAX_HOUSE_EDGE_BPS: number;
  MAX_CREATOR_FEE_BPS: number;
  MIN_POOL_LIQUIDITY: number;
  MAX_BET_OUTCOMES: number;
}

// Default Values
const DEFAULTS: {
  COMMITMENT: Commitment;
  TIMEOUT: number;
  MAX_RETRIES: number;
  WHISKY_FEE_BPS: number;
  POOL_FEE_BPS: number;
  HOUSE_EDGE_BPS: number;
}
```

---

## 📖 **Usage Examples**

### **Complete Game Flow**

```typescript
import { createWhiskyClient, generateClientSeed } from '@whisky-core/sdk';

async function completeGameFlow() {
  // Initialize client
  const client = createWhiskyClient({ connection, wallet, programId });

  // Initialize player
  await client.initializePlayer();

  // Create pool
  const poolTx = await client.createPool({
    tokenMint: solMint,
    poolAuthority: wallet.publicKey
  });

  // Add liquidity
  await client.depositLiquidity({
    pool: poolAddress,
    amount: 1000000000, // 1 SOL
    tokenMint: solMint
  });

  // Place bet
  const result = await client.placeBet({
    pool: poolAddress,
    amount: 100000000, // 0.1 SOL
    bet: [50, 50], // 50-50 odds
    clientSeed: generateClientSeed()
  });

  console.log(`Game result: ${result.isWin ? 'WIN' : 'LOSE'}`);
  console.log(`Payout: ${result.payout}`);
}
```

### **Pool Analytics**

```typescript
async function analyzePool(poolAddress: PublicKey) {
  const stats = await client.getPoolStats(poolAddress);
  
  console.log(`TVL: ${stats.totalValueLocked} SOL`);
  console.log(`24h Volume: ${stats.volume24h} SOL`);
  console.log(`APY: ${stats.apy}%`);
  console.log(`Active Players: ${stats.activePlayers}`);
  console.log(`House Edge: ${stats.houseEdge}%`);
}
```

### **Player Statistics**

```typescript
async function showPlayerStats() {
  const stats = await client.getPlayerStats();
  
  console.log(`Total Games: ${stats.config.totalGames}`);
  console.log(`Win Rate: ${stats.winRate}%`);
  console.log(`Total ROI: ${stats.totalROI}%`);
  console.log(`Avg Bet Size: ${stats.avgBetSize}`);
}
```

---

## 🔗 **Related Documentation**

- [🚀 Quick Start Guide](../quickstart.md)
- [🏦 Pool Management Guide](../guides/create-pools.md)
- [🎮 Game Examples](../examples/casino.md)
- [🔒 Security Best Practices](../guides/security.md)
- [⚡ Performance Optimization](../advanced/optimization.md)

---

**📚 This API reference covers all available functionality in the Whisky Gaming SDK. For more detailed examples and guides, explore the other documentation sections!** 