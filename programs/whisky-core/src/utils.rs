use anchor_lang::prelude::*;
use sha2::{Digest, Sha256};
use crate::constants::*;
use crate::errors::*;

/// Calculate LP tokens to mint for a deposit
pub fn calculate_lp_tokens(deposit_amount: u64, pool_liquidity: u64, lp_supply: u64) -> u64 {
    if lp_supply == 0 || pool_liquidity == 0 {
        // First deposit gets 1:1 ratio
        return deposit_amount;
    }
    
    // LP tokens = (deposit_amount * lp_supply) / pool_liquidity
    (deposit_amount as u128)
        .checked_mul(lp_supply as u128)
        .unwrap()
        .checked_div(pool_liquidity as u128)
        .unwrap() as u64
}

/// Calculate underlying tokens to withdraw for burning LP tokens
pub fn calculate_withdraw_amount(lp_tokens: u64, pool_liquidity: u64, lp_supply: u64) -> u64 {
    if lp_supply == 0 {
        return 0;
    }
    
    // Withdraw amount = (lp_tokens * pool_liquidity) / lp_supply
    (lp_tokens as u128)
        .checked_mul(pool_liquidity as u128)
        .unwrap()
        .checked_div(lp_supply as u128)
        .unwrap() as u64
}

/// Calculate fee amount from basis points
pub fn calculate_fee(amount: u64, fee_bps: u64) -> u64 {
    (amount as u128)
        .checked_mul(fee_bps as u128)
        .unwrap()
        .checked_div(BPS_PER_WHOLE as u128)
        .unwrap() as u64
}

/// Calculate jackpot probability based on wager and pool size
pub fn calculate_jackpot_probability(wager: u64, pool_liquidity: u64) -> u64 {
    // Base probability scaled by wager size relative to pool
    let wager_ratio = if pool_liquidity > 0 {
        (wager as u128)
            .checked_mul(BPS_PER_WHOLE as u128)
            .unwrap()
            .checked_div(pool_liquidity as u128)
            .unwrap()
    } else {
        0
    };
    
    // Jackpot probability in micro basis points (1 ubps = 0.0001 bps)
    let base_probability = JACKPOT_BASE_PROBABILITY; // 0.0001%
    
    // Scale probability by wager ratio (bigger wagers get better jackpot odds)
    let scaled_probability = base_probability
        .checked_mul(wager_ratio as u64)
        .unwrap_or(base_probability)
        .max(base_probability);
    
    // Cap at 1% (100 basis points = 1,000,000 ubps)
    scaled_probability.min(1_000_000)
}

/// Validate bet configuration
pub fn validate_bet(bet: &[u32]) -> Result<()> {
    // Check bet length
    require!(bet.len() >= MIN_BET_OUTCOMES, GameError::TooFewOutcomes);
    require!(bet.len() <= MAX_BET_OUTCOMES, GameError::TooManyOutcomes);
    
    // Check that at least one outcome has a weight > 0
    let total_weight: u64 = bet.iter().map(|&x| x as u64).sum();
    require!(total_weight > 0, GameError::InvalidBetWeights);
    
    Ok(())
}

/// Validate wager amount
pub fn validate_wager(wager: u64, min_wager: u64) -> Result<()> {
    require!(wager >= min_wager, GameError::WagerTooLow);
    require!(wager >= MIN_WAGER, GameError::WagerTooLow);
    Ok(())
}

/// Validate house edge doesn't exceed maximum
pub fn validate_house_edge(bet: &[u32], max_house_edge_bps: u64) -> Result<()> {
    let total_weight: u64 = bet.iter().map(|&x| x as u64).sum();
    
    // Calculate maximum multiplier
    let max_multiplier = bet.iter()
        .filter(|&&weight| weight > 0)
        .map(|&weight| (total_weight * BPS_PER_WHOLE) / (weight as u64))
        .max()
        .unwrap_or(0);
    
    // House edge = (1 - (1 / max_multiplier)) * 100%
    let house_edge_bps = if max_multiplier > 0 {
        BPS_PER_WHOLE - (BPS_PER_WHOLE * BPS_PER_WHOLE) / max_multiplier
    } else {
        BPS_PER_WHOLE // 100% house edge if no valid outcomes
    };
    
    require!(house_edge_bps <= max_house_edge_bps, GameError::InvalidHouseEdge);
    Ok(())
}

/// Validate maximum payout doesn't exceed pool limits
pub fn validate_max_payout(
    bet: &[u32], 
    wager: u64, 
    pool_liquidity: u64, 
    max_payout_bps: u64
) -> Result<()> {
    let total_weight: u64 = bet.iter().map(|&x| x as u64).sum();
    
    // Calculate maximum possible payout
    let max_multiplier = bet.iter()
        .filter(|&&weight| weight > 0)
        .map(|&weight| (total_weight * BPS_PER_WHOLE) / (weight as u64))
        .max()
        .unwrap_or(0);
    
    let max_payout = (wager as u128)
        .checked_mul(max_multiplier as u128)
        .unwrap()
        .checked_div(BPS_PER_WHOLE as u128)
        .unwrap() as u64;
    
    // Check against pool liquidity limit
    let pool_limit = calculate_fee(pool_liquidity, max_payout_bps);
    require!(max_payout <= pool_limit, GameError::MaxPayoutExceeded);
    
    Ok(())
}

