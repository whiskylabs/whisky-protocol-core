/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL SDK
 * ============================================================================
 *
 * Official TypeScript SDK for interacting with the Whisky Gaming Protocol on Solana.
 * Provides high-level APIs for protocol management, pool operations, and gaming functionality.
 *
 */
export { WhiskyGamingClient } from './client-stub';
export { WhiskyGamingAPI } from './api-reference';
export * from './types';
export { deriveWhiskyStatePDA, derivePoolPDA, derivePoolLpMintPDA, derivePlayerPDA, deriveGamePDA, getUserTokenAccount, getPoolTokenAccount, calculateLpTokens, calculateWithdrawAmount, calculateExpectedPayout, validateBet, generateClientSeed, parseProgramError } from './utils';
export * from './constants';
export * from './errors';
export declare const SDK_VERSION = "1.0.0";
export declare const SUPPORTED_PROGRAM_VERSION = "1.0.0";
import { WhiskyGamingClient } from './client-stub';
import type { WhiskySDKConfig as ClientConfig, SDKOptions as ClientOptions } from './types';
export declare function createWhiskyClient(config: ClientConfig, options?: ClientOptions): WhiskyGamingClient;
export type { PublicKey, Connection, Keypair, Transaction } from '@solana/web3.js';
export type { BN } from 'bn.js';
export type { Wallet } from '@coral-xyz/anchor';
