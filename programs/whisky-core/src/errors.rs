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
    #[msg("Invalid instruction")]
    InvalidInstruction,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Token transfer failed")]
    TokenTransferFailed,
    #[msg("Invalid signature")]
    InvalidSignature,
    #[msg("Calculation error")]
    CalculationError,
    #[msg("Account not initialized")]
    AccountNotInitialized,
    #[msg("Account already initialized")]
    AccountAlreadyInitialized,
    #[msg("Insufficient balance")]
    InsufficientBalance,
}

#[error_code]
pub enum WhiskyStateError {
    #[msg("Pool creation not allowed")]
    PoolCreationNotAllowed,
    #[msg("Pool deposit not allowed")]
    DepositNotAllowed,
    #[msg("Pool withdrawal not allowed")]
    WithdrawalNotAllowed,
    #[msg("Playing not allowed")]
    PlaysNotAllowed,
    #[msg("Invalid fee configuration")]
    InvalidFeeConfiguration,
    #[msg("Feature disabled")]
    FeatureDisabled,
    #[msg("Configuration out of bounds")]
    ConfigurationOutOfBounds,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Protocol paused")]
    ProtocolPaused,
    #[msg("Invalid parameter")]
    InvalidParameter,
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
    #[msg("Player not initialized")]
    PlayerNotInitialized,
    #[msg("Player already initialized")]
    PlayerAlreadyInitialized,
    #[msg("Invalid player state")]
    InvalidPlayerState,
    #[msg("Anti-spam fee required")]
    AntiSpamFeeRequired,
    #[msg("Nonce mismatch")]
    NonceMismatch,
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
    #[msg("Invalid RNG provider")]
    InvalidRngProvider,
    #[msg("Hash verification failed")]
    HashVerificationFailed,
    #[msg("Duplicate settlement")]
    DuplicateSettlement,
}

#[error_code]
pub enum GameError {
    #[msg("Too few bet outcomes")]
    TooFewOutcomes,
    #[msg("Too many bet outcomes")]
    TooManyOutcomes,
    #[msg("Invalid bet weights")]
    InvalidBetWeights,
    #[msg("Wager amount too low")]
    WagerTooLow,
    #[msg("Invalid house edge")]
    InvalidHouseEdge,
    #[msg("Maximum payout exceeded")]
    MaxPayoutExceeded,
    #[msg("Invalid multiplier")]
    InvalidMultiplier,
    #[msg("Game not settled")]
    GameNotSettled,
    #[msg("Invalid bet configuration")]
    InvalidBetConfiguration,
    #[msg("Invalid bet parameters")]
    InvalidBetParameters,
    #[msg("House edge too high")]
    HouseEdgeTooHigh,
    #[msg("Wager too high")]
    WagerTooHigh,
    #[msg("Game not in correct state")]
    InvalidGameState,
    #[msg("Invalid game result")]
    InvalidGameResult,
    #[msg("RNG settlement failed")]
    RngSettlementFailed,
    #[msg("Creator fee too high")]
    CreatorFeeTooHigh,
    #[msg("Invalid jackpot configuration")]
    InvalidJackpotConfiguration,
    #[msg("Invalid metadata")]
    InvalidMetadata,
}

#[error_code]
pub enum PoolError {
    #[msg("Pool not found")]
    PoolNotFound,
    #[msg("Insufficient pool liquidity")]
    InsufficientLiquidity,
    #[msg("Invalid pool authority")]
    InvalidPoolAuthority,
    #[msg("Pool deposit limit exceeded")]
    DepositLimitExceeded,
    #[msg("Invalid withdrawal amount")]
    InvalidWithdrawalAmount,
    #[msg("Pool is paused")]
    PoolPaused,
    #[msg("Pool not initialized")]
    PoolNotInitialized,
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    #[msg("Invalid LP token calculation")]
    InvalidLPTokenCalculation,
    #[msg("Whitelist check failed")]
    WhitelistCheckFailed,
    #[msg("Custom fee out of bounds")]
    CustomFeeOutOfBounds,
    #[msg("Withdrawal limit exceeded")]
    WithdrawalLimitExceeded,
} 