import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider, web3, utils } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import idl from '../idl/alyra_sign.json'

const programID = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || '')

export function useBlockchain() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const provider = useMemo(() => {
    if (!publicKey) return null
    return new AnchorProvider(connection, {
      publicKey,
      signTransaction: async (tx: web3.Transaction) => {
        const signedTx = await sendTransaction(tx, connection)
        return {
          signature: signedTx,
          publicKey,
        }
      },
    }, {
      commitment: 'confirmed',
    })
  }, [connection, publicKey, sendTransaction])

  const program = useMemo(() => {
    if (!provider) return null
    return new Program(idl as any, programID, provider)
  }, [provider])

  // Création d'une formation
  const createEvent = async (eventId: number, eventCode: string, title: string) => {
    if (!program || !publicKey) throw new Error('Program not initialized')

    const [registryPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('alyra_sign'), publicKey.toBuffer()],
      programID
    )

    const [eventPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('event'), Buffer.from(eventId.toString())],
      programID
    )

    await program.methods
      .createEvent(eventId, eventCode, title)
      .accounts({
        event: eventPDA,
        registry: registryPDA,
        authority: publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()
  }

  // Création d'une session
  const createSession = async (eventPubkey: PublicKey, sessionId: number, title: string, startAt: number, endAt: number) => {
    if (!program || !publicKey) throw new Error('Program not initialized')

    const [sessionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('session'), eventPubkey.toBuffer(), Buffer.from(sessionId.toString())],
      programID
    )

    await program.methods
      .createSession(sessionId, title, startAt, endAt)
      .accounts({
        session: sessionPDA,
        event: eventPubkey,
        authority: publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()
  }

  // Enregistrement d'un étudiant
  const registerAttendee = async (eventPubkey: PublicKey, firstName: string, lastName: string, email: string) => {
    if (!program || !publicKey) throw new Error('Program not initialized')

    const attendeeCount = await program.account.event.fetch(eventPubkey).then(event => event.attendeesCount)

    const [registeredAttendeePDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('registered_attendee'),
        eventPubkey.toBuffer(),
        publicKey.toBuffer(),
        Buffer.from((attendeeCount + 1).toString())
      ],
      programID
    )

    await program.methods
      .registerAttendee(firstName, lastName, email)
      .accounts({
        registeredAttendee: registeredAttendeePDA,
        event: eventPubkey,
        attendee: publicKey,
        signer: publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()
  }

  // Enregistrement d'une présence
  const createClockin = async (sessionPubkey: PublicKey, eventPubkey: PublicKey) => {
    if (!program || !publicKey) throw new Error('Program not initialized')

    const [registeredAttendeePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('registered_attendee'), eventPubkey.toBuffer(), publicKey.toBuffer()],
      programID
    )

    await program.methods
      .createClockin()
      .accounts({
        session: sessionPubkey,
        registeredAttendee: registeredAttendeePDA,
        attendee: publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()
  }

  return {
    program,
    createEvent,
    createSession,
    registerAttendee,
    createClockin,
  }
} 