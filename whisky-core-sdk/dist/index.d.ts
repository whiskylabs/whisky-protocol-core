/**
 * Whisky Gaming Protocol SDK
 *
 * Official TypeScript SDK for interacting with the Whisky Gaming Protocol on Solana.
 * Provides high-level APIs for protocol management, pool operations, and gaming functionality.
 *
 * @example
 * ```typescript
 * import { WhiskyGamingClient, createWhiskyClient } from '@whisky-core/sdk';
 *
 * const client = createWhiskyClient({
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
export { WhiskyGamingClient } from './client';
import { WhiskyGamingClient } from './client';
export * from './types';
export * from './utils';
export * from './errors';
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
    /** Enable debug logging */
    debug?: boolean;
}
export declare const SDK_VERSION = "1.0.0";
export declare const SUPPORTED_PROGRAM_VERSION = "1.0.0";
export declare function createWhiskyClient(config: WhiskySDKConfig): WhiskyGamingClient;