/// Generate game hash for RNG
pub fn get_game_hash(rng_seed: &str, client_seed: &str, nonce: u64) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(rng_seed.as_bytes());
    hasher.update(client_seed.as_bytes());
    hasher.update(nonce.to_le_bytes());
    hasher.finalize().into()
}

/// Calculate game result from RNG
pub fn calculate_game_result(
    rng_seed: &str, 
    client_seed: &str, 
    nonce: u64, 
    bet: &[u32]
) -> u32 {
    let hash = get_game_hash(rng_seed, client_seed, nonce);
    
    // Convert first 4 bytes to u32
    let random_u32 = u32::from_le_bytes([hash[0], hash[1], hash[2], hash[3]]);
    
    // Calculate cumulative weights
    let total_weight: u64 = bet.iter().map(|&x| x as u64).sum();
    let mut cumulative_weight = 0u64;
    let target = (random_u32 as u64) % total_weight;
    
    // Find the winning outcome
    for (index, &weight) in bet.iter().enumerate() {
        cumulative_weight += weight as u64;
        if target < cumulative_weight {
            return index as u32;
        }
    }
    
    // Fallback (should never happen)
    (bet.len() - 1) as u32
}

/// Calculate jackpot result
pub fn calculate_jackpot_result(game_hash: &[u8; 32], jackpot_probability_ubps: u64) -> bool {
    // Use bytes 4-7 for jackpot calculation
    let jackpot_random = u32::from_le_bytes([
        game_hash[4], game_hash[5], game_hash[6], game_hash[7]
    ]);
    
    // Convert to range 0-999,999 (1 million outcomes)
    let jackpot_outcome = (jackpot_random as u64) % 1_000_000;
    
    // Win if outcome is less than probability
    jackpot_outcome < jackpot_probability_ubps
}

/// Calculate multiplier for a given outcome
pub fn calculate_multiplier(bet: &[u32], outcome_index: usize) -> u64 {
    if outcome_index >= bet.len() {
        return 0;
    }
    
    let outcome_weight = bet[outcome_index] as u64;
    if outcome_weight == 0 {
        return 0;
    }
    
    let total_weight: u64 = bet.iter().map(|&x| x as u64).sum();
    (total_weight * BPS_PER_WHOLE) / outcome_weight
}

/// Calculate expected return for a bet
pub fn calculate_expected_return(bet: &[u32]) -> u64 {
    let total_weight: u64 = bet.iter().map(|&x| x as u64).sum();
    
    if total_weight == 0 {
        return 0;
    }
    
    // Expected return = sum of (probability * multiplier) for each outcome
    let mut expected_return = 0u64;
    
    for &weight in bet.iter() {
        if weight > 0 {
            let probability = (weight as u64 * BPS_PER_WHOLE) / total_weight;
            let multiplier = (total_weight * BPS_PER_WHOLE) / (weight as u64);
            expected_return += (probability * multiplier) / BPS_PER_WHOLE;
        }
    }
    
    expected_return
}

/// Validate string length
pub fn validate_string_length(s: &str, max_length: usize) -> Result<()> {
    require!(s.len() <= max_length, GameError::InvalidMetadata);
    Ok(())
}

/// Generate deterministic random number from seed
pub fn generate_random_number(seed: &[u8], min: u64, max: u64) -> u64 {
    if min >= max {
        return min;
    }
    
    let mut hasher = Sha256::new();
    hasher.update(seed);
    let hash = hasher.finalize();
    
    let random_u64 = u64::from_le_bytes([
        hash[0], hash[1], hash[2], hash[3],
        hash[4], hash[5], hash[6], hash[7]
    ]);
    
    min + (random_u64 % (max - min))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_lp_tokens() {
        // First deposit
        assert_eq!(calculate_lp_tokens(1000, 0, 0), 1000);
        
        // Subsequent deposits
        assert_eq!(calculate_lp_tokens(1000, 10000, 5000), 500);
    }

    #[test]
    fn test_calculate_withdraw_amount() {
        assert_eq!(calculate_withdraw_amount(500, 10000, 5000), 1000);
        assert_eq!(calculate_withdraw_amount(1000, 0, 0), 0);
    }

    #[test]
    fn test_calculate_fee() {
        assert_eq!(calculate_fee(1000, 200), 20); // 2% of 1000 = 20
        assert_eq!(calculate_fee(1000, 0), 0);
    }

    #[test]
    fn test_calculate_multiplier() {
        let bet = vec![25, 25, 25, 25]; // Even odds
        assert_eq!(calculate_multiplier(&bet, 0), 40000); // 4x in BPS
        
        let bet = vec![90, 10]; // 90% vs 10%
        assert_eq!(calculate_multiplier(&bet, 1), 100000); // 10x in BPS
    }

    #[test]
    fn test_validate_bet() {
        assert!(validate_bet(&vec![25, 25, 25, 25]).is_ok());
        assert!(validate_bet(&vec![0, 0]).is_err()); // No valid outcomes
        assert!(validate_bet(&vec![50]).is_err()); // Too few outcomes
    }
} 