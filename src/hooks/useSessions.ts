import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useBlockchain } from './useBlockchain'
import { PublicKey } from '@solana/web3.js'

export interface Session {
  id: string
  title: string
  date: Date
  startTime: string
  endTime: string
  formationId: string
}

export interface SessionInput {
  title: string
  date: string
  startTime: string
  endTime: string
}

export function useSessions(formationId: string) {
  const queryClient = useQueryClient()
  const { program, createSession } = useBlockchain()

  // Récupération des sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', formationId],
    queryFn: async () => {
      if (!program) return []

      try {
        const eventPubkey = new PublicKey(formationId)
        const sessions = await program.account.session.all([
          {
            memcmp: {
              offset: 32, // Position du champ event dans la structure Session
              bytes: eventPubkey.toBase58(),
            },
          },
        ])

        return sessions.map((session: any) => ({
          id: session.publicKey.toString(),
          title: session.account.title,
          date: new Date(session.account.startAt * 1000),
          startTime: new Date(session.account.startAt * 1000).toLocaleTimeString(),
          endTime: new Date(session.account.endAt * 1000).toLocaleTimeString(),
          formationId: session.account.event.toString(),
        }))
      } catch (error) {
        console.error('Error fetching sessions:', error)
        return []
      }
    },
    enabled: !!program && !!formationId,
  })

  // Création d'une session
  const createSessionMutation = useMutation({
    mutationFn: async (data: SessionInput) => {
      const sessionId = Date.now()
      const startAt = Math.floor(new Date(`${data.date} ${data.startTime}`).getTime() / 1000)
      const endAt = Math.floor(new Date(`${data.date} ${data.endTime}`).getTime() / 1000)

      await createSession(
        new PublicKey(formationId),
        sessionId,
        data.title,
        startAt,
        endAt
      )

      return {
        id: sessionId.toString(),
        ...data,
        formationId,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', formationId] })
    },
  })

  // Mise à jour d'une session
  const updateSession = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SessionInput }) => {
      // TODO: Implémenter la mise à jour sur la blockchain
      console.log('Updating session:', id, data)
      return { id, ...data, formationId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', formationId] })
    },
  })

  // Suppression d'une session
  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Implémenter la suppression sur la blockchain
      console.log('Deleting session:', id)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', formationId] })
    },
  })

  return {
    sessions,
    isLoading,
    createSession: createSessionMutation.mutateAsync,
    updateSession: (id: string, data: SessionInput) => updateSession.mutateAsync({ id, data }),
    deleteSession: deleteSession.mutateAsync,
  }
} 