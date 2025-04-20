use anchor_lang::prelude::*;
use anchor_lang::Space;

declare_id!("v69C2KjiWjhUcRTKuotEY1E1PykP4oUtFaBE8ZCg5yJ");

const MAX_TITLE_LENGTH: usize = 32;
const MAX_DESCRIPTION_LENGTH: usize = 64;
const MAX_EMAIL_LENGTH: usize = 32;
const MAX_NAME_LENGTH: usize = 16;
const ACCOUNT_DISCRIMINATOR_LENGTH: usize = 8;
const EXTRA_SPACE: usize = 128; // Marge de sécurité

#[error_code]
pub enum AlyraError {
    #[msg("You are not the expected authority.")]
    WrongAuthority,
}

#[program]
pub mod alyra_sign {
    use super::*;

    pub fn create_formation(
        ctx: Context<CreateFormation>,
        title: [u8; MAX_TITLE_LENGTH],
        description: [u8; MAX_DESCRIPTION_LENGTH],
        start_date: i64,
        end_date: i64,
    ) -> Result<()> {
        let formation = &mut ctx.accounts.formation;
        formation.authority = ctx.accounts.authority.key();
        formation.title = title;
        formation.description = description;
        formation.start_date = start_date;
        formation.end_date = end_date;
        formation.student_count = 0;
        formation.session_count = 0;
        formation.created_at = Clock::get()?.unix_timestamp as u32;
        Ok(())
    }

    pub fn create_session(
        ctx: Context<CreateSession>,
        title: [u8; MAX_TITLE_LENGTH],
        description: [u8; MAX_DESCRIPTION_LENGTH],
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        let session = &mut ctx.accounts.session;
        session.formation = ctx.accounts.formation.key();
        session.title = title;
        session.description = description;
        session.start_time = start_time;
        session.end_time = end_time;
        session.created_at = Clock::get()?.unix_timestamp as u32;

        let formation = &mut ctx.accounts.formation;
        formation.session_count = formation.session_count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn add_student_to_formation(
        ctx: Context<AddStudentToFormation>,
        first_name: [u8; MAX_NAME_LENGTH],
        last_name: [u8; MAX_NAME_LENGTH],
        email: [u8; MAX_EMAIL_LENGTH],
    ) -> Result<()> {
        let student = &mut ctx.accounts.student;
        student.formation = ctx.accounts.formation.key();
        student.wallet = ctx.accounts.student_wallet.key();
        student.first_name = first_name;
        student.last_name = last_name;
        student.email = email;
        student.created_at = Clock::get()?.unix_timestamp as u32;

        let formation = &mut ctx.accounts.formation;
        formation.student_count = formation.student_count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn mark_presence(
        ctx: Context<MarkPresence>,
    ) -> Result<()> {
        let presence = &mut ctx.accounts.presence;
        presence.student = ctx.accounts.student.key();
        presence.session = ctx.accounts.session.key();
        presence.timestamp = Clock::get()?.unix_timestamp as u32;
        Ok(())
    }

    pub fn initialize_storage(ctx: Context<InitializeStorage>) -> Result<()> {
        let storage = &mut ctx.accounts.storage;
        storage.authority = ctx.accounts.authority.key();
        storage.created_at = Clock::get()?.unix_timestamp as u32;
        storage.bump = *ctx.bumps.get("storage").unwrap();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateFormation<'info> {
    #[account(
        init,
        payer = authority,
        space = ACCOUNT_DISCRIMINATOR_LENGTH + Formation::LEN + EXTRA_SPACE,
        seeds = [b"formation", authority.key().as_ref()],
        bump
    )]
    pub formation: Account<'info, Formation>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateSession<'info> {
    #[account(
        init,
        payer = authority,
        space = ACCOUNT_DISCRIMINATOR_LENGTH + Session::LEN + EXTRA_SPACE,
        seeds = [b"session", formation.key().as_ref()],
        bump
    )]
    pub session: Account<'info, Session>,
    #[account(mut)]
    pub formation: Account<'info, Formation>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddStudentToFormation<'info> {
    #[account(
        init,
        payer = authority,
        space = ACCOUNT_DISCRIMINATOR_LENGTH + Student::LEN + EXTRA_SPACE,
        seeds = [b"student", formation.key().as_ref(), student_wallet.key().as_ref()],
        bump
    )]
    pub student: Account<'info, Student>,
    #[account(mut)]
    pub formation: Account<'info, Formation>,
    /// CHECK: This is safe because we only use the key
    pub student_wallet: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MarkPresence<'info> {
    #[account(
        init,
        payer = student_wallet,
        space = ACCOUNT_DISCRIMINATOR_LENGTH + Presence::LEN + EXTRA_SPACE,
        seeds = [b"presence", student.key().as_ref(), session.key().as_ref()],
        bump
    )]
    pub presence: Account<'info, Presence>,
    pub student: Account<'info, Student>,
    pub session: Account<'info, Session>,
    #[account(mut)]
    pub student_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeStorage<'info> {
    #[account(
        init,
        payer = authority,
        space = ACCOUNT_DISCRIMINATOR_LENGTH + std::mem::size_of::<Storage>() + EXTRA_SPACE,
        seeds = [b"storage"],
        bump
    )]
    pub storage: Account<'info, Storage>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Formation {
    pub authority: Pubkey,
    pub title: [u8; MAX_TITLE_LENGTH],
    pub description: [u8; MAX_DESCRIPTION_LENGTH],
    pub start_date: i64,
    pub end_date: i64,
    pub student_count: u8,
    pub session_count: u8,
    pub created_at: u32,
}

impl Formation {
    pub const LEN: usize = 32 + // authority
        MAX_TITLE_LENGTH + // title
        MAX_DESCRIPTION_LENGTH + // description
        8 + // start_date
        8 + // end_date
        1 + // student_count
        1 + // session_count
        4; // created_at
}

#[account]
pub struct Session {
    pub formation: Pubkey,
    pub title: [u8; MAX_TITLE_LENGTH],
    pub description: [u8; MAX_DESCRIPTION_LENGTH],
    pub start_time: i64,
    pub end_time: i64,
    pub created_at: u32,
}

impl Session {
    pub const LEN: usize = 32 + // formation
        MAX_TITLE_LENGTH + // title
        MAX_DESCRIPTION_LENGTH + // description
        8 + // start_time
        8 + // end_time
        4; // created_at
}

#[account]
pub struct Student {
    pub formation: Pubkey,
    pub wallet: Pubkey,
    pub first_name: [u8; MAX_NAME_LENGTH],
    pub last_name: [u8; MAX_NAME_LENGTH],
    pub email: [u8; MAX_EMAIL_LENGTH],
    pub created_at: u32,
}

impl Student {
    pub const LEN: usize = 32 + // formation
        32 + // wallet
        MAX_NAME_LENGTH + // first_name
        MAX_NAME_LENGTH + // last_name
        MAX_EMAIL_LENGTH + // email
        4; // created_at
}

#[account]
pub struct Presence {
    pub student: Pubkey,
    pub session: Pubkey,
    pub timestamp: u32,
}

impl Presence {
    pub const LEN: usize = 32 + // student
        32 + // session
        4; // timestamp
}

#[account]
#[derive(Default)]
pub struct Storage {
    pub authority: Pubkey,
    pub created_at: u32,
    pub bump: u8,
}

impl Storage {
    pub const LEN: usize = 32 + // authority
        4 + // created_at
        1; // bump
}