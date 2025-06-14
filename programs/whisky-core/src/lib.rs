use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata},
    token::{burn, mint_to, transfer, Burn, Mint, MintTo, Token, TokenAccount, Transfer},
};
use mpl_token_metadata::types::{DataV2, TokenStandard};
use std::str::FromStr;

declare_id!("6R7S7r6KzU1A5YACXCaKuF6GcEcv5ZdXU4hh8vPozcw6");

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use crate::constants::*;
use crate::errors::*;
use crate::instructions::*;
use crate::state::*;
use crate::utils::*;

#[program]
pub mod whisky_core {
    use super::*;

    /// Initialize the global Whisky gaming protocol
    pub fn whisky_initialize(ctx: Context<WhiskyInitialize>) -> Result<()> {
        let whisky_state = &mut ctx.accounts.whisky_state;
        
        whisky_state.authority = ctx.accounts.initializer.key();
        whisky_state.rng_address = Pubkey::default();
        whisky_state.rng_address_2 = Pubkey::default();
        whisky_state.anti_spam_fee = DEFAULT_ANTI_SPAM_FEE;
        whisky_state.whisky_fee_bps = DEFAULT_WHISKY_FEE_BPS;
        whisky_state.pool_creation_fee = DEFAULT_POOL_CREATION_FEE;
        whisky_state.default_pool_fee = DEFAULT_POOL_FEE_BPS;
        whisky_state.jackpot_payout_to_user_bps = DEFAULT_JACKPOT_PAYOUT_TO_USER_BPS;
        whisky_state.jackpot_payout_to_creator_bps = DEFAULT_JACKPOT_PAYOUT_TO_CREATOR_BPS;
        whisky_state.jackpot_payout_to_pool_bps = DEFAULT_JACKPOT_PAYOUT_TO_POOL_BPS;
        whisky_state.jackpot_payout_to_whisky_bps = DEFAULT_JACKPOT_PAYOUT_TO_WHISKY_BPS;
        whisky_state.bonus_to_jackpot_ratio_bps = DEFAULT_BONUS_TO_JACKPOT_RATIO_BPS;
        whisky_state.max_house_edge_bps = DEFAULT_MAX_HOUSE_EDGE_BPS;
        whisky_state.max_creator_fee_bps = DEFAULT_MAX_CREATOR_FEE_BPS;
        whisky_state.max_payout_bps = DEFAULT_MAX_PAYOUT_BPS;
        whisky_state.pool_withdraw_fee_bps = DEFAULT_POOL_WITHDRAW_FEE_BPS;
        whisky_state.pool_creation_allowed = true;
        whisky_state.pool_deposit_allowed = true;
        whisky_state.pool_withdraw_allowed = true;
        whisky_state.playing_allowed = true;
        whisky_state.distribution_recipient = ctx.accounts.initializer.key();
        whisky_state.bump = [ctx.bumps.whisky_state];

        msg!("🥃 Whisky Gaming Protocol initialized!");
        Ok(())
    }

    /// Set protocol authority
    pub fn whisky_set_authority(ctx: Context<WhiskySetAuthority>, authority: Pubkey) -> Result<()> {
        ctx.accounts.whisky_state.authority = authority;
        msg!("Authority updated to {}", authority);
        Ok(())
    }

    /// Configure protocol settings
    pub fn whisky_set_config(
        ctx: Context<WhiskySetConfig>,
        rng_address: Pubkey,
        whisky_fee: u64,
        max_creator_fee: u64,
        pool_creation_fee: u64,
        anti_spam_fee: u64,
        max_house_edge: u64,
        default_pool_fee: u64,
        jackpot_payout_to_user_bps: u64,
        jackpot_payout_to_creator_bps: u64,
        jackpot_payout_to_pool_bps: u64,
        jackpot_payout_to_whisky_bps: u64,
        bonus_to_jackpot_ratio_bps: u64,
        max_payout_bps: u64,
        pool_withdraw_fee_bps: u64,
        pool_creation_allowed: bool,
        pool_deposit_allowed: bool,
        pool_withdraw_allowed: bool,
        playing_allowed: bool,
        distribution_recipient: Pubkey,
    ) -> Result<()> {
        let whisky_state = &mut ctx.accounts.whisky_state;
        
        whisky_state.rng_address = rng_address;
        whisky_state.whisky_fee_bps = whisky_fee;
        whisky_state.max_creator_fee_bps = max_creator_fee;
        whisky_state.pool_creation_fee = pool_creation_fee;
        whisky_state.anti_spam_fee = anti_spam_fee;
        whisky_state.max_house_edge_bps = max_house_edge;
        whisky_state.default_pool_fee = default_pool_fee;
        whisky_state.jackpot_payout_to_user_bps = jackpot_payout_to_user_bps;
        whisky_state.jackpot_payout_to_creator_bps = jackpot_payout_to_creator_bps;
        whisky_state.jackpot_payout_to_pool_bps = jackpot_payout_to_pool_bps;
        whisky_state.jackpot_payout_to_whisky_bps = jackpot_payout_to_whisky_bps;
        whisky_state.bonus_to_jackpot_ratio_bps = bonus_to_jackpot_ratio_bps;
        whisky_state.max_payout_bps = max_payout_bps;
        whisky_state.pool_withdraw_fee_bps = pool_withdraw_fee_bps;
        whisky_state.pool_creation_allowed = pool_creation_allowed;
        whisky_state.pool_deposit_allowed = pool_deposit_allowed;
        whisky_state.pool_withdraw_allowed = pool_withdraw_allowed;
        whisky_state.playing_allowed = playing_allowed;
        whisky_state.distribution_recipient = distribution_recipient;

        msg!("Configuration updated");
        Ok(())
    }

    /// Initialize a gaming pool
    pub fn pool_initialize(
        ctx: Context<PoolInitialize>,
        pool_authority: Pubkey,
        lookup_address: Pubkey,
    ) -> Result<()> {
        let whisky_state = &ctx.accounts.whisky_state;
        require!(whisky_state.pool_creation_allowed, WhiskyStateError::PoolCreationNotAllowed);

        let pool = &mut ctx.accounts.pool;
        pool.bump = [ctx.bumps.pool];
        pool.lookup_address = lookup_address;
        pool.pool_authority = pool_authority;
        pool.underlying_token_mint = ctx.accounts.underlying_token_mint.key();
        pool.anti_spam_fee_exempt = false;
        pool.min_wager = 1_000_000;
        pool.plays = 0;
        pool.liquidity_checkpoint = 0;
        pool.deposit_limit = false;
        pool.deposit_limit_amount = 0;
        pool.custom_pool_fee = false;
        pool.custom_pool_fee_bps = 0;
        pool.custom_whisky_fee = false;
        pool.custom_whisky_fee_bps = 0;
        pool.custom_max_payout = false;
        pool.custom_max_payout_bps = 0;
        pool.custom_bonus_token_mint = Pubkey::default();
        pool.custom_bonus_token = false;
        pool.custom_max_creator_fee = false;
        pool.custom_max_creator_fee_bps = 0;
        pool.deposit_whitelist_required = false;
        pool.deposit_whitelist_address = Pubkey::default();

        msg!("🎰 Pool initialized for token {}", ctx.accounts.underlying_token_mint.key());
        Ok(())
    }

    /// Deposit tokens to provide liquidity
    pub fn pool_deposit(ctx: Context<PoolDeposit>, amount: u64) -> Result<()> {
        let whisky_state = &ctx.accounts.whisky_state;
        require!(whisky_state.pool_deposit_allowed, WhiskyStateError::DepositNotAllowed);

        let pool_liquidity = ctx.accounts.pool_underlying_token_account.amount;
        let lp_supply = ctx.accounts.lp_mint.supply;
        let lp_tokens = calculate_lp_tokens(amount, pool_liquidity, lp_supply);

        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_underlying_ata.to_account_info(),
                    to: ctx.accounts.pool_underlying_token_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        let underlying_token_mint = ctx.accounts.underlying_token_mint.key();
        let pool_seeds = &[
            POOL_SEED,
            underlying_token_mint.as_ref(),
            ctx.accounts.pool.pool_authority.as_ref(),
            &[ctx.accounts.pool.bump[0]],
        ];

        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.lp_mint.to_account_info(),
                    to: ctx.accounts.user_lp_ata.to_account_info(),
                    authority: ctx.accounts.pool.to_account_info(),
                },
                &[&pool_seeds[..]],
            ),
            lp_tokens,
        )?;

        emit!(PoolChange {
            user: ctx.accounts.user.key(),
            pool: ctx.accounts.pool.key(),
            token_mint: ctx.accounts.underlying_token_mint.key(),
            action: PoolAction::Deposit,
            amount,
            post_liquidity: pool_liquidity + amount,
            lp_supply: lp_supply + lp_tokens,
        });

        msg!("💰 Deposited {} tokens, received {} LP tokens", amount, lp_tokens);
        Ok(())
    }

    /// Withdraw liquidity from pool
    pub fn pool_withdraw(ctx: Context<PoolWithdraw>, amount: u64) -> Result<()> {
        let whisky_state = &ctx.accounts.whisky_state;
        require!(whisky_state.pool_withdraw_allowed, WhiskyStateError::WithdrawalNotAllowed);

        let pool_liquidity = ctx.accounts.pool_underlying_token_account.amount;
        let lp_supply = ctx.accounts.lp_mint.supply;
        let withdraw_amount = calculate_withdraw_amount(amount, pool_liquidity, lp_supply);

        burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    mint: ctx.accounts.lp_mint.to_account_info(),
                    from: ctx.accounts.user_lp_ata.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        let underlying_token_mint = ctx.accounts.underlying_token_mint.key();
        let pool_seeds = &[
            POOL_SEED,
            underlying_token_mint.as_ref(),
            ctx.accounts.pool.pool_authority.as_ref(),
            &[ctx.accounts.pool.bump[0]],
        ];

        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.pool_underlying_token_account.to_account_info(),
                    to: ctx.accounts.user_underlying_ata.to_account_info(),
                    authority: ctx.accounts.pool.to_account_info(),
                },
                &[&pool_seeds[..]],
            ),
            withdraw_amount,
        )?;

        msg!("💸 Withdrew {} tokens for {} LP tokens", withdraw_amount, amount);
        Ok(())
    }

    /// Initialize player and game accounts
    pub fn player_initialize(ctx: Context<PlayerInitialize>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        let game = &mut ctx.accounts.game;
        
        player.bump = [ctx.bumps.player];
        player.user = ctx.accounts.user.key();
        player.nonce = 0;

        game.bump = [ctx.bumps.game];
        game.nonce = 0;
        game.user = ctx.accounts.user.key();
        game.token_mint = Pubkey::default();
        game.pool = Pubkey::default();
        game.status = GameStatus::None;
        game.next_rng_seed_hashed = String::new();
        game.rng_seed = String::new();
        game.timestamp = 0;
        game.creator = Pubkey::default();
        game.creator_meta = String::new();
        game.wager = 0;
        game.underlying_used = 0;
        game.bonus_used = 0;
        game.creator_fee = 0;
        game.whisky_fee = 0;
        game.pool_fee = 0;
        game.jackpot_fee = 0;
        game.jackpot_result = 0;
        game.jackpot_probability_ubps = 0;
        game.jackpot_payout = 0;
        game.client_seed = String::new();
        game.bet = Vec::new();
        game.result = 0;
        game.points = false;
        game.points_authority = Pubkey::default();
        game.metadata = String::new();

        msg!("🎮 Player initialized for {}", ctx.accounts.user.key());
        Ok(())
    }

    /// Place a bet and start a game
    pub fn play_game(
        ctx: Context<PlayGame>,
        wager: u64,
        bet: Vec<u32>,
        client_seed: String,
        creator_fee_bps: u32,
        jackpot_fee_bps: u32,
        metadata: String,
    ) -> Result<()> {
        let whisky_state = &ctx.accounts.whisky_state;
        let pool = &ctx.accounts.pool;
        let player = &mut ctx.accounts.player;
        let game = &mut ctx.accounts.game;
        
        require!(whisky_state.playing_allowed, WhiskyStateError::PlaysNotAllowed);
        
        validate_bet(&bet)?;
        validate_wager(wager, pool.min_wager)?;
        validate_house_edge(&bet, whisky_state.max_house_edge_bps)?;
        
        let pool_liquidity = ctx.accounts.pool_underlying_token_account.amount;
        validate_max_payout(&bet, wager, pool_liquidity, whisky_state.max_payout_bps)?;

        player.nonce = player.nonce.checked_add(1).unwrap();
        game.nonce = player.nonce;
        game.user = ctx.accounts.user.key();
        game.token_mint = ctx.accounts.underlying_token_mint.key();
        game.pool = ctx.accounts.pool.key();
        game.status = GameStatus::ResultRequested;
        game.timestamp = Clock::get()?.unix_timestamp;
        game.creator = ctx.accounts.creator.key();
        game.wager = wager;
        game.creator_fee = calculate_fee(wager, creator_fee_bps as u64);
        game.whisky_fee = calculate_fee(wager, whisky_state.whisky_fee_bps);
        game.jackpot_fee = calculate_fee(wager, jackpot_fee_bps as u64);
        game.client_seed = client_seed;
        game.bet = bet;
        game.metadata = metadata;
        game.jackpot_probability_ubps = calculate_jackpot_probability(wager, pool_liquidity);

        transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_underlying_ata.to_account_info(),
                    to: ctx.accounts.player_ata.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            wager,
        )?;

        msg!("🎲 Game started! Wager: {}, Nonce: {}", wager, game.nonce);
        Ok(())
    }

    /// Claim winnings after game settlement
    pub fn player_claim(ctx: Context<PlayerClaim>) -> Result<()> {
        let player = &ctx.accounts.player;
        let game = &ctx.accounts.game;
        
        require!(game.status == GameStatus::Ready, PlayerError::NotReadyToPlay);

        let user_key = ctx.accounts.user.key();
        let player_seeds = &[
            PLAYER_SEED,
            user_key.as_ref(),
            &[player.bump[0]],
        ];

        if ctx.accounts.player_ata.amount > 0 {
            transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.player_ata.to_account_info(),
                        to: ctx.accounts.user_underlying_ata.to_account_info(),
                        authority: ctx.accounts.player.to_account_info(),
                    },
                    &[&player_seeds[..]],
                ),
                ctx.accounts.player_ata.amount,
            )?;
        }

        msg!("💰 Winnings claimed: {}", ctx.accounts.player_ata.amount);
        Ok(())
    }

    /// Close player account
    pub fn player_close(ctx: Context<PlayerClose>) -> Result<()> {
        msg!("👋 Player account closed");
        Ok(())
    }

    /// Settle game with RNG (called by RNG authority)
    pub fn rng_settle(
        ctx: Context<RngSettle>,
        rng_seed: String,
        next_rng_seed_hashed: String,
    ) -> Result<()> {
        let whisky_state = &ctx.accounts.whisky_state;
        let game = &mut ctx.accounts.game;
        
        require!(ctx.accounts.rng.key() == whisky_state.rng_address, WhiskyError::Unauthorized);
        require!(game.status == GameStatus::ResultRequested, RngError::ResultNotRequested);

        let result_index = calculate_game_result(&rng_seed, &game.client_seed, game.nonce, &game.bet);
        game.result = result_index;
        game.rng_seed = rng_seed.clone();
        game.next_rng_seed_hashed = next_rng_seed_hashed.clone();
        game.status = GameStatus::Ready;

        let game_hash = get_game_hash(&rng_seed, &game.client_seed, game.nonce);
        let jackpot_won = calculate_jackpot_result(&game_hash, game.jackpot_probability_ubps);
        
        if jackpot_won {
            game.jackpot_payout = ctx.accounts.pool_jackpot_token_account.amount;
        }

        let bet_weight = game.bet.get(result_index as usize).copied().unwrap_or(0);
        let total_weight: u64 = game.bet.iter().map(|&x| x as u64).sum();
        
        let multiplier = if bet_weight > 0 && total_weight > 0 {
            (total_weight * BPS_PER_WHOLE) / (bet_weight as u64)
        } else {
            0
        };

        let base_payout = (game.wager * multiplier) / BPS_PER_WHOLE;
        let total_payout = base_payout + game.jackpot_payout;

        emit!(GameSettled {
            user: game.user,
            pool: game.pool,
            token_mint: game.token_mint,
            creator: game.creator,
            creator_fee: game.creator_fee,
            whisky_fee: game.whisky_fee,
            pool_fee: game.pool_fee,
            jackpot_fee: game.jackpot_fee,
            underlying_used: game.underlying_used,
            bonus_used: game.bonus_used,
            wager: game.wager,
            payout: total_payout,
            multiplier_bps: multiplier as u32,
            payout_from_bonus_pool: 0,
            payout_from_normal_pool: base_payout,
            jackpot_probability_ubps: game.jackpot_probability_ubps,
            jackpot_result: if jackpot_won { 1 } else { 0 },
            nonce: game.nonce,
            client_seed: game.client_seed.clone(),
            result_index,
            bet: game.bet.clone(),
            jackpot_payout_to_user: game.jackpot_payout,
            pool_liquidity: ctx.accounts.pool_underlying_token_account.amount,
            rng_seed: rng_seed.clone(),
            next_rng_seed_hashed: next_rng_seed_hashed.clone(),
            metadata: game.metadata.clone(),
        });

        msg!("🎯 Game settled! Result: {}, Payout: {}, Jackpot: {}", 
             result_index, total_payout, jackpot_won);
        Ok(())
    }

    /// Provide next RNG seed hash
    pub fn rng_provide_hashed_seed(
        ctx: Context<RngProvideHashedSeed>,
        next_rng_seed_hashed: String,
    ) -> Result<()> {
        let whisky_state = &ctx.accounts.whisky_state;
        require!(ctx.accounts.rng.key() == whisky_state.rng_address, WhiskyError::Unauthorized);
        
        ctx.accounts.game.next_rng_seed_hashed = next_rng_seed_hashed;
        Ok(())
    }

    /// Distribute protocol fees
    pub fn distribute_fees(ctx: Context<DistributeFees>, _native_sol: bool) -> Result<()> {
        let whisky_state = &ctx.accounts.whisky_state;
        let amount = ctx.accounts.whisky_state_ata.amount;
        
        if amount == 0 {
            return Ok(());
        }

        let seeds = &[WHISKY_STATE_SEED, &[whisky_state.bump[0]]];

        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.whisky_state_ata.to_account_info(),
                    to: ctx.accounts.distribution_recipient_ata.to_account_info(),
                    authority: ctx.accounts.whisky_state.to_account_info(),
                },
                &[&seeds[..]],
            ),
            amount,
        )?;

        msg!("💸 Distributed {} tokens in fees", amount);
        Ok(())
    }
} 