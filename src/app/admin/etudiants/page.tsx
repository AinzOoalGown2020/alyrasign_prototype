'use client'

import { useState } from 'react'
import { EtudiantCard } from '@/components/etudiants/EtudiantCard'
import { EtudiantModal } from '@/components/etudiants/EtudiantModal'
import { useEtudiants } from '@/hooks/useEtudiants'
import { Navbar } from '@/components/layout/Navbar'
import { EtudiantInput } from '@/hooks/useEtudiants'

export default function EtudiantsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEtudiant, setSelectedEtudiant] = useState<any>(null)
  const { etudiants, isLoading, createEtudiant, updateEtudiant, deleteEtudiant, syncEtudiants } = useEtudiants()

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Gestion des Étudiants
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
              >
                Ajouter un Étudiant
              </button>
              <button
                onClick={handleSyncEtudiants}
                className="btn bg-secondary-600 text-white hover:bg-secondary-700"
              >
                Synchroniser avec la Blockchain
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chargement des étudiants...</p>
            </div>
          ) : etudiants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun étudiant disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {etudiants.map((etudiant) => (
                <EtudiantCard
                  key={etudiant.id}
                  etudiant={etudiant}
                  onEdit={() => {
                    setSelectedEtudiant(etudiant)
                    setIsModalOpen(true)
                  }}
                  onDelete={() => handleDeleteEtudiant(etudiant.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <EtudiantModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEtudiant(null)
        }}
        onSubmit={selectedEtudiant ? handleEditEtudiant : handleCreateEtudiant}
        initialData={selectedEtudiant}
        mode={selectedEtudiant ? 'edit' : 'create'}
      />
    </div>
  )
} 