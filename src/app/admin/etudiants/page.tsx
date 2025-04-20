'use client'

import { useState } from 'react'
import { EtudiantModal } from '@/components/etudiants/EtudiantModal'
import { useEtudiants } from '@/hooks/useEtudiants'
import { EtudiantInput } from '@/hooks/useEtudiants'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConfirm } from '@/hooks/useConfirm'

export default function EtudiantsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { etudiants, isLoading, createEtudiant, deleteEtudiant, error } = useEtudiants()
  const { connected, publicKey } = useWallet()
  const { confirm } = useConfirm()

  const handleCreateEtudiant = async (data: EtudiantInput) => {
    if (!connected || !publicKey) {
      setErrorMessage('Veuillez vous connecter avec votre wallet avant d\'ajouter un étudiant')
      return
    }
    
    try {
      setErrorMessage(null)
      await createEtudiant(data)
      setIsModalOpen(false)
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'étudiant:', err)
      if (err instanceof Error) {
        if (err.message.includes('Solde administrateur insuffisant')) {
          setErrorMessage('Solde administrateur insuffisant. Veuillez ajouter des SOL à votre wallet.')
        } else if (err.message.includes('Solde étudiant insuffisant')) {
          setErrorMessage('Le wallet de l\'étudiant n\'a pas assez de SOL. Veuillez lui transférer des SOL avant de l\'ajouter.')
        } else {
          setErrorMessage('Erreur lors de l\'ajout de l\'étudiant. Veuillez vérifier que votre wallet est connecté et que le programme est initialisé.')
        }
      } else {
        setErrorMessage('Une erreur inattendue est survenue.')
      }
    }
  }

  const handleDeleteEtudiant = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      await deleteEtudiant(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestion des Étudiants</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          Ajouter un Étudiant
        </button>
      </div>

      {isLoading && <p className="text-white">Chargement...</p>}
      {error && <p className="text-red-500">Erreur: {error.message}</p>}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Attention!</strong>
          <span className="block sm:inline"> {errorMessage}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {etudiants?.map((etudiant) => (
          <div key={etudiant.id} className="card bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {etudiant.pseudo}
                </h2>
                <p className="text-gray-300 text-sm">
                  {etudiant.walletAddress}
                </p>
              </div>
              <button
                onClick={() => handleDeleteEtudiant(etudiant.id)}
                className="text-red-500 hover:text-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      <EtudiantModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setErrorMessage(null)
        }}
        onSubmit={handleCreateEtudiant}
        mode="create"
      />
    </div>
  )
} 