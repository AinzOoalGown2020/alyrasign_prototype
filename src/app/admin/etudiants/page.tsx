'use client'

import { useState } from 'react'
import { EtudiantCard } from '@/components/etudiants/EtudiantCard'
import { EtudiantModal } from '@/components/etudiants/EtudiantModal'
import { useEtudiants } from '@/hooks/useEtudiants'
import { EtudiantInput } from '@/hooks/useEtudiants'

export default function EtudiantsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEtudiant, setSelectedEtudiant] = useState<any>(null)
  const { etudiants, isLoading, createEtudiant, updateEtudiant, deleteEtudiant, syncEtudiants, error } = useEtudiants()

  const handleCreateEtudiant = async (data: EtudiantInput) => {
    await createEtudiant(data)
    setIsModalOpen(false)
  }

  const handleEditEtudiant = async (data: EtudiantInput) => {
    await updateEtudiant(selectedEtudiant.id, data)
    setIsModalOpen(false)
    setSelectedEtudiant(null)
  }

  const handleDeleteEtudiant = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      await deleteEtudiant(id)
    }
  }

  const handleSyncEtudiants = async () => {
    await syncEtudiants()
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {etudiants?.map((etudiant) => (
          <div key={etudiant.id} className="card">
            <h2 className="text-xl font-semibold text-white mb-2">
              {etudiant.firstName} {etudiant.lastName}
            </h2>
            <p className="text-gray-300">{etudiant.email}</p>
          </div>
        ))}
      </div>

      <EtudiantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
} 