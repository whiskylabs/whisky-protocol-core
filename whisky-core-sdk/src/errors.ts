/**
 * ============================================================================
 * 🥃 WHISKY GAMING PROTOCOL - ERROR HANDLING 🚨
 * ============================================================================
 */

// ================================
// CUSTOM ERROR CLASSES
// ================================

/**
 * Base Whisky SDK Error
 */
export class WhiskyError extends Error {
  public code: string;
  public originalError?: Error;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', originalError?: Error) {
    super(message);
    this.name = 'WhiskyError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Configuration and Protocol Errors
 */
export class WhiskyConfigError extends WhiskyError {
  constructor(message: string, originalError?: Error) {
    super(message, 'CONFIG_ERROR', originalError);
    this.name = 'WhiskyConfigError';
  }
}

/**
 * Transaction related errors
 */
export class WhiskyTransactionError extends WhiskyError {
  public readonly txSignature?: string;

  constructor(message: string, txSignature?: string, originalError?: Error) {
    super(message, 'TRANSACTION_ERROR', originalError);
    this.name = 'WhiskyTransactionError';
    this.txSignature = txSignature;
  }
}

/**
 * Pool-related Errors
 */
export class WhiskyPoolError extends WhiskyError {
  constructor(message: string, originalError?: Error) {
    super(message, 'POOL_ERROR', originalError);
    this.name = 'WhiskyPoolError';
  }
}

/**
 * Player related errors
 */
export class WhiskyPlayerError extends WhiskyError {
  constructor(message: string, originalError?: Error) {
    super(message, 'PLAYER_ERROR', originalError);
    this.name = 'WhiskyPlayerError';
  }
}

/**
 * Game-related Errors
 */
export class WhiskyGameError extends WhiskyError {
  constructor(message: string, originalError?: Error) {
    super(message, 'GAME_ERROR', originalError);
    this.name = 'WhiskyGameError';
  }
}

/**
 * Validation related errors
 */
export class WhiskyValidationError extends WhiskyError {
  public readonly field?: string;
  public readonly value?: any;

  constructor(message: string, field?: string, value?: any, originalError?: Error) {
    super(message, 'VALIDATION_ERROR', originalError);
    this.name = 'WhiskyValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Network related errors
 */
export class WhiskyNetworkError extends WhiskyError {
  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR', originalError);
    this.name = 'WhiskyNetworkError';
  }
}

// ================================
// ERROR MESSAGES
// ================================

export const ERROR_MESSAGES = {
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
} as const;

// ================================
// ERROR HANDLERS
// ================================

/**
 * Parse and categorize Anchor/Solana errors
 */
export function parseError(error: any): WhiskyError {
  if (error instanceof WhiskyError) {
    return error;
  }

  const message = error?.message || 'Unknown error';
  const originalError = error instanceof Error ? error : new Error(String(error));

  // Check for specific Anchor error codes
  if (message.includes('0x1770')) {
    return new WhiskyTransactionError(ERROR_MESSAGES.INSUFFICIENT_BALANCE, undefined, originalError);
  }

  if (message.includes('0x1771')) {
    return new WhiskyValidationError(ERROR_MESSAGES.INVALID_BET_ARRAY, undefined, undefined, originalError);
  }

  if (message.includes('0x1772')) {
    return new WhiskyPoolError(ERROR_MESSAGES.POOL_NOT_FOUND, originalError);
  }

  if (message.includes('0x1773')) {
    return new WhiskyPlayerError(ERROR_MESSAGES.PLAYER_NOT_INITIALIZED, originalError);
  }

  if (message.includes('0x1774')) {
    return new WhiskyGameError(ERROR_MESSAGES.INVALID_GAME_STATE, originalError);
  }

  // Check for transaction signature in error
  const txMatch = message.match(/Transaction signature: ([A-Za-z0-9]+)/);
  if (txMatch) {
    return new WhiskyTransactionError(message, txMatch[1], originalError);
  }

  // Check for common Solana errors
  if (message.includes('Transaction was not confirmed')) {
    return new WhiskyTransactionError(ERROR_MESSAGES.TRANSACTION_TIMEOUT, undefined, originalError);
  }

  if (message.includes('Insufficient funds')) {
    return new WhiskyTransactionError(ERROR_MESSAGES.INSUFFICIENT_SOL, undefined, originalError);
  }

  if (message.includes('Account not found')) {
    return new WhiskyTransactionError(ERROR_MESSAGES.ACCOUNT_NOT_FOUND, undefined, originalError);
  }

  if (message.includes('Connection refused') || message.includes('Network error')) {
    return new WhiskyNetworkError(ERROR_MESSAGES.CONNECTION_FAILED, originalError);
  }

  // Default to generic error
  return new WhiskyError(message, 'UNKNOWN_ERROR', originalError);
}

/**
 * Handle async operations with proper error parsing
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const parsedError = parseError(error);
    if (context) {
      parsedError.message = `${context}: ${parsedError.message}`;
    }
    throw parsedError;
  }
}

/**
 * Validate required parameters
 */
export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string
): T {
  if (value === null || value === undefined) {
    throw new WhiskyValidationError(
      `${fieldName} is required`,
      fieldName,
      value
    );
  }
  return value;
}

/**
 * Validate number range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): number {
  if (value < min || value > max) {
    throw new WhiskyValidationError(
      `${fieldName} must be between ${min} and ${max}`,
      fieldName,
      value
    );
  }
  return value;
}

/**
 * Validate positive number
 */
export function validatePositive(value: number, fieldName: string): number {
  if (value <= 0) {
    throw new WhiskyValidationError(
      `${fieldName} must be positive`,
      fieldName,
      value
    );
  }
  return value;
}

/**
 * Validate array length
 */
export function validateArrayLength<T>(
  array: T[],
  minLength: number,
  maxLength: number,
  fieldName: string
): T[] {
  if (array.length < minLength || array.length > maxLength) {
    throw new WhiskyValidationError(
      `${fieldName} length must be between ${minLength} and ${maxLength}`,
      fieldName,
      array
    );
  }
  return array;
}

// ================================
// ERROR RECOVERY
// ================================

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
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

  throw new WhiskyError(
    `Operation failed after ${maxRetries} attempts: ${lastError!.message}`,
    'RETRY_EXHAUSTED',
    lastError!
  );
}

/**
 * Timeout wrapper for operations
 */
export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new WhiskyError(timeoutMessage, 'TIMEOUT'));
    }, timeoutMs);
  });

  return Promise.race([operation, timeoutPromise]);
} 