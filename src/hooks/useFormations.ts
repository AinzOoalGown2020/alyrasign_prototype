import { useState, useEffect } from 'react'
import { useBlockchain } from './useBlockchain'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'

export interface Formation {
  pubkey: PublicKey
  id: number
  title: string
  description: string
  studentCount: number
  createdAt: number
}

export interface FormationInput {
  id: number
  title: string
  description: string
  startDate: Date
  endDate: Date
}

export function useFormations() {
  const { program } = useBlockchain()
  const [formations, setFormations] = useState<Formation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchFormations = async () => {
      if (!program) {
        setFormations([])
        setIsLoading(false)
        return
      }

      try {
        const formations = await program.account.formation.all()
        setFormations(formations.map(formation => ({
          pubkey: formation.publicKey,
          id: formation.account.id,
          title: formation.account.title,
          description: formation.account.description,
          studentCount: formation.account.studentCount,
          createdAt: formation.account.createdAt,
        })))
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFormations()
  }, [program])

  const createFormation = async (input: FormationInput) => {
    if (!program) throw new Error('Program not initialized')
    try {
      // Convertir les dates en timestamps
      const startDate = new BN(Math.floor(input.startDate.getTime() / 1000))
      const endDate = new BN(Math.floor(input.endDate.getTime() / 1000))

      // Convertir les chaînes en tableaux de bytes
      const titleBytes = Buffer.from(input.title.padEnd(32, '\0'))
      const descriptionBytes = Buffer.from(input.description.padEnd(64, '\0'))

      await program.methods
        .createFormation(
          Array.from(titleBytes),
          Array.from(descriptionBytes),
          startDate,
          endDate
        )
        .accounts({
          formation: program.programId,
          authority: program.provider.publicKey,
          systemProgram: program.programId,
        })
        .rpc()

      // Rafraîchir la liste des formations
      const formations = await program.account.formation.all()
      setFormations(formations.map(formation => ({
        pubkey: formation.publicKey,
        id: formation.account.id,
        title: formation.account.title,
        description: formation.account.description,
        studentCount: formation.account.studentCount,
        createdAt: formation.account.createdAt,
      })))
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const updateFormation = async ({ pubkey, input }: { pubkey: PublicKey, input: FormationInput }) => {
    if (!program) throw new Error('Program not initialized')
    try {
      // Convertir les dates en timestamps
      const startDate = new BN(Math.floor(input.startDate.getTime() / 1000))
      const endDate = new BN(Math.floor(input.endDate.getTime() / 1000))

      // Convertir les chaînes en tableaux de bytes
      const titleBytes = Buffer.from(input.title.padEnd(32, '\0'))
      const descriptionBytes = Buffer.from(input.description.padEnd(64, '\0'))

      await program.methods
        .updateFormation(
          Array.from(titleBytes),
          Array.from(descriptionBytes),
          startDate,
          endDate
        )
        .accounts({
          formation: pubkey,
        })
        .rpc()

      // Rafraîchir la liste des formations
      const formations = await program.account.formation.all()
      setFormations(formations.map(formation => ({
        pubkey: formation.publicKey,
        id: formation.account.id,
        title: formation.account.title,
        description: formation.account.description,
        studentCount: formation.account.studentCount,
        createdAt: formation.account.createdAt,
      })))
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const deleteFormation = async (pubkey: PublicKey) => {
    if (!program) throw new Error('Program not initialized')
    try {
      await program.methods.deleteFormation()
        .accounts({
          formation: pubkey,
        })
        .rpc()

      // Rafraîchir la liste des formations
      const formations = await program.account.formation.all()
      setFormations(formations.map(formation => ({
        pubkey: formation.publicKey,
        id: formation.account.id,
        title: formation.account.title,
        description: formation.account.description,
        studentCount: formation.account.studentCount,
        createdAt: formation.account.createdAt,
      })))
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  return {
    formations,
    isLoading,
    error,
    createFormation,
    updateFormation,
    deleteFormation,
  }
} 