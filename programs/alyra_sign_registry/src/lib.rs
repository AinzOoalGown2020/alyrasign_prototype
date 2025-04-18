use anchor_lang::prelude::*;

declare_id!("Cd38wDZywgYWXwtrKMczQHjyKwzk5wK7fycJ6E3vMXGk");

const MAX_TITLE_LENGTH: usize = 64;
const MAX_DESCRIPTION_LENGTH: usize = 256;
const MAX_EMAIL_LENGTH: usize = 64;
const MAX_NAME_LENGTH: usize = 32;

#[program]
pub mod alyra_sign_registry {
    use super::*;

    pub fn create_registry(
        ctx: Context<CreateRegistry>,
        title: [u8; MAX_TITLE_LENGTH],
        description: [u8; MAX_DESCRIPTION_LENGTH],
    ) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        initialize_registry(registry, &ctx.accounts.authority, title, description, *ctx.bumps.get("registry").unwrap())?;
        Ok(())
    }

    pub fn create_formation(
        ctx: Context<CreateFormation>,
        title: [u8; MAX_TITLE_LENGTH],
        description: [u8; MAX_DESCRIPTION_LENGTH],
        start_date: u32,
        end_date: u32,
    ) -> Result<()> {
        let formation = &mut ctx.accounts.formation;
        initialize_formation(formation, &ctx.accounts.registry, title, description, start_date, end_date, *ctx.bumps.get("formation").unwrap())?;
        increment_formation_count(&mut ctx.accounts.registry)?;
        Ok(())
    }

    pub fn register_student(
        ctx: Context<RegisterStudent>,
        first_name: [u8; MAX_NAME_LENGTH],
        last_name: [u8; MAX_NAME_LENGTH],
        email: [u8; MAX_EMAIL_LENGTH],
    ) -> Result<()> {
        let student = &mut ctx.accounts.student;
        initialize_student(student, &ctx.accounts.formation, &ctx.accounts.student_wallet, first_name, last_name, email, *ctx.bumps.get("student").unwrap())?;
        increment_student_count(&mut ctx.accounts.formation)?;
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
        initialize_session(session, &ctx.accounts.formation, title, description, start_time, end_time, *ctx.bumps.get("session").unwrap())?;
        Ok(())
    }

    pub fn mark_presence(
        ctx: Context<MarkPresence>,
        session: Pubkey,
    ) -> Result<()> {
        let presence = &mut ctx.accounts.presence;
        initialize_presence(presence, &ctx.accounts.student, session, *ctx.bumps.get("presence").unwrap())?;
        Ok(())
    }
}

// Fonctions d'initialisation
fn initialize_registry(
    registry: &mut Account<Registry>,
    authority: &AccountInfo,
    title: [u8; MAX_TITLE_LENGTH],
    description: [u8; MAX_DESCRIPTION_LENGTH],
    bump: u8,
) -> Result<()> {
    registry.authority = authority.key();
    registry.title = String::from_utf8(title.to_vec())
        .map_err(|_| ErrorCode::InvalidString)?;
    registry.description = String::from_utf8(description.to_vec())
        .map_err(|_| ErrorCode::InvalidString)?;
    registry.formation_count = 0;
    registry.student_count = 0;
    registry.bump = bump;
    registry.created_at = Clock::get()?.unix_timestamp as u32;
    Ok(())
}

fn initialize_formation(
    formation: &mut Account<Formation>,
    registry: &Account<Registry>,
    title: [u8; MAX_TITLE_LENGTH],
    description: [u8; MAX_DESCRIPTION_LENGTH],
    start_date: u32,
    end_date: u32,
    bump: u8,
) -> Result<()> {
    formation.registry = registry.key();
    formation.title = String::from_utf8(title.to_vec())
        .map_err(|_| ErrorCode::InvalidString)?;
    formation.description = String::from_utf8(description.to_vec())
        .map_err(|_| ErrorCode::InvalidString)?;
    formation.start_date = start_date;
    formation.end_date = end_date;
    formation.student_count = 0;
    formation.sessions = Vec::new();
    formation.bump = bump;
    formation.created_at = Clock::get()?.unix_timestamp as u32;
    Ok(())
}

fn initialize_student(
    student: &mut Account<Student>,
    formation: &Account<Formation>,
    wallet: &AccountInfo,
    first_name: [u8; MAX_NAME_LENGTH],
    last_name: [u8; MAX_NAME_LENGTH],
    email: [u8; MAX_EMAIL_LENGTH],
    bump: u8,
) -> Result<()> {
    student.formation = formation.key();
    student.wallet = wallet.key();
    student.first_name = String::from_utf8(first_name.to_vec())
        .map_err(|_| ErrorCode::InvalidString)?;
    student.last_name = String::from_utf8(last_name.to_vec())
        .map_err(|_| ErrorCode::InvalidString)?;
    student.email = String::from_utf8(email.to_vec())
        .map_err(|_| ErrorCode::InvalidString)?;
    student.bump = bump;
    student.created_at = Clock::get()?.unix_timestamp as u32;
    Ok(())
}

fn initialize_session(
    session: &mut Account<Session>,
    formation: &Account<Formation>,
    title: [u8; MAX_TITLE_LENGTH],
    description: [u8; MAX_DESCRIPTION_LENGTH],
    start_time: i64,
    end_time: i64,
    bump: u8,
) -> Result<()> {
    session.formation = formation.key();
    session.title = String::from_utf8(title.to_vec())
        .map_err(|_| ErrorCode::InvalidString)?;
    session.description = String::from_utf8(description.to_vec())
        .map_err(|_| ErrorCode::InvalidString)?;
    session.start_time = start_time;
    session.end_time = end_time;
    session.bump = bump;
    session.presences = Vec::new();
    session.created_at = Clock::get()?.unix_timestamp as u32;
    Ok(())
}

fn initialize_presence(
    presence: &mut Account<Presence>,
    student: &Account<Student>,
    session: Pubkey,
    bump: u8,
) -> Result<()> {
    presence.student = student.key();
    presence.session = session;
    presence.timestamp = Clock::get()?.unix_timestamp;
    presence.bump = bump;
    Ok(())
}

// Fonctions utilitaires
fn increment_formation_count(registry: &mut Account<Registry>) -> Result<()> {
    registry.formation_count = registry.formation_count.checked_add(1).unwrap();
    Ok(())
}

fn increment_student_count(formation: &mut Account<Formation>) -> Result<()> {
    formation.student_count = formation.student_count.checked_add(1).unwrap();
    Ok(())
}

#[derive(Accounts)]
pub struct CreateRegistry<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Registry::LEN,
        seeds = [b"registry", authority.key().as_ref()],
        bump
    )]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateFormation<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Formation::LEN,
        seeds = [b"formation", registry.key().as_ref(), &registry.formation_count.to_le_bytes()],
        bump
    )]
    pub formation: Account<'info, Formation>,
    #[account(mut)]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterStudent<'info> {
    #[account(
        init,
        payer = student_wallet,
        space = 8 + Student::LEN,
        seeds = [b"student", formation.key().as_ref(), student_wallet.key().as_ref()],
        bump
    )]
    pub student: Account<'info, Student>,
    #[account(mut)]
    pub formation: Account<'info, Formation>,
    #[account(mut)]
    pub student_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateSession<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Session::LEN,
        seeds = [b"session", formation.key().as_ref()],
        bump
    )]
    pub session: Account<'info, Session>,
    pub formation: Account<'info, Formation>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MarkPresence<'info> {
    #[account(
        init,
        payer = student_wallet,
        space = 8 + Presence::LEN,
        seeds = [b"presence", student.key().as_ref(), session.key().as_ref()],
        bump
    )]
    pub presence: Account<'info, Presence>,
    pub student: Account<'info, Student>,
    /// CHECK: This is safe because we only use the key
    pub session: AccountInfo<'info>,
    #[account(mut)]
    pub student_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Registry {
    pub authority: Pubkey,
    pub title: String,
    pub description: String,
    pub formation_count: u8,
    pub student_count: u8,
    pub bump: u8,
    pub created_at: u32,
}

impl Registry {
    pub const LEN: usize = 32 + // authority
        MAX_TITLE_LENGTH + // title
        MAX_DESCRIPTION_LENGTH + // description
        1 + // formation_count
        1 + // student_count
        1 + // bump
        4; // created_at
}

#[account]
pub struct Formation {
    pub registry: Pubkey,
    pub title: String,
    pub description: String,
    pub start_date: u32,
    pub end_date: u32,
    pub student_count: u8,
    pub sessions: Vec<Pubkey>,
    pub bump: u8,
    pub created_at: u32,
}

impl Formation {
    pub const LEN: usize = 32 + // registry
        MAX_TITLE_LENGTH + // title
        MAX_DESCRIPTION_LENGTH + // description
        4 + // start_date
        4 + // end_date
        1 + // student_count
        32 * 50 + // sessions (max 50 sessions)
        1 + // bump
        4; // created_at
}

#[account]
pub struct Student {
    pub formation: Pubkey,
    pub wallet: Pubkey,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub bump: u8,
    pub created_at: u32,
}

impl Student {
    pub const LEN: usize = 32 + // formation
        32 + // wallet
        MAX_NAME_LENGTH + // first_name
        MAX_NAME_LENGTH + // last_name
        MAX_EMAIL_LENGTH + // email
        1 + // bump
        4; // created_at
}

#[account]
pub struct Session {
    pub formation: Pubkey,
    pub title: String,
    pub description: String,
    pub start_time: i64,
    pub end_time: i64,
    pub presences: Vec<Pubkey>,
    pub bump: u8,
    pub created_at: u32,
}

impl Session {
    pub const LEN: usize = 32 + // formation
        MAX_TITLE_LENGTH + // title
        MAX_DESCRIPTION_LENGTH + // description
        8 + // start_time
        8 + // end_time
        32 * 100 + // presences (max 100 presences)
        1 + // bump
        4; // created_at
}

#[account]
pub struct Presence {
    pub student: Pubkey,
    pub session: Pubkey,
    pub timestamp: i64,
    pub bump: u8,
}

impl Presence {
    pub const LEN: usize = 32 + // student
        32 + // session
        8 + // timestamp
        1; // bump
}

#[error_code]
pub enum ErrorCode {
    #[msg("Title is too long")]
    TitleTooLong,
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("Name is too long")]
    NameTooLong,
    #[msg("Email is too long")]
    EmailTooLong,
    #[msg("Invalid string encoding")]
    InvalidString,
} 