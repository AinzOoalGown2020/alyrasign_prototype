import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider, web3, utils } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import idl from '../idl/alyra_sign.json'

// ID du programme par défaut depuis Anchor.toml
const DEFAULT_PROGRAM_ID = '9mR7S7u8DeaQwqf6poYMUka2Dp2WjcY1GafPuMUp9GLo'

export function useBlockchain() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  console.log('useBlockchain - État initial:', {
    connection: connection?.rpcEndpoint,
    publicKey: publicKey?.toString(),
    envProgramId: process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID,
    defaultProgramId: DEFAULT_PROGRAM_ID
  })

  const programID = useMemo(() => {
    try {
      const id = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || DEFAULT_PROGRAM_ID
      console.log('useBlockchain - Initialisation programID:', id)
      return new PublicKey(id)
    } catch (error) {
      console.error('useBlockchain - Erreur lors de l\'initialisation du programID:', error)
      // Retourner un PublicKey valide même en cas d'erreur
      return new PublicKey(DEFAULT_PROGRAM_ID)
    }
  }, [])

  const provider = useMemo(() => {
    if (!publicKey) {
      console.log('useBlockchain - Provider non initialisé: pas de publicKey')
      return null
    }
    console.log('useBlockchain - Création du provider avec:', {
      publicKey: publicKey.toString(),
      connection: connection?.rpcEndpoint
    })
    return new AnchorProvider(connection, {
      publicKey,
      signTransaction: async (tx: web3.Transaction) => {
        console.log('useBlockchain - Signature de transaction')
        const signedTx = await sendTransaction(tx, connection)
        console.log('useBlockchain - Transaction signée:', signedTx)
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
    if (!provider) {
      console.log('useBlockchain - Program non initialisé: pas de provider')
      return null
    }
    try {
      console.log('useBlockchain - Création du program avec:', {
        programId: programID.toString(),
        idl: idl.name
      })
      return new Program(idl as any, programID, provider)
    } catch (error) {
      console.error('useBlockchain - Erreur lors de la création du program:', error)
      return null
    }
  }, [provider, programID])

  // Création d'une formation
  const createFormation = async (formationId: number, title: string, description: string) => {
    console.log('useBlockchain - Création formation:', { formationId, title, description })
    if (!program || !publicKey) {
      console.error('useBlockchain - Erreur: Program non initialisé pour createFormation')
      throw new Error('Program not initialized')
    }

    const [formationPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('formation'), Buffer.from(formationId.toString())],
      programID
    )
    console.log('useBlockchain - PDA Formation:', formationPDA.toString())

    try {
      const tx = await program.methods
        .createFormation(formationId, title, description)
        .accounts({
          formation: formationPDA,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc()
      console.log('useBlockchain - Formation créée avec succès:', tx)
    } catch (error) {
      console.error('useBlockchain - Erreur lors de la création de la formation:', error)
      throw error
    }
  }

  // Création d'une session
  const createSession = async (formationPubkey: PublicKey, sessionId: number, title: string, startAt: number, endAt: number) => {
    if (!program || !publicKey) throw new Error('Program not initialized')

    const [sessionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('session'), formationPubkey.toBuffer(), Buffer.from(sessionId.toString())],
      programID
    )

    await program.methods
      .createSession(sessionId, title, startAt, endAt)
      .accounts({
        session: sessionPDA,
        formation: formationPubkey,
        authority: publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()
  }

  // Enregistrement d'un étudiant
  const registerAttendee = async (eventPubkey: PublicKey, firstName: string, lastName: string, email: string) => {
    if (!program || !publicKey) throw new Error('Program not initialized')

    const [attendeePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('attendee'), eventPubkey.toBuffer(), publicKey.toBuffer()],
      programID
    )

    await program.methods
      .registerAttendee(firstName, lastName, email)
      .accounts({
        attendee: attendeePDA,
        event: eventPubkey,
        attendeeWallet: publicKey,
        signer: publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()
  }

  // Marquer une présence
  const markPresence = async (sessionPubkey: PublicKey, formationPubkey: PublicKey) => {
    if (!program || !publicKey) throw new Error('Program not initialized')

    const [studentPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('student'), formationPubkey.toBuffer(), publicKey.toBuffer()],
      programID
    )

    const [presencePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('presence'), sessionPubkey.toBuffer(), publicKey.toBuffer()],
      programID
    )

    await program.methods
      .markPresence()
      .accounts({
        presence: presencePDA,
        session: sessionPubkey,
        student: studentPDA,
        studentWallet: publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()
  }

  return {
    program,
    provider,
    createFormation,
    createSession,
    registerAttendee,
    markPresence,
  }
} 