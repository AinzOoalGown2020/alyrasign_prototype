'use client'

import { useState } from 'react'
import { FormationCard } from '@/components/formations/FormationCard'
import { FormationModal } from '@/components/formations/FormationModal'
import { useFormations } from '@/hooks/useFormations'
import { Navbar } from '@/components/layout/Navbar'

export default function FormationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFormation, setSelectedFormation] = useState<any>(null)
  const { formations, isLoading, createFormation, updateFormation, deleteFormation, syncFormation } = useFormations()

  const handleCreateFormation = async (data: any) => {
    await createFormation(data)
    setIsModalOpen(false)
  }

  const handleEditFormation = async (data: any) => {
    await updateFormation(selectedFormation.id, data)
    setIsModalOpen(false)
    setSelectedFormation(null)
  }

  const handleDeleteFormation = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      await deleteFormation(id)
    }
  }

  const handleSyncFormation = async (id: string) => {
    await syncFormation(id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Gestion des Formations
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary"
              >
                Créer une Formation
              </button>
              <button
                onClick={() => {/* TODO: Implement sync all */}}
                className="btn bg-secondary-600 text-white hover:bg-secondary-700"
              >
                Synchroniser avec la Blockchain
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chargement des formations...</p>
            </div>
          ) : formations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune formation disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {formations.map((formation) => (
                <FormationCard
                  key={formation.id}
                  formation={formation}
                  onEdit={() => {
                    setSelectedFormation(formation)
                    setIsModalOpen(true)
                  }}
                  onDelete={() => handleDeleteFormation(formation.id)}
                  onSync={() => handleSyncFormation(formation.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <FormationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedFormation(null)
        }}
        onSubmit={selectedFormation ? handleEditFormation : handleCreateFormation}
        initialData={selectedFormation}
        mode={selectedFormation ? 'edit' : 'create'}
      />
    </div>
  )
} 