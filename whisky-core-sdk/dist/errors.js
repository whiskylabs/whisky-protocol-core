"use strict";
/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - ERROR HANDLING 🚨
 * ============================================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTimeout = exports.retryWithBackoff = exports.validateArrayLength = exports.validatePositive = exports.validateRange = exports.validateRequired = exports.handleAsyncOperation = exports.parseError = exports.ERROR_MESSAGES = exports.WhiskyNetworkError = exports.WhiskyValidationError = exports.WhiskyGameError = exports.WhiskyPlayerError = exports.WhiskyPoolError = exports.WhiskyTransactionError = exports.WhiskyConfigError = exports.WhiskyError = void 0;
// ================================
// CUSTOM ERROR CLASSES
// ================================
/**
 * Base Whisky SDK Error
 */
class WhiskyError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', originalError) {
        super(message);
        this.name = 'WhiskyError';
        this.code = code;
        this.originalError = originalError;
    }
}
exports.WhiskyError = WhiskyError;
/**
 * Configuration and Protocol Errors
 */
class WhiskyConfigError extends WhiskyError {
    constructor(message, originalError) {
        super(message, 'CONFIG_ERROR', originalError);
        this.name = 'WhiskyConfigError';
    }
}
exports.WhiskyConfigError = WhiskyConfigError;
/**
 * Transaction related errors
 */
class WhiskyTransactionError extends WhiskyError {
    constructor(message, txSignature, originalError) {
        super(message, 'TRANSACTION_ERROR', originalError);
        this.name = 'WhiskyTransactionError';
        this.txSignature = txSignature;
    }
}
exports.WhiskyTransactionError = WhiskyTransactionError;
/**
 * Pool-related Errors
 */
class WhiskyPoolError extends WhiskyError {
    constructor(message, originalError) {
        super(message, 'POOL_ERROR', originalError);
        this.name = 'WhiskyPoolError';
    }
}
exports.WhiskyPoolError = WhiskyPoolError;
/**
 * Player related errors
 */
class WhiskyPlayerError extends WhiskyError {
    constructor(message, originalError) {
        super(message, 'PLAYER_ERROR', originalError);
        this.name = 'WhiskyPlayerError';
    }
}
exports.WhiskyPlayerError = WhiskyPlayerError;
/**
 * Game-related Errors
 */
class WhiskyGameError extends WhiskyError {
    constructor(message, originalError) {
        super(message, 'GAME_ERROR', originalError);
        this.name = 'WhiskyGameError';
    }
}
exports.WhiskyGameError = WhiskyGameError;
/**
 * Validation related errors
 */
class WhiskyValidationError extends WhiskyError {
    constructor(message, field, value, originalError) {
        super(message, 'VALIDATION_ERROR', originalError);
        this.name = 'WhiskyValidationError';
        this.field = field;
        this.value = value;
    }
}
exports.WhiskyValidationError = WhiskyValidationError;
/**
 * Network related errors
 */
class WhiskyNetworkError extends WhiskyError {
    constructor(message, originalError) {
        super(message, 'NETWORK_ERROR', originalError);
        this.name = 'WhiskyNetworkError';
    }
}
exports.WhiskyNetworkError = WhiskyNetworkError;
// ================================
// ERROR MESSAGES
// ================================
exports.ERROR_MESSAGES = {
    // Configuration errors
    INVALID_PROGRAM_ID: 'Invalid program ID provided',
    INVALID_CONNECTION: 'Invalid Solana connection provided',
    INVALID_WALLET: 'Invalid wallet provided',
    MISSING_CONFIG: 'Required configuration missing',
    // Pool errors
    POOL_NOT_FOUND: 'Pool not found or does not exist',
    POOL_INACTIVE: 'Pool is not active',
    INSUFFICIENT_POOL_LIQUIDITY: 'Insufficient pool liquidity',
    POOL_ALREADY_EXISTS: 'Pool already exists',
    INVALID_POOL_AUTHORITY: 'Invalid pool authority',
    // Player errors
    PLAYER_NOT_INITIALIZED: 'Player account not initialized',
    PLAYER_ALREADY_EXISTS: 'Player account already exists',
    UNAUTHORIZED_PLAYER: 'Unauthorized player action',
    // Game errors
    INVALID_GAME_STATE: 'Invalid game state',
    GAME_NOT_FOUND: 'Game not found',
    GAME_ALREADY_SETTLED: 'Game already settled',
    NO_ACTIVE_GAME: 'No active game found',
    // Bet validation errors
    INVALID_BET_ARRAY: 'Invalid bet array provided',
    EMPTY_BET_ARRAY: 'Bet array cannot be empty',
    NEGATIVE_BET_WEIGHT: 'Bet weights cannot be negative',
    ZERO_TOTAL_WEIGHT: 'Total bet weight cannot be zero',
    TOO_MANY_OUTCOMES: 'Too many bet outcomes',
    // Wager validation errors
    INVALID_WAGER_AMOUNT: 'Invalid wager amount',
    WAGER_TOO_LOW: 'Wager amount below minimum',
    WAGER_TOO_HIGH: 'Wager amount above maximum',
    INSUFFICIENT_BALANCE: 'Insufficient balance for wager',
    // Transaction errors
    TRANSACTION_FAILED: 'Transaction failed',
    TRANSACTION_TIMEOUT: 'Transaction timed out',
    INSUFFICIENT_SOL: 'Insufficient SOL for transaction fees',
    ACCOUNT_NOT_FOUND: 'Required account not found',
    // Network errors
    CONNECTION_FAILED: 'Failed to connect to Solana network',
    RPC_ERROR: 'RPC endpoint error',
    NETWORK_TIMEOUT: 'Network request timed out',
    // Generic errors
    UNKNOWN_ERROR: 'An unknown error occurred',
    OPERATION_CANCELLED: 'Operation was cancelled',
    FEATURE_NOT_IMPLEMENTED: 'Feature not yet implemented',
};
// ================================
// ERROR HANDLERS
// ================================
/**
 * Parse and categorize Anchor/Solana errors
 */
function parseError(error) {
    if (error instanceof WhiskyError) {
        return error;
    }
    const message = error?.message || 'Unknown error';
    const originalError = error instanceof Error ? error : new Error(String(error));
    // Check for specific Anchor error codes
    if (message.includes('0x1770')) {
        return new WhiskyTransactionError(exports.ERROR_MESSAGES.INSUFFICIENT_BALANCE, undefined, originalError);
    }
    if (message.includes('0x1771')) {
        return new WhiskyValidationError(exports.ERROR_MESSAGES.INVALID_BET_ARRAY, undefined, undefined, originalError);
    }
    if (message.includes('0x1772')) {
        return new WhiskyPoolError(exports.ERROR_MESSAGES.POOL_NOT_FOUND, originalError);
    }
    if (message.includes('0x1773')) {
        return new WhiskyPlayerError(exports.ERROR_MESSAGES.PLAYER_NOT_INITIALIZED, originalError);
    }
    if (message.includes('0x1774')) {
        return new WhiskyGameError(exports.ERROR_MESSAGES.INVALID_GAME_STATE, originalError);
    }
    // Check for transaction signature in error
    const txMatch = message.match(/Transaction signature: ([A-Za-z0-9]+)/);
    if (txMatch) {
        return new WhiskyTransactionError(message, txMatch[1], originalError);
    }
    // Check for common Solana errors
    if (message.includes('Transaction was not confirmed')) {
        return new WhiskyTransactionError(exports.ERROR_MESSAGES.TRANSACTION_TIMEOUT, undefined, originalError);
    }
    if (message.includes('Insufficient funds')) {
        return new WhiskyTransactionError(exports.ERROR_MESSAGES.INSUFFICIENT_SOL, undefined, originalError);
    }
    if (message.includes('Account not found')) {
        return new WhiskyTransactionError(exports.ERROR_MESSAGES.ACCOUNT_NOT_FOUND, undefined, originalError);
    }
    if (message.includes('Connection refused') || message.includes('Network error')) {
        return new WhiskyNetworkError(exports.ERROR_MESSAGES.CONNECTION_FAILED, originalError);
    }
    // Default to generic error
    return new WhiskyError(message, 'UNKNOWN_ERROR', originalError);
}
exports.parseError = parseError;
/**
 * Handle async operations with proper error parsing
 */
async function handleAsyncOperation(operation, context) {
    try {
        return await operation();
    }
    catch (error) {
        const parsedError = parseError(error);
        if (context) {
            parsedError.message = `${context}: ${parsedError.message}`;
        }
        throw parsedError;
    }
}
exports.handleAsyncOperation = handleAsyncOperation;
/**
 * Validate required parameters
 */
function validateRequired(value, fieldName) {
    if (value === null || value === undefined) {
        throw new WhiskyValidationError(`${fieldName} is required`, fieldName, value);
    }
    return value;
}
exports.validateRequired = validateRequired;
/**
 * Validate number range
 */
function validateRange(value, min, max, fieldName) {
    if (value < min || value > max) {
        throw new WhiskyValidationError(`${fieldName} must be between ${min} and ${max}`, fieldName, value);
    }
    return value;
}
exports.validateRange = validateRange;
/**
 * Validate positive number
 */
function validatePositive(value, fieldName) {
    if (value <= 0) {
        throw new WhiskyValidationError(`${fieldName} must be positive`, fieldName, value);
    }
    return value;
}
exports.validatePositive = validatePositive;
/**
 * Validate array length
 */
function validateArrayLength(array, minLength, maxLength, fieldName) {
    if (array.length < minLength || array.length > maxLength) {
        throw new WhiskyValidationError(`${fieldName} length must be between ${minLength} and ${maxLength}`, fieldName, array);
    }
    return array;
}
exports.validateArrayLength = validateArrayLength;
// ================================
// ERROR RECOVERY
// ================================
/**
 * Retry operation with exponential backoff
 */
async function retryWithBackoff(operation, maxRetries = 3, baseDelay = 1000, maxDelay = 10000) {
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            // Don't retry on validation errors
            if (error instanceof WhiskyValidationError) {
                throw error;
            }
            // Don't retry on the last attempt
            if (attempt === maxRetries - 1) {
                break;
            }
            // Calculate delay with exponential backoff
            const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new WhiskyError(`Operation failed after ${maxRetries} attempts: ${lastError.message}`, 'RETRY_EXHAUSTED', lastError);
}
exports.retryWithBackoff = retryWithBackoff;
/**
 * Timeout wrapper for operations
 */
async function withTimeout(operation, timeoutMs, timeoutMessage = 'Operation timed out') {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new WhiskyError(timeoutMessage, 'TIMEOUT'));
        }, timeoutMs);
    });
    return Promise.race([operation, timeoutPromise]);
}
exports.withTimeout = withTimeout;
