import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Program, AnchorProvider, web3, utils } from '@coral-xyz/anchor'
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js'
import { useMemo, useState, useEffect } from 'react'
import BN from 'bn.js'

// Import de l'IDL
const idl = require('../idl/alyra_sign.json')
type AlyraSignProgram = Program<typeof idl>

// ID du programme déployé sur la blockchain
const PROGRAM_ID = process.env.NEXT_PUBLIC_ALYRA_SIGN_PROGRAM_ID || 'v69C2KjiWjhUcRTKuotEY1E1PykP4oUtFaBE8ZCg5yJ'

// Constantes pour les soldes minimums
const MIN_ADMIN_BALANCE = 0.1 // 0.1 SOL minimum pour l'admin
const MIN_STUDENT_BALANCE = 0.05 // 0.05 SOL minimum pour l'étudiant

export function useBlockchain() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [program, setProgram] = useState<AlyraSignProgram | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour vérifier les soldes
  const checkBalances = async (studentPubkey: PublicKey) => {
    try {
      // Vérification du solde de l'admin
      const adminBalance = await connection.getBalance(wallet.publicKey!)
      if (adminBalance < MIN_ADMIN_BALANCE * LAMPORTS_PER_SOL) {
        throw new Error(`Solde administrateur insuffisant. Minimum requis: ${MIN_ADMIN_BALANCE} SOL`)
      }

      // Vérification du solde de l'étudiant
      const studentBalance = await connection.getBalance(studentPubkey)
      if (studentBalance < MIN_STUDENT_BALANCE * LAMPORTS_PER_SOL) {
        throw new Error(`Solde étudiant insuffisant. Minimum requis: ${MIN_STUDENT_BALANCE} SOL`)
      }

      return true
    } catch (err) {
      console.error('useBlockchain - Erreur lors de la vérification des soldes:', err)
      throw err
    }
  }

  useEffect(() => {
    const initializeProgram = async () => {
      try {
        if (!wallet.publicKey || !connection) {
          console.log('useBlockchain - Wallet ou connection non disponible')
          return
        }

        console.log('useBlockchain - État initial:', JSON.stringify({
          wallet: wallet.publicKey.toString(),
          connection: connection.rpcEndpoint,
          walletConnected: wallet.connected,
          walletPublicKey: wallet.publicKey?.toBase58()
        }, null, 2))

        // Création du provider avec une configuration plus robuste
        const provider = new (AnchorProvider as any)(
          connection,
          wallet as any,
          { 
            commitment: 'confirmed',
            preflightCommitment: 'confirmed'
          }
        )

        // Création du programme
        const program = new (Program as any)(
          idl,
          PROGRAM_ID,
          provider
        )

        setProgram(program)
        setError(null)
      } catch (err) {
        console.error('useBlockchain - Erreur lors de l\'initialisation:', JSON.stringify({
          name: err.name,
          message: err.message,
          stack: err.stack,
          cause: err.cause,
          code: err.code
        }, null, 2))
        console.error('useBlockchain - Détails:', JSON.stringify({
          wallet: wallet.publicKey?.toString(),
          connection: connection?.rpcEndpoint,
          programId: PROGRAM_ID,
          idlLoaded: !!idl,
          idlVersion: idl?.version,
          idlName: idl?.name
        }, null, 2))
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      }
    }

    initializeProgram()
  }, [wallet, connection])

  // Création d'une formation
  const createFormation = async (formationId: number, title: string, description: string) => {
    console.log('useBlockchain - Création formation:', { formationId, title, description })
    if (!program || !wallet.publicKey) {
      console.error('useBlockchain - Erreur: Program non initialisé pour createFormation')
      throw new Error('Program not initialized')
    }

    // Convertir les chaînes en tableaux de bytes
    const titleBytes = Buffer.from(title.padEnd(32, '\0'))
    const descriptionBytes = Buffer.from(description.padEnd(64, '\0'))
    
    // Définir les dates de début et de fin
    const startDate = new BN(Math.floor(Date.now() / 1000))
    const endDate = new BN(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60) // 30 jours plus tard

    const [formationPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('formation'), Buffer.from(formationId.toString())],
      new PublicKey(PROGRAM_ID)
    )
    console.log('useBlockchain - PDA Formation:', formationPDA.toString())

    try {
      const tx = await (program as any).methods
        .createFormation(
          Array.from(titleBytes),
          Array.from(descriptionBytes),
          startDate,
          endDate
        )
        .accounts({
          formation: formationPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      console.log('useBlockchain - Formation créée avec succès:', tx)
      return tx
    } catch (error) {
      console.error('useBlockchain - Erreur lors de la création de la formation:', error)
      throw error
    }
  }

  // Création d'une session
  const createSession = async (formationPubkey: PublicKey, sessionId: number, title: string, startAt: number, endAt: number) => {
    if (!program || !wallet.publicKey) throw new Error('Program not initialized')

    const [sessionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('session'), formationPubkey.toBuffer(), Buffer.from(sessionId.toString())],
      new PublicKey(PROGRAM_ID)
    )

    await (program as any).methods
      .createSession(sessionId, title, startAt, endAt)
      .accounts({
        session: sessionPDA,
        formation: formationPubkey,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()
  }

  // Création d'un événement
  const createEvent = async (title: string, description: string, eventCode: string, startDate: number, endDate: number) => {
    console.log('useBlockchain - Début createEvent:', {
      title,
      description,
      eventCode,
      startDate,
      endDate,
      walletConnected: !!wallet.publicKey
    })

    if (!program || !wallet.publicKey) {
      console.error('useBlockchain - Erreur: wallet non connecté ou programme non initialisé')
      throw new Error('Program not initialized or wallet not connected')
    }

    const [eventPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('event'), Buffer.from(eventCode)],
      new PublicKey(PROGRAM_ID)
    )

    console.log('useBlockchain - PDA Event:', eventPDA.toString())

    try {
      const tx = await (program as any).methods
        .createEvent(title, description, eventCode, startDate, endDate)
        .accounts({
          event: eventPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      
      console.log('useBlockchain - Événement créé avec succès:', tx)
      return { tx, eventPDA }
    } catch (error) {
      console.error('useBlockchain - Erreur lors de la création de l\'événement:', error)
      throw error
    }
  }

  // Enregistrement d'un étudiant
  const registerAttendee = async (eventPubkey: PublicKey, firstName: string, lastName: string, email: string) => {
    console.log('useBlockchain - Début registerAttendee:', {
      eventPubkey: eventPubkey.toString(),
      firstName,
      lastName,
      email,
      walletConnected: !!wallet.publicKey
    })

    if (!program || !wallet.publicKey) {
      console.error('useBlockchain - Erreur: wallet non connecté ou programme non initialisé')
      throw new Error('Program not initialized or wallet not connected')
    }

    // Vérifier si l'événement existe
    try {
      const eventAccount = await (program as any).account.event.fetch(eventPubkey)
      console.log('useBlockchain - Événement trouvé:', eventAccount)
    } catch (error) {
      console.error('useBlockchain - Erreur: événement non trouvé')
      throw new Error('Événement non trouvé')
    }

    const [attendeePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('attendee'), eventPubkey.toBuffer(), wallet.publicKey.toBuffer()],
      new PublicKey(PROGRAM_ID)
    )

    console.log('useBlockchain - PDA Attendee:', attendeePDA.toString())

    try {
      const tx = await (program as any).methods
        .registerAttendee(firstName, lastName, email)
        .accounts({
          attendee: attendeePDA,
          event: eventPubkey,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      
      console.log('useBlockchain - Étudiant enregistré avec succès:', tx)
      return { tx, attendeePDA }
    } catch (error) {
      console.error('useBlockchain - Erreur lors de l\'enregistrement de l\'étudiant:', error)
      throw error
    }
  }

  // Marquer une présence
  const markPresence = async (sessionPubkey: PublicKey, formationPubkey: PublicKey) => {
    if (!program || !wallet.publicKey) {
      throw new Error('Program or wallet not initialized')
    }

    try {
      const [studentPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('student'), formationPubkey.toBuffer(), wallet.publicKey.toBuffer()],
        new PublicKey(PROGRAM_ID)
      )

      const [presencePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('presence'), sessionPubkey.toBuffer(), studentPDA.toBuffer()],
        new PublicKey(PROGRAM_ID)
      )

      const tx = await (program as any).methods
        .markPresence()
        .accounts({
          presence: presencePDA,
          session: sessionPubkey,
          student: studentPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      return { tx, presencePDA }
    } catch (error) {
      console.error('Error marking presence:', error)
      throw error
    }
  }

  // Initialisation du Storage
  const initializeStorage = async () => {
    console.log('useBlockchain - Début initializeStorage')
    if (!program || !wallet.publicKey) {
      console.error('useBlockchain - Erreur: Program non initialisé pour initializeStorage')
      throw new Error('Program not initialized')
    }

    const [storagePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('storage')],
      new PublicKey(PROGRAM_ID)
    )
    console.log('useBlockchain - PDA Storage:', storagePDA.toString())

    try {
      const tx = await (program as any).methods
        .initializeStorage()
        .accounts({
          storage: storagePDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
      console.log('useBlockchain - Storage initialisé avec succès:', tx)
      return { tx, storagePDA }
    } catch (error) {
      console.error('useBlockchain - Erreur lors de l\'initialisation du storage:', error)
      throw error
    }
  }

  // Création d'un étudiant
  const createStudent = async (pseudo: string, walletAddress: string) => {
    if (!program || !wallet.publicKey) {
      throw new Error('Program or wallet not initialized')
    }

    try {
      const studentWallet = new PublicKey(walletAddress)
      const [studentPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('student'), wallet.publicKey.toBuffer(), studentWallet.toBuffer()],
        new PublicKey(PROGRAM_ID)
      )

      const tx = await (program as any).methods
        .createStudent(pseudo)
        .accounts({
          student: studentPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      console.log('useBlockchain - Transaction créée:', tx)
      console.log('useBlockchain - Compte étudiant créé avec succès')

      // 8. Vérification finale du PDA créé
      const createdAccount = await (program as any).account.student.fetch(studentPDA)
      console.log('useBlockchain - Vérification du PDA créé:', {
        pda: studentPDA.toString(),
        account: createdAccount
      })

      return { tx, studentPDA }
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    }
  }

  return {
    program,
    error,
    connection,
    wallet: wallet.publicKey,
    createFormation,
    createSession,
    createEvent,
    registerAttendee,
    markPresence,
    initializeStorage,
    createStudent,
  }
} 