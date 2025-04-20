import { useState, useEffect } from 'react'
import { useBlockchain } from './useBlockchain'
import { PublicKey } from '@solana/web3.js'

export interface Etudiant {
  id: string
  walletAddress: string
  pseudo: string
  isAuthorized: boolean
  lastSyncDate?: Date
}

export interface EtudiantInput {
  pseudo: string
  walletAddress: string
  role: 'etudiant' | 'formateur'
}

// Données de test pour le développement
const mockEtudiants: Etudiant[] = [
  {
    id: '1',
    walletAddress: '79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy',
    pseudo: 'John Doe',
    isAuthorized: true,
    lastSyncDate: new Date(),
  },
  {
    id: '2',
    walletAddress: '8xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
    pseudo: 'Jane Smith',
    isAuthorized: true,
    lastSyncDate: new Date(),
  },
]

export function useEtudiants() {
  const { program, createStudent } = useBlockchain()
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
        const registeredStudents = await (program as any).account.student.all()
        setEtudiants(registeredStudents.map((student: any) => ({
          id: student.publicKey.toString(),
          walletAddress: student.account.wallet.toString(),
          pseudo: student.account.pseudo,
          isAuthorized: true,
          lastSyncDate: new Date(),
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
    if (!program) {
      console.error('useEtudiants - Erreur: Program non initialisé pour createEtudiant')
      throw new Error('Program not initialized')
    }

    try {
      const studentPDA = await createStudent(data.pseudo, data.walletAddress)

      // Rafraîchir la liste des étudiants
      const registeredStudents = await (program as any).account.student.all()
      setEtudiants(registeredStudents.map((student: any) => ({
        id: student.publicKey.toString(),
        walletAddress: student.account.wallet.toString(),
        pseudo: student.account.pseudo,
        isAuthorized: true,
        lastSyncDate: new Date(),
      })))

      return {
        id: studentPDA.toString(),
        ...data,
        isAuthorized: true,
        lastSyncDate: new Date(),
      }
    } catch (err) {
      console.error('useEtudiants - Erreur lors de la création de l\'étudiant:', err)
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