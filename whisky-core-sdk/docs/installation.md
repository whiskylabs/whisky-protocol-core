# 📖 Installation Guide - Whisky Gaming SDK

**Complete installation and setup guide for the Whisky Gaming Protocol SDK**

---

## 🛠️ **Installation Methods**

### **Method 1: NPM (Recommended)**

```bash
# Install the SDK
npm install @whisky-core/sdk

# Install peer dependencies
npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token

# Optional: Install TypeScript for better development experience
npm install -D typescript @types/node
```

### **Method 2: Yarn**

```bash
# Install the SDK
yarn add @whisky-core/sdk

# Install peer dependencies
yarn add @coral-xyz/anchor @solana/web3.js @solana/spl-token

# Optional: Install TypeScript
yarn add -D typescript @types/node
```

### **Method 3: pnpm**

```bash
# Install the SDK
pnpm add @whisky-core/sdk

# Install peer dependencies
pnpm add @coral-xyz/anchor @solana/web3.js @solana/spl-token

# Optional: Install TypeScript
pnpm add -D typescript @types/node
```

---

## ⚙️ **Environment Setup**

### **1. TypeScript Configuration**

Create `tsconfig.json` in your project root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### **2. Environment Variables**

Create `.env` file for configuration:

```bash
# Solana Network Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Whisky Gaming Protocol
WHISKY_PROGRAM_ID=Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw

# Optional: Custom settings
DEBUG=true
COMMITMENT=confirmed
TIMEOUT=60000
```

### **3. Package.json Scripts**

Add helpful scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

---

## 🔧 **Framework-Specific Setup**

### **React.js / Next.js**

```bash
# Install additional packages for React
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui
npm install @solana/wallet-adapter-wallets

# For Next.js, add to next.config.js:
module.exports = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify'),
      url: require.resolve('url'),
    };
    return config;
  },
};
```

### **Vue.js / Nuxt.js**

```bash
# Install Vue-specific packages
npm install @solana/wallet-adapter-vue

# For Nuxt.js, add to nuxt.config.js:
export default {
  build: {
    extend(config) {
      config.node = {
        fs: 'empty'
      };
    }
  }
};
```

### **Svelte / SvelteKit**

```bash
# Install Svelte-specific packages
npm install @solana/wallet-adapter-svelte

# Add to vite.config.js:
export default {
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
    }
  }
};
```

### **Node.js Backend**

```bash
# Install additional server packages
npm install dotenv cors express

# Example server setup
const express = require('express');
const { createWhiskyClient } = require('@whisky-core/sdk');

const app = express();
const client = createWhiskyClient({ /* config */ });
```

---

## 🌐 **Network Configuration**

### **Devnet (Development)**

```typescript
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { createWhiskyClient } from '@whisky-core/sdk';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const client = createWhiskyClient({
  connection,
  wallet: yourWallet,
  programId: 'Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw',
  cluster: 'devnet'
});
```

### **Mainnet (Production)**

```typescript
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
const client = createWhiskyClient({
  connection,
  wallet: yourWallet,
  programId: 'Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw',
  cluster: 'mainnet-beta'
});
```

### **Custom RPC**

```typescript
const connection = new Connection('https://your-custom-rpc.com', 'confirmed');
const client = createWhiskyClient({
  connection,
  wallet: yourWallet,
  programId: 'Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw'
});
```

---

## 🔐 **Wallet Integration**

### **Phantom Wallet**

```typescript
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const phantom = new PhantomWalletAdapter();
await phantom.connect();

const client = createWhiskyClient({
  connection,
  wallet: phantom,
  programId: 'Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw'
});
```

### **Solflare Wallet**

```typescript
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';

const solflare = new SolflareWalletAdapter();
await solflare.connect();

const client = createWhiskyClient({
  connection,
  wallet: solflare,
  programId: 'Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw'
});
```

### **Custom Wallet**

```typescript
import { Keypair } from '@solana/web3.js';

// For testing/development only
const keypair = Keypair.generate();
const wallet = {
  publicKey: keypair.publicKey,
  signTransaction: async (tx) => {
    tx.partialSign(keypair);
    return tx;
  },
  signAllTransactions: async (txs) => {
    txs.forEach(tx => tx.partialSign(keypair));
    return txs;
  }
};
```

---

## 🧪 **Testing Setup**

### **Jest Configuration**

```bash
# Install testing dependencies
npm install -D jest @types/jest ts-jest

# Create jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
```

### **Basic Test Example**

```typescript
import { createWhiskyClient } from '@whisky-core/sdk';
import { Connection, clusterApiUrl } from '@solana/web3.js';

describe('Whisky SDK', () => {
  let client;

  beforeAll(async () => {
    const connection = new Connection(clusterApiUrl('devnet'));
    client = createWhiskyClient({
      connection,
      wallet: mockWallet,
      programId: 'Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw'
    });
  });

  test('should initialize client', () => {
    expect(client).toBeDefined();
  });
});
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Issue: Module not found**
```bash
# Solution: Install missing peer dependencies
npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token
```

#### **Issue: TypeScript errors**
```bash
# Solution: Install type definitions
npm install -D @types/node @types/bn.js
```

#### **Issue: Webpack/bundler errors**
```javascript
// Solution: Add to webpack config
module.exports = {
  resolve: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    }
  }
};
```

#### **Issue: Connection timeout**
```typescript
// Solution: Increase timeout
const client = createWhiskyClient({
  connection,
  wallet,
  programId: 'Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw',
  commitment: 'confirmed',
  timeout: 120000 // 2 minutes
});
```

### **Debug Mode**

```typescript
const client = createWhiskyClient({
  connection,
  wallet,
  programId: 'Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw',
  debug: true // Enable debug logging
});
```

---

## ✅ **Verification**

### **Quick Verification Script**

Create `verify.js` to test your installation:

```javascript
const { createWhiskyClient } = require('@whisky-core/sdk');
const { Connection, clusterApiUrl, PublicKey } = require('@solana/web3.js');

async function verify() {
  try {
    console.log('🔧 Verifying Whisky SDK installation...');
    
    const connection = new Connection(clusterApiUrl('devnet'));
    console.log('✅ Connection created');
    
    const programId = new PublicKey('Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw');
    console.log('✅ Program ID verified');
    
    console.log('🎉 Installation verified successfully!');
    console.log('📖 Next: Read the Quick Start guide');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verify();
```

Run verification:
```bash
node verify.js
```

---

## 🔗 **Next Steps**

After successful installation:

1. **📚 Read the [Quick Start Guide](./quickstart.md)**
2. **🎮 Try the [Examples](./examples/casino.md)**
3. **📖 Explore the [API Reference](./api/README.md)**
4. **💬 Join our [Discord Community](https://discord.gg/whisky-gaming)**

---

## 📞 **Need Help?**

- 📧 **Email**: [dev@whisky.game](mailto:dev@whisky.game)
- 💬 **Discord**: [Join our community](https://discord.gg/whisky-gaming)
- 🐛 **Issues**: [GitHub Issues](https://github.com/whisky-gaming/sdk/issues)
- 📖 **Documentation**: [Complete Docs](./README.md)

---

**🎮 Ready to build the future of gaming on Solana? Let's go! 🚀** 