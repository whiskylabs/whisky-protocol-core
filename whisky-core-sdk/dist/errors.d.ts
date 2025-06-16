/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - ERROR HANDLING 🚨
 * ============================================================================
 */
/**
 * Base error class for Whisky Gaming Protocol
 */
export declare class WhiskyError extends Error {
    readonly code: string;
    readonly originalError?: Error;
    constructor(message: string, code?: string, originalError?: Error);
}
/**
 * Configuration related errors
 */
export declare class WhiskyConfigError extends WhiskyError {
    constructor(message: string, originalError?: Error);
}
/**
 * Transaction related errors
 */
export declare class WhiskyTransactionError extends WhiskyError {
    readonly txSignature?: string;
    constructor(message: string, txSignature?: string, originalError?: Error);
}
/**
 * Pool related errors
 */
export declare class WhiskyPoolError extends WhiskyError {
    constructor(message: string, originalError?: Error);
}
/**
 * Player related errors
 */
export declare class WhiskyPlayerError extends WhiskyError {
    constructor(message: string, originalError?: Error);
}
/**
 * Game related errors
 */
export declare class WhiskyGameError extends WhiskyError {
    constructor(message: string, originalError?: Error);
}
/**
 * Validation related errors
 */
export declare class WhiskyValidationError extends WhiskyError {
    readonly field?: string;
    readonly value?: any;
    constructor(message: string, field?: string, value?: any, originalError?: Error);
}
/**
 * Network related errors
 */
export declare class WhiskyNetworkError extends WhiskyError {
    constructor(message: string, originalError?: Error);
}
export declare const ERROR_MESSAGES: {
    readonly INVALID_PROGRAM_ID: "Invalid program ID provided";
    readonly INVALID_CONNECTION: "Invalid Solana connection provided";
    readonly INVALID_WALLET: "Invalid wallet provided";
    readonly MISSING_CONFIG: "Required configuration missing";
    readonly POOL_NOT_FOUND: "Pool not found or does not exist";
    readonly POOL_INACTIVE: "Pool is not active";
    readonly INSUFFICIENT_POOL_LIQUIDITY: "Insufficient pool liquidity";
    readonly POOL_ALREADY_EXISTS: "Pool already exists";
    readonly INVALID_POOL_AUTHORITY: "Invalid pool authority";
    readonly PLAYER_NOT_INITIALIZED: "Player account not initialized";
    readonly PLAYER_ALREADY_EXISTS: "Player account already exists";
    readonly UNAUTHORIZED_PLAYER: "Unauthorized player action";
    readonly INVALID_GAME_STATE: "Invalid game state";
    readonly GAME_NOT_FOUND: "Game not found";
    readonly GAME_ALREADY_SETTLED: "Game already settled";
    readonly NO_ACTIVE_GAME: "No active game found";
    readonly INVALID_BET_ARRAY: "Invalid bet array provided";
    readonly EMPTY_BET_ARRAY: "Bet array cannot be empty";
    readonly NEGATIVE_BET_WEIGHT: "Bet weights cannot be negative";
    readonly ZERO_TOTAL_WEIGHT: "Total bet weight cannot be zero";
    readonly TOO_MANY_OUTCOMES: "Too many bet outcomes";
    readonly INVALID_WAGER_AMOUNT: "Invalid wager amount";
    readonly WAGER_TOO_LOW: "Wager amount below minimum";
    readonly WAGER_TOO_HIGH: "Wager amount above maximum";
    readonly INSUFFICIENT_BALANCE: "Insufficient balance for wager";
    readonly TRANSACTION_FAILED: "Transaction failed";
    readonly TRANSACTION_TIMEOUT: "Transaction timed out";
    readonly INSUFFICIENT_SOL: "Insufficient SOL for transaction fees";
    readonly ACCOUNT_NOT_FOUND: "Required account not found";
    readonly CONNECTION_FAILED: "Failed to connect to Solana network";
    readonly RPC_ERROR: "RPC endpoint error";
    readonly NETWORK_TIMEOUT: "Network request timed out";
    readonly UNKNOWN_ERROR: "An unknown error occurred";
    readonly OPERATION_CANCELLED: "Operation was cancelled";
    readonly FEATURE_NOT_IMPLEMENTED: "Feature not yet implemented";
};
/**
 * Parse and categorize Anchor/Solana errors
 */
export declare function parseError(error: any): WhiskyError;
/**
 * Handle async operations with proper error parsing
 */
export declare function handleAsyncOperation<T>(operation: () => Promise<T>, context?: string): Promise<T>;
/**
 * Validate required parameters
 */
export declare function validateRequired<T>(value: T | null | undefined, fieldName: string): T;
/**
 * Validate number range
 */
export declare function validateRange(value: number, min: number, max: number, fieldName: string): number;
/**
 * Validate positive number
 */
export declare function validatePositive(value: number, fieldName: string): number;
/**
 * Validate array length
 */
export declare function validateArrayLength<T>(array: T[], minLength: number, maxLength: number, fieldName: string): T[];
/**
 * Retry operation with exponential backoff
 */
export declare function retryWithBackoff<T>(operation: () => Promise<T>, maxRetries?: number, baseDelay?: number, maxDelay?: number): Promise<T>;
/**
 * Timeout wrapper for operations
 */
export declare function withTimeout<T>(operation: Promise<T>, timeoutMs: number, timeoutMessage?: string): Promise<T>;
