"use strict";
/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL SDK
 * ============================================================================
 *
 * Official TypeScript SDK for interacting with the Whisky Gaming Protocol on Solana.
 * Provides high-level APIs for protocol management, pool operations, and gaming functionality.
 *
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
exports.createWhiskyClient = exports.SUPPORTED_PROGRAM_VERSION = exports.SDK_VERSION = exports.parseProgramError = exports.generateClientSeed = exports.validateBet = exports.calculateExpectedPayout = exports.calculateWithdrawAmount = exports.calculateLpTokens = exports.getPoolTokenAccount = exports.getUserTokenAccount = exports.deriveGamePDA = exports.derivePlayerPDA = exports.derivePoolLpMintPDA = exports.derivePoolPDA = exports.deriveWhiskyStatePDA = exports.WhiskyGamingClient = void 0;
// Export the working stub client (compiles without errors)
var client_stub_1 = require("./client-stub");
Object.defineProperty(exports, "WhiskyGamingClient", { enumerable: true, get: function () { return client_stub_1.WhiskyGamingClient; } });
// Export types
__exportStar(require("./types"), exports);
// Export utilities (excluding conflicting exports)
var utils_1 = require("./utils");
Object.defineProperty(exports, "deriveWhiskyStatePDA", { enumerable: true, get: function () { return utils_1.deriveWhiskyStatePDA; } });
Object.defineProperty(exports, "derivePoolPDA", { enumerable: true, get: function () { return utils_1.derivePoolPDA; } });
Object.defineProperty(exports, "derivePoolLpMintPDA", { enumerable: true, get: function () { return utils_1.derivePoolLpMintPDA; } });
Object.defineProperty(exports, "derivePlayerPDA", { enumerable: true, get: function () { return utils_1.derivePlayerPDA; } });
Object.defineProperty(exports, "deriveGamePDA", { enumerable: true, get: function () { return utils_1.deriveGamePDA; } });
Object.defineProperty(exports, "getUserTokenAccount", { enumerable: true, get: function () { return utils_1.getUserTokenAccount; } });
Object.defineProperty(exports, "getPoolTokenAccount", { enumerable: true, get: function () { return utils_1.getPoolTokenAccount; } });
Object.defineProperty(exports, "calculateLpTokens", { enumerable: true, get: function () { return utils_1.calculateLpTokens; } });
Object.defineProperty(exports, "calculateWithdrawAmount", { enumerable: true, get: function () { return utils_1.calculateWithdrawAmount; } });
Object.defineProperty(exports, "calculateExpectedPayout", { enumerable: true, get: function () { return utils_1.calculateExpectedPayout; } });
Object.defineProperty(exports, "validateBet", { enumerable: true, get: function () { return utils_1.validateBet; } });
Object.defineProperty(exports, "generateClientSeed", { enumerable: true, get: function () { return utils_1.generateClientSeed; } });
Object.defineProperty(exports, "parseProgramError", { enumerable: true, get: function () { return utils_1.parseProgramError; } });
// Export constants
__exportStar(require("./constants"), exports);
// Export errors
__exportStar(require("./errors"), exports);
// Version information
exports.SDK_VERSION = '1.0.0';
exports.SUPPORTED_PROGRAM_VERSION = '1.0.0';
// Helper function to create a client
const client_stub_2 = require("./client-stub");
function createWhiskyClient(config, options) {
    return new client_stub_2.WhiskyGamingClient(config, options);
}
exports.createWhiskyClient = createWhiskyClient;
