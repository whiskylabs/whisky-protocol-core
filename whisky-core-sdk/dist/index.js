"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_PROGRAM_VERSION = exports.SDK_VERSION = exports.WhiskyGamingClient = void 0;
exports.createWhiskyClient = createWhiskyClient;
// Core client exports
var client_1 = require("./client");
Object.defineProperty(exports, "WhiskyGamingClient", { enumerable: true, get: function () { return client_1.WhiskyGamingClient; } });
const client_2 = require("./client");
// Type exports
__exportStar(require("./types"), exports);
// Utility exports
__exportStar(require("./utils"), exports);
// Error handling
__exportStar(require("./errors"), exports);
// Version information
exports.SDK_VERSION = '1.0.0';
exports.SUPPORTED_PROGRAM_VERSION = '1.0.0';
// Quick setup helper
function createWhiskyClient(config) {
    return new client_2.WhiskyGamingClient(config);
}
