import { useState, useEffect } from 'react'
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
  const { program, registerAttendee } = useBlockchain()
  const [etudiants, setEtudiants] = useState<Etudiant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchEtudiants = async () => {
      if (!program) {
        setEtudiants([])
        setIsLoading(false)
        return
      }

      try {
        const registeredAttendees = await program.account.registeredAttendee.all()
        setEtudiants(registeredAttendees.map((attendee: any) => ({
          id: attendee.publicKey.toString(),
          walletAddress: attendee.account.attendee.toString(),
          role: 'etudiant',
          isAuthorized: true,
          lastSyncDate: new Date(),
          firstName: attendee.account.firstName,
          lastName: attendee.account.lastName,
          email: attendee.account.email,
        })))
      } catch (error) {
        console.error('Error fetching etudiants:', error)
        setError(error as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEtudiants()
  }, [program])

  const createEtudiant = async (data: EtudiantInput) => {
    if (!program) throw new Error('Program not initialized')

    try {
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

      // Rafraîchir la liste des étudiants
      const registeredAttendees = await program.account.registeredAttendee.all()
      setEtudiants(registeredAttendees.map((attendee: any) => ({
        id: attendee.publicKey.toString(),
        walletAddress: attendee.account.attendee.toString(),
        role: 'etudiant',
        isAuthorized: true,
        lastSyncDate: new Date(),
        firstName: attendee.account.firstName,
        lastName: attendee.account.lastName,
        email: attendee.account.email,
      })))

      return {
        id: Date.now().toString(),
        ...data,
        isAuthorized: true,
        lastSyncDate: new Date(),
      }
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const updateEtudiant = async (id: string, data: EtudiantInput) => {
    try {
      // TODO: Implémenter la mise à jour sur la blockchain
      console.log('Updating etudiant:', id, data)
      return { id, ...data, isAuthorized: true }
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const deleteEtudiant = async (id: string) => {
    try {
      // TODO: Implémenter la suppression sur la blockchain
      console.log('Deleting etudiant:', id)
      return id
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  return {
    etudiants,
    isLoading,
    error,
    createEtudiant,
    updateEtudiant,
    deleteEtudiant,
  }
} 