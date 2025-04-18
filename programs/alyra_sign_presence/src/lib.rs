use anchor_lang::prelude::*;

declare_id!("Ao4GvKFFuGazwP3VoiJkgQ1Z1vGLGoMfRQvcGdBpSgEH");

const MAX_TITLE_LENGTH: usize = 16;
const MAX_DESCRIPTION_LENGTH: usize = 32;
const MAX_EMAIL_LENGTH: usize = 32;
const MAX_NAME_LENGTH: usize = 16;

#[program]
pub mod alyra_sign_presence {
    use super::*;

    pub fn create_session(
        ctx: Context<CreateSession>,
        title: [u8; MAX_TITLE_LENGTH],
        description: [u8; MAX_DESCRIPTION_LENGTH],
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        let session = &mut ctx.accounts.session;
        session.formation = ctx.accounts.formation;
        session.title = title;
        session.description = description;
        session.start_time = start_time as u32;
        session.end_time = end_time as u32;
        session.created_at = Clock::get()?.unix_timestamp as u32;
        Ok(())
    }

    pub fn mark_presence(
        ctx: Context<MarkPresence>,
        session: Pubkey,
    ) -> Result<()> {
        let presence = &mut ctx.accounts.presence;
        presence.student = ctx.accounts.student;
        presence.session = session;
        presence.timestamp = Clock::get()?.unix_timestamp as u32;
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
        event.authority = ctx.accounts.authority.key();
        event.title = title;
        event.description = description;
        event.event_code = event_code;
        event.start_date = start_date;
        event.end_date = end_date;
        event.attendee_count = 0;
        event.created_at = Clock::get()?.unix_timestamp as u32;
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
    /// CHECK: This is safe because we only use the key
    pub formation: AccountInfo<'info>,
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
    /// CHECK: This is safe because we only use the key
    pub student: AccountInfo<'info>,
    /// CHECK: This is safe because we only use the key
    pub session: AccountInfo<'info>,
    #[account(mut)]
    pub student_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateEvent<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Event::LEN,
        seeds = [b"event", authority.key().as_ref()],
        bump
    )]
    pub event: Account<'info, Event>,
    #[account(mut)]
    pub authority: Signer<'info>,
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

#[account]
pub struct Event {
    pub authority: Pubkey,
    pub title: [u8; MAX_TITLE_LENGTH],
    pub description: [u8; MAX_DESCRIPTION_LENGTH],
    pub event_code: [u8; MAX_TITLE_LENGTH],
    pub start_date: i64,
    pub end_date: i64,
    pub attendee_count: u8,
    pub created_at: u32,
}

impl Event {
    pub const LEN: usize = 32 + // authority
        MAX_TITLE_LENGTH + // title
        MAX_DESCRIPTION_LENGTH + // description
        MAX_TITLE_LENGTH + // event_code
        8 + // start_date
        8 + // end_date
        1 + // attendee_count
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

#[account]
pub struct Session {
    pub formation: Pubkey,
    pub title: [u8; MAX_TITLE_LENGTH],
    pub description: [u8; MAX_DESCRIPTION_LENGTH],
    pub start_time: u32,
    pub end_time: u32,
    pub created_at: u32,
}

impl Session {
    pub const LEN: usize = 32 + // formation
        MAX_TITLE_LENGTH + // title
        MAX_DESCRIPTION_LENGTH + // description
        4 + // start_time
        4 + // end_time
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

#[error_code]
pub enum SecurityError {
    #[msg("You are not the expected authority.")]
    WrongAuthority,
} 