use anchor_lang::prelude::*;

#[error_code]
pub enum WhiskyError {
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid configuration")]
    InvalidConfiguration,
    #[msg("Operation not allowed")]
    OperationNotAllowed,
    #[msg("Invalid program state")]
    InvalidProgramState,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Invalid account")]
    InvalidAccount,
    #[msg("Account already initialized")]
    AlreadyInitialized,
    #[msg("Account not initialized")]
    NotInitialized,
}

#[error_code]
pub enum PlayerError {
    #[msg("Player not ready to play")]
    NotReadyToPlay,
    #[msg("Game already in progress")]
    GameInProgress,
    #[msg("Invalid nonce")]
    InvalidNonce,
    #[msg("Player account not found")]
    PlayerNotFound,
    #[msg("Game account not found")]
    GameNotFound,
    #[msg("Invalid game state")]
    InvalidGameState,
    #[msg("Cannot claim at this time")]
    CannotClaim,
    #[msg("No winnings to claim")]
    NoWinningsToClaim,
}

#[error_code]
pub enum RngError {
    #[msg("Invalid RNG authority")]
    InvalidRngAuthority,
    #[msg("RNG result not requested")]
    ResultNotRequested,
    #[msg("RNG result already provided")]
    ResultAlreadyProvided,
    #[msg("Invalid RNG seed")]
    InvalidRngSeed,
    #[msg("RNG seed hash mismatch")]
    SeedHashMismatch,
    #[msg("RNG timeout")]
    RngTimeout,
    #[msg("Invalid client seed")]
    InvalidClientSeed,
}

#[error_code]
pub enum PoolError {
    #[msg("Pool not found")]
    PoolNotFound,
    #[msg("Insufficient pool liquidity")]
    InsufficientLiquidity,
    #[msg("Pool is paused")]
    PoolPaused,
    #[msg("Invalid pool authority")]
    InvalidPoolAuthority,
    #[msg("Pool configuration error")]
    PoolConfigError,
    #[msg("Deposit limit exceeded")]
    DepositLimitExceeded,
    #[msg("Withdrawal limit exceeded")]
    WithdrawalLimitExceeded,
    #[msg("Pool already exists")]
    PoolAlreadyExists,
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    #[msg("Pool not whitelisted")]
    NotWhitelisted,
}

#[error_code]
pub enum GameError {
    #[msg("Invalid bet configuration")]
    InvalidBet,
    #[msg("Bet weights must sum to positive value")]
    InvalidBetWeights,
    #[msg("Too many bet outcomes")]
    TooManyOutcomes,
    #[msg("Too few bet outcomes")]
    TooFewOutcomes,
    #[msg("Wager below minimum")]
    WagerTooLow,
    #[msg("Wager above maximum")]
    WagerTooHigh,
    #[msg("Invalid house edge")]
    InvalidHouseEdge,
    #[msg("Max payout exceeded")]
    MaxPayoutExceeded,
    #[msg("Invalid creator fee")]
    InvalidCreatorFee,
    #[msg("Invalid jackpot fee")]
    InvalidJackpotFee,
    #[msg("Game result timeout")]
    GameTimeout,
    #[msg("Invalid game metadata")]
    InvalidMetadata,
}

#[error_code]
pub enum WhiskyStateError {
    #[msg("Pool creation not allowed")]
    PoolCreationNotAllowed,
    #[msg("Pool deposits not allowed")]
    DepositNotAllowed,
    #[msg("Pool withdrawals not allowed")]
    WithdrawalNotAllowed,
    #[msg("Playing not allowed")]
    PlaysNotAllowed,
    #[msg("Invalid fee configuration")]
    InvalidFeeConfig,
    #[msg("Protocol is paused")]
    ProtocolPaused,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Configuration locked")]
    ConfigurationLocked,
} 