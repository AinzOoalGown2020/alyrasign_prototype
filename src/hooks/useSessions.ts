import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useBlockchain } from './useBlockchain'
import { PublicKey } from '@solana/web3.js'

export interface Session {
  pubkey: PublicKey
  id: number
  formationPubkey: PublicKey
  title: string
  description: string
  startTime: number
  endTime: number
  studentCount: number
  createdAt: number
}

export interface SessionInput {
  id: number
  formationPubkey: PublicKey
  title: string
  description: string
  startTime: number
  endTime: number
}

export function useSessions() {
  const { program } = useBlockchain()
  const queryClient = useQueryClient()

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      if (!program) return []
      
      const sessions = await program.account.session.all()
      return sessions.map(session => ({
        pubkey: session.publicKey,
        id: session.account.id,
        formationPubkey: session.account.formation,
        title: session.account.title,
        description: session.account.description,
        startTime: session.account.startTime,
        endTime: session.account.endTime,
        studentCount: session.account.studentCount,
        createdAt: session.account.createdAt,
      }))
    },
  })

  const createSession = useMutation({
    mutationFn: async (input: SessionInput) => {
      if (!program) throw new Error('Program not initialized')
      await program.methods.createSession(
        input.id,
        input.title,
        input.description,
        input.startTime,
        input.endTime
      )
      .accounts({
        formation: input.formationPubkey,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const updateSession = useMutation({
    mutationFn: async ({ pubkey, input }: { pubkey: PublicKey, input: Omit<SessionInput, 'formationPubkey'> }) => {
      if (!program) throw new Error('Program not initialized')
      await program.methods.updateSession(
        input.title,
        input.description,
        input.startTime,
        input.endTime
      )
      .accounts({
        session: pubkey,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  const deleteSession = useMutation({
    mutationFn: async (pubkey: PublicKey) => {
      if (!program) throw new Error('Program not initialized')
      await program.methods.deleteSession()
        .accounts({
          session: pubkey,
        })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
    },
  })

  return {
    sessions,
    isLoading,
    createSession,
    updateSession,
    deleteSession,
  }
} 