"use client"

import { useState, useEffect } from 'react'
import { useFormations } from '@/hooks/useFormations'
import { FormationCard } from '@/components/formations/FormationCard'
import { FormationModal } from '@/components/formations/FormationModal'
import { Formation } from '@/types/formation'
import { useFormationStore } from '@/stores/formationStore'

export default function FormationsPage() {
  const { formations: blockchainFormations, isLoading, error, createFormation, updateFormation, deleteFormation } = useFormations()
  const { formations: localFormations, addFormation, updateLocalFormation, deleteLocalFormation, syncAllFormations } = useFormationStore()
  const [selectedFormation, setSelectedFormation] = useState<Formation | undefined>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Charger les formations de la blockchain au chargement de la page
  useEffect(() => {
    // Les formations de la blockchain sont déjà chargées par useFormations
  }, [])

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
        // Mise à jour locale
        updateLocalFormation({
          ...selectedFormation,
          ...formationData,
        })
      } else {
        // Création locale
        addFormation({
          ...formationData,
          id: crypto.randomUUID(),
          sessions: [],
        })
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        deleteLocalFormation(id)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const handleSyncAll = async () => {
    setIsSyncing(true)
    try {
      await syncAllFormations()
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const hasUnsyncedFormations = localFormations.some(f => !f.isSynced)

  if (isLoading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error.message}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Formations</h1>
        <div className="flex gap-4">
          {hasUnsyncedFormations && (
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
            </button>
          )}
          <button
            onClick={handleCreate}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Nouvelle Formation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localFormations.map((formation) => (
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