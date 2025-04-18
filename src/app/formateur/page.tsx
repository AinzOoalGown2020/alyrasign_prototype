'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { redirect } from 'next/navigation'
import { useFormationStore } from '@/stores/formationStore'
import { FormationCard } from '@/components/formations/FormationCard'
import { FormationModal } from '@/components/formations/FormationModal'
import { Formation } from '@/types/formation'

export default function FormateurPage() {
  const { wallet } = useWallet()
  const [showModal, setShowModal] = useState(false)
  const [selectedFormation, setSelectedFormation] = useState<Formation | undefined>()
  
  const { formations, addFormation, updateFormation, deleteFormation } = useFormationStore()

  if (!wallet) {
    redirect('/')
  }

  const handleCreateFormation = () => {
    setSelectedFormation(undefined)
    setShowModal(true)
  }

  const handleEditFormation = (formation: Formation) => {
    setSelectedFormation(formation)
    setShowModal(true)
  }

  const handleSaveFormation = (formationData: Omit<Formation, 'id' | 'sessions'>) => {
    if (selectedFormation) {
      updateFormation({
        ...selectedFormation,
        ...formationData,
      })
    } else {
      addFormation({
        ...formationData,
        id: crypto.randomUUID(),
        sessions: [],
      })
    }
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Portail Formateur
        </h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleCreateFormation}
        >
          Créer une Formation
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formations.map((formation) => (
          <FormationCard
            key={formation.id}
            formation={formation}
            onEdit={() => handleEditFormation(formation)}
            onDelete={() => deleteFormation(formation.id)}
            onManageSessions={() => {/* TODO: Implémenter la gestion des sessions */}}
          />
        ))}
      </div>

      {showModal && (
        <FormationModal
          formation={selectedFormation}
          onSave={handleSaveFormation}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
} 