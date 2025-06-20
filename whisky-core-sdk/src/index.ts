/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL SDK
 * ============================================================================
 * 
 * Official TypeScript SDK for interacting with the Whisky Gaming Protocol on Solana.
 * Provides high-level APIs for protocol management, pool operations, and gaming functionality.
 * 
 */

// Export the working stub client (compiles without errors)
export { WhiskyGamingClient } from './client-stub';

// Complete API reference
export { WhiskyGamingAPI } from './api-reference';

// Export types
export * from './types';

// Export utilities (excluding conflicting exports)
export {
  deriveWhiskyStatePDA,
  derivePoolPDA,
  derivePoolLpMintPDA,
  derivePlayerPDA,
  deriveGamePDA,
  getUserTokenAccount,
  getPoolTokenAccount,
  calculateLpTokens,
  calculateWithdrawAmount,
  calculateExpectedPayout,
  validateBet,
  generateClientSeed,
  parseProgramError
} from './utils';

// Export constants
export * from './constants';

// Export errors
export * from './errors';

// Version information
export const SDK_VERSION = '1.0.0';
export const SUPPORTED_PROGRAM_VERSION = '1.0.0';

// Helper function to create a client
import { WhiskyGamingClient } from './client-stub';
import type { WhiskySDKConfig as ClientConfig, SDKOptions as ClientOptions } from './types';

export function createWhiskyClient(config: ClientConfig, options?: ClientOptions): WhiskyGamingClient {
  return new WhiskyGamingClient(config, options);
}

// Re-export commonly used types from dependencies
export type { PublicKey, Connection, Keypair, Transaction } from '@solana/web3.js';
export type { BN } from 'bn.js';
export type { Wallet } from '@coral-xyz/anchor'; 