import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useBlockchain } from './useBlockchain'
import { PublicKey } from '@solana/web3.js'

export interface Formation {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  sessionCount: number
  isSynced: boolean
  lastSyncDate?: Date
  walletAddress?: string
}

export interface FormationInput {
  title: string
  description: string
  startDate: string
  endDate: string
}

export function useFormations() {
  const queryClient = useQueryClient()
  const { program, createEvent } = useBlockchain()

  // Récupération des formations
  const { data: formations = [], isLoading } = useQuery({
    queryKey: ['formations'],
    queryFn: async () => {
      if (!program) return []

      try {
        const events = await program.account.event.all()
        return events.map((event: any) => ({
          id: event.publicKey.toString(),
          title: event.account.title,
          description: 'Description à implémenter',
          startDate: new Date(),
          endDate: new Date(),
          sessionCount: event.account.sessionsCount.toNumber(),
          isSynced: true,
          lastSyncDate: new Date(),
          walletAddress: event.publicKey.toString(),
        }))
      } catch (error) {
        console.error('Error fetching formations:', error)
        return []
      }
    },
    enabled: !!program,
  })

  // Création d'une formation
  const createFormation = useMutation({
    mutationFn: async (data: FormationInput) => {
      const eventId = Date.now()
      const eventCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      await createEvent(eventId, eventCode, data.title)

      return {
        id: eventId.toString(),
        ...data,
        sessionCount: 0,
        isSynced: true,
        lastSyncDate: new Date(),
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
    },
  })

  // Mise à jour d'une formation
  const updateFormation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormationInput }) => {
      // TODO: Implémenter la mise à jour sur la blockchain
      console.log('Updating formation:', id, data)
      return { id, ...data }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
    },
  })

  // Suppression d'une formation
  const deleteFormation = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Implémenter la suppression sur la blockchain
      console.log('Deleting formation:', id)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
    },
  })

  return {
    formations,
    isLoading,
    createFormation: createFormation.mutateAsync,
    updateFormation: (id: string, data: FormationInput) => updateFormation.mutateAsync({ id, data }),
    deleteFormation: deleteFormation.mutateAsync,
  }
} 