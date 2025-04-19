import { useState, useEffect } from 'react'
import { useBlockchain } from './useBlockchain'
import { PublicKey } from '@solana/web3.js'

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
      await program.methods.createFormation(input.id, input.title, input.description)
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
      await program.methods.updateFormation(input.title, input.description)
        .accounts({
          formation: pubkey,
        })
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