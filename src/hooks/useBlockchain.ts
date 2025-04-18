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
  const createFormation = async (formationId: number, title: string, description: string) => {
    if (!program || !publicKey) throw new Error('Program not initialized')

    const [formationPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('formation'), Buffer.from(formationId.toString())],
      programID
    )

    await program.methods
      .createFormation(formationId, title, description)
      .accounts({
        formation: formationPDA,
        authority: publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc()
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
  const registerStudent = async (formationPubkey: PublicKey, firstName: string, lastName: string, email: string) => {
    if (!program || !publicKey) throw new Error('Program not initialized')

    const studentCount = await program.account.formation.fetch(formationPubkey).then(formation => formation.studentCount)

    const [studentPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('student'),
        formationPubkey.toBuffer(),
        publicKey.toBuffer(),
        Buffer.from((studentCount + 1).toString())
      ],
      programID
    )

    await program.methods
      .registerStudent(firstName, lastName, email)
      .accounts({
        student: studentPDA,
        formation: formationPubkey,
        studentWallet: publicKey,
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
    createFormation,
    createSession,
    registerStudent,
    markPresence,
  }
} 