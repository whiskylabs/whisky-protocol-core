/**
 * Whisky Gaming Protocol SDK
 * 
 * Official TypeScript SDK for interacting with the Whisky Gaming Protocol on Solana.
 * Provides high-level APIs for protocol management, pool operations, and gaming functionality.
 * 
 * @example
 * ```typescript
 * import { WhiskyGamingClient } from '@whisky-gaming/sdk';
 * 
 * const client = new WhiskyGamingClient({
 *   connection,
 *   wallet,
 *   programId: 'Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw'
 * });
 * 
 * // Initialize a player
 * await client.initializePlayer();
 * 
 * // Place a bet
 * const result = await client.placeBet({
 *   pool: poolAddress,
 *   amount: 1000000,
 *   bet: [50, 50] // 50-50 odds
 * });
 * ```
 */

// Core client exports
export { WhiskyGamingClient } from './client';
export { InstructionBuilder } from './instructions';
export { AccountManager } from './accounts';

// Type exports
export * from './types';

// Utility exports
export * from './utils';

// Constants
export * from './constants';

// Error handling
export * from './errors';

// Event parsers
export * from './events';

// Configuration types
export interface WhiskySDKConfig {
  /** Solana RPC connection */
  connection: import('@solana/web3.js').Connection;
  /** Wallet for signing transactions */
  wallet: import('@coral-xyz/anchor').Wallet;
  /** Whisky Gaming program ID */
  programId: string | import('@solana/web3.js').PublicKey;
  /** Optional cluster configuration */
  cluster?: 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';
  /** Optional commitment level */
  commitment?: import('@solana/web3.js').Commitment;
}

// Version information
export const SDK_VERSION = '1.0.0';
export const SUPPORTED_PROGRAM_VERSION = '1.0.0';

// Quick setup helper
export function createWhiskyClient(config: WhiskySDKConfig): WhiskyGamingClient {
  return new WhiskyGamingClient(config);
} 