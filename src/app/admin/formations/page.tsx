"use client"

import { useState } from 'react'
import { useFormations } from '@/hooks/useFormations'
import { FormationCard } from '@/components/formations/FormationCard'
import { FormationModal } from '@/components/formations/FormationModal'
import { Formation } from '@/types/formation'

export default function FormationsPage() {
  const { formations, isLoading, error, createFormation, updateFormation, deleteFormation } = useFormations()
  const [selectedFormation, setSelectedFormation] = useState<Formation | undefined>()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreate = () => {
    setSelectedFormation(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (formation: Formation) => {
    setSelectedFormation(formation)
    setIsModalOpen(true)
  }

  const handleSave = async (formationData: Omit<Formation, 'id' | 'sessions'>) => {
    try {
      if (selectedFormation) {
        await updateFormation(selectedFormation.id, formationData)
      } else {
        await createFormation(formationData)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        await deleteFormation(id)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error.message}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Formations</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Nouvelle Formation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formations.map((formation) => (
          <FormationCard
            key={formation.id}
            formation={formation}
            onEdit={() => handleEdit(formation)}
            onDelete={() => handleDelete(formation.id)}
          />
        ))}
      </div>

      {isModalOpen && (
        <FormationModal
          formation={selectedFormation}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
} 