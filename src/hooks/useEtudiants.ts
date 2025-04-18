import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useBlockchain } from './useBlockchain'
import { PublicKey } from '@solana/web3.js'

export interface Etudiant {
  id: string
  walletAddress: string
  role: 'etudiant' | 'formateur'
  isAuthorized: boolean
  lastSyncDate?: Date
  firstName?: string
  lastName?: string
  email?: string
}

export interface EtudiantInput {
  walletAddress: string
  role: 'etudiant' | 'formateur'
  firstName?: string
  lastName?: string
  email?: string
}

// Données de test pour le développement
const mockEtudiants: Etudiant[] = [
  {
    id: '1',
    walletAddress: '79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy',
    role: 'formateur',
    isAuthorized: true,
    lastSyncDate: new Date(),
  },
  {
    id: '2',
    walletAddress: '8xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
    role: 'etudiant',
    isAuthorized: true,
    lastSyncDate: new Date(),
  },
]

export function useEtudiants() {
  const queryClient = useQueryClient()
  const { program, registerAttendee } = useBlockchain()

  // Récupération des étudiants
  const { data: etudiants = [], isLoading } = useQuery({
    queryKey: ['etudiants'],
    queryFn: async () => {
      if (!program) return []

      try {
        const registeredAttendees = await program.account.registeredAttendee.all()
        return registeredAttendees.map((attendee: any) => ({
          id: attendee.publicKey.toString(),
          walletAddress: attendee.account.attendee.toString(),
          role: 'etudiant',
          isAuthorized: true,
          lastSyncDate: new Date(),
          firstName: attendee.account.firstName,
          lastName: attendee.account.lastName,
          email: attendee.account.email,
        }))
      } catch (error) {
        console.error('Error fetching etudiants:', error)
        return []
      }
    },
    enabled: !!program,
  })

  // Création d'un étudiant
  const createEtudiant = useMutation({
    mutationFn: async (data: EtudiantInput) => {
      if (!program) throw new Error('Program not initialized')

      // Pour le développement, nous utilisons la première formation disponible
      const events = await program.account.event.all()
      if (events.length === 0) throw new Error('No events found')

      const eventPubkey = events[0].publicKey

      await registerAttendee(
        eventPubkey,
        data.firstName || '',
        data.lastName || '',
        data.email || ''
      )

      return {
        id: Date.now().toString(),
        ...data,
        isAuthorized: true,
        lastSyncDate: new Date(),
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etudiants'] })
    },
  })

  // Mise à jour d'un étudiant
  const updateEtudiant = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EtudiantInput }) => {
      // TODO: Implémenter la mise à jour sur la blockchain
      console.log('Updating etudiant:', id, data)
      return { id, ...data, isAuthorized: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etudiants'] })
    },
  })

  // Suppression d'un étudiant
  const deleteEtudiant = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Implémenter la suppression sur la blockchain
      console.log('Deleting etudiant:', id)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etudiants'] })
    },
  })

  return {
    etudiants,
    isLoading,
    createEtudiant: createEtudiant.mutateAsync,
    updateEtudiant: (id: string, data: EtudiantInput) => updateEtudiant.mutateAsync({ id, data }),
    deleteEtudiant: deleteEtudiant.mutateAsync,
  }
} 