use anchor_lang::prelude::*;
use anchor_lang::Space;

declare_id!("GTPgTjPwjUDkthnmVenVvULZZhzvn5xtExzfh7GDcnsd");

const MAX_PRESENCES: usize = 25;
const MAX_CLOCKINS: usize = 25;
const MAX_TITLE_LENGTH: usize = 32;
const MAX_DESCRIPTION_LENGTH: usize = 64;
const MAX_EMAIL_LENGTH: usize = 32;
const MAX_NAME_LENGTH: usize = 16;

#[error_code]
pub enum AlyraError {
    #[msg("Maximum number of presences reached")]
    MaxPresencesReached,
    #[msg("You are not the expected authority.")]
    WrongAuthority,
}

#[program]
pub mod alyra_sign {
    use super::*;

    pub fn create_registry(
        ctx: Context<CreateRegistry>,
        title: [u8; MAX_TITLE_LENGTH],
        description: [u8; MAX_DESCRIPTION_LENGTH],
    ) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.authority = ctx.accounts.authority.key();
        registry.title = title;
        registry.description = description;
        registry.formation_count = 0;
        registry.event_count = 0;
        registry.created_at = Clock::get()?.unix_timestamp as u32;
        Ok(())
    }

    pub fn create_formation(
        ctx: Context<CreateFormation>,
        title: [u8; MAX_TITLE_LENGTH],
        description: [u8; MAX_DESCRIPTION_LENGTH],
        start_date: i64,
        end_date: i64,
    ) -> Result<()> {
        let formation = &mut ctx.accounts.formation;
        formation.registry = ctx.accounts.registry.key();
        formation.title = title;
        formation.description = description;
        formation.start_date = start_date;
        formation.end_date = end_date;
        formation.student_count = 0;
        formation.created_at = Clock::get()?.unix_timestamp as u32;

        let registry = &mut ctx.accounts.registry;
        registry.formation_count = registry.formation_count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn create_event(
        ctx: Context<CreateEvent>,
        title: [u8; MAX_TITLE_LENGTH],
        description: [u8; MAX_DESCRIPTION_LENGTH],
        event_code: [u8; MAX_TITLE_LENGTH],
        start_date: i64,
        end_date: i64,
    ) -> Result<()> {
        let event = &mut ctx.accounts.event;
        event.registry = ctx.accounts.registry.key();
        event.title = title;
        event.description = description;
        event.event_code = event_code;
        event.start_date = start_date;
        event.end_date = end_date;
        event.attendee_count = 0;
        event.created_at = Clock::get()?.unix_timestamp as u32;

        let registry = &mut ctx.accounts.registry;
        registry.event_count = registry.event_count.checked_add(1).unwrap();
        Ok(())
    }

    pub fn register_student(
        ctx: Context<RegisterStudent>,
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

    pub fn register_attendee(
        ctx: Context<RegisterAttendee>,
        first_name: [u8; MAX_NAME_LENGTH],
        last_name: [u8; MAX_NAME_LENGTH],
        email: [u8; MAX_EMAIL_LENGTH],
    ) -> Result<()> {
        let attendee = &mut ctx.accounts.attendee;
        attendee.event = ctx.accounts.event.key();
        attendee.wallet = ctx.accounts.attendee_wallet.key();
        attendee.first_name = first_name;
        attendee.last_name = last_name;
        attendee.email = email;
        attendee.created_at = Clock::get()?.unix_timestamp as u32;

        let event = &mut ctx.accounts.event;
        event.attendee_count = event.attendee_count.checked_add(1).unwrap();
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
        Ok(())
    }

    pub fn mark_presence(
        ctx: Context<MarkPresence>,
        session: Pubkey,
    ) -> Result<()> {
        let presence = &mut ctx.accounts.presence;
        presence.student = ctx.accounts.student.key();
        presence.session = session;
        presence.timestamp = Clock::get()?.unix_timestamp as u32;
        Ok(())
    }

    pub fn create_clockin(
        ctx: Context<CreateClockin>,
        current_session: Pubkey,
    ) -> Result<()> {
        let clockin = &mut ctx.accounts.clockin;
        clockin.attendee = ctx.accounts.attendee.key();
        clockin.session = current_session;
        clockin.timestamp = Clock::get()?.unix_timestamp as u32;
        Ok(())
    }
}

// derive(Accounts)

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
pub struct CreateEvent<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Event::LEN,
        seeds = [b"event", registry.key().as_ref(), &registry.event_count.to_le_bytes()],
        bump
    )]
    pub event: Account<'info, Event>,
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
pub struct RegisterAttendee<'info> {
    #[account(
        init,
        payer = attendee_wallet,
        space = 8 + Attendee::LEN,
        seeds = [b"attendee", event.key().as_ref(), attendee_wallet.key().as_ref()],
        bump
    )]
    pub attendee: Account<'info, Attendee>,
    #[account(mut)]
    pub event: Account<'info, Event>,
    #[account(mut)]
    pub attendee_wallet: Signer<'info>,
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

#[derive(Accounts)]
pub struct CreateClockin<'info> {
    #[account(
        init,
        payer = attendee_wallet,
        space = 8 + Clockin::LEN,
        seeds = [b"clockin", attendee.key().as_ref(), current_session.key().as_ref()],
        bump
    )]
    pub clockin: Account<'info, Clockin>,
    pub attendee: Account<'info, Attendee>,
    /// CHECK: This is safe because we only use the key
    pub current_session: AccountInfo<'info>,
    #[account(mut)]
    pub attendee_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// accounts

#[account]
pub struct Registry {
    pub authority: Pubkey,
    pub title: [u8; MAX_TITLE_LENGTH],
    pub description: [u8; MAX_DESCRIPTION_LENGTH],
    pub formation_count: u8,
    pub event_count: u8,
    pub created_at: u32,
}

impl Registry {
    pub const LEN: usize = 32 + // authority
        MAX_TITLE_LENGTH + // title
        MAX_DESCRIPTION_LENGTH + // description
        1 + // formation_count
        1 + // event_count
        4; // created_at
}

#[account]
pub struct Formation {
    pub registry: Pubkey,
    pub title: [u8; MAX_TITLE_LENGTH],
    pub description: [u8; MAX_DESCRIPTION_LENGTH],
    pub start_date: i64,
    pub end_date: i64,
    pub student_count: u8,
    pub created_at: u32,
}

impl Formation {
    pub const LEN: usize = 32 + // registry
        MAX_TITLE_LENGTH + // title
        MAX_DESCRIPTION_LENGTH + // description
        8 + // start_date
        8 + // end_date
        1 + // student_count
        4; // created_at
}

#[account]
pub struct Event {
    pub registry: Pubkey,
    pub title: [u8; MAX_TITLE_LENGTH],
    pub description: [u8; MAX_DESCRIPTION_LENGTH],
    pub event_code: [u8; MAX_TITLE_LENGTH],
    pub start_date: i64,
    pub end_date: i64,
    pub attendee_count: u8,
    pub created_at: u32,
}

impl Event {
    pub const LEN: usize = 32 + // registry
        MAX_TITLE_LENGTH + // title
        MAX_DESCRIPTION_LENGTH + // description
        MAX_TITLE_LENGTH + // event_code
        8 + // start_date
        8 + // end_date
        1 + // attendee_count
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
pub struct Attendee {
    pub event: Pubkey,
    pub wallet: Pubkey,
    pub first_name: [u8; MAX_NAME_LENGTH],
    pub last_name: [u8; MAX_NAME_LENGTH],
    pub email: [u8; MAX_EMAIL_LENGTH],
    pub created_at: u32,
}

impl Attendee {
    pub const LEN: usize = 32 + // event
        32 + // wallet
        MAX_NAME_LENGTH + // first_name
        MAX_NAME_LENGTH + // last_name
        MAX_EMAIL_LENGTH + // email
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
pub struct Clockin {
    pub attendee: Pubkey,
    pub session: Pubkey,
    pub timestamp: u32,
}

impl Clockin {
    pub const LEN: usize = 32 + // attendee
        32 + // session
        4; // timestamp
}

// errors

#[error_code]
pub enum SecurityError {
    #[msg("You are not the expected authority.")]
    WrongAuthority,
}