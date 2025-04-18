import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()

  const { data: formations = [], isLoading } = useQuery({
    queryKey: ['formations'],
    queryFn: async () => {
      if (!program) return []
      
      const formations = await program.account.formation.all()
      return formations.map(formation => ({
        pubkey: formation.publicKey,
        id: formation.account.id,
        title: formation.account.title,
        description: formation.account.description,
        studentCount: formation.account.studentCount,
        createdAt: formation.account.createdAt,
      }))
    },
  })

  const createFormation = useMutation({
    mutationFn: async (input: FormationInput) => {
      if (!program) throw new Error('Program not initialized')
      await program.methods.createFormation(input.id, input.title, input.description)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
    },
  })

  const updateFormation = useMutation({
    mutationFn: async ({ pubkey, input }: { pubkey: PublicKey, input: FormationInput }) => {
      if (!program) throw new Error('Program not initialized')
      await program.methods.updateFormation(input.title, input.description)
        .accounts({
          formation: pubkey,
        })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
    },
  })

  const deleteFormation = useMutation({
    mutationFn: async (pubkey: PublicKey) => {
      if (!program) throw new Error('Program not initialized')
      await program.methods.deleteFormation()
        .accounts({
          formation: pubkey,
        })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
    },
  })

  return {
    formations,
    isLoading,
    createFormation,
    updateFormation,
    deleteFormation,
  }
} 