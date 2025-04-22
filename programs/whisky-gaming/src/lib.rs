use anchor_lang::prelude::*;

declare_id!("Bk1qUqYaEfCyKWeke3VKDjmb2rtFM61QyPmroSFmv7uw");

#[program]
pub mod whisky_gaming {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
