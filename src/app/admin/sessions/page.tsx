'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SessionCard } from '@/components/sessions/SessionCard'
import { SessionModal } from '@/components/sessions/SessionModal'
import { useSessions } from '@/hooks/useSessions'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'

export default function SessionsPage() {
  const searchParams = useSearchParams()
  const formationId = searchParams.get('formationId')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const { sessions, formation, isLoading, createSession, updateSession, deleteSession } = useSessions(formationId)

  const handleCreateSession = async (data: any) => {
    await createSession(data)
    setIsModalOpen(false)
  }

  const handleEditSession = async (data: any) => {
    await updateSession(selectedSession.id, data)
    setIsModalOpen(false)
    setSelectedSession(null)
  }

  const handleDeleteSession = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      await deleteSession(id)
    }
  }

  if (!formationId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune formation sélectionnée</p>
            <Link href="/admin/formations" className="text-primary-600 hover:text-primary-700">
              Retour aux formations
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center mb-6">
            <Link
              href="/admin/formations"
              className="text-primary-600 hover:text-primary-700 mr-4"
            >
              ← Retour aux formations
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">
              Sessions de la formation
            </h1>
          </div>

          {formation && (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-medium text-gray-900">{formation.title}</h2>
              <p className="text-sm text-gray-500">
                Du {formation.startDate.toLocaleDateString()} au {formation.endDate.toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              Créer une Session
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chargement des sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune session disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onEdit={() => {
                    setSelectedSession(session)
                    setIsModalOpen(true)
                  }}
                  onDelete={() => handleDeleteSession(session.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <SessionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSession(null)
        }}
        onSubmit={selectedSession ? handleEditSession : handleCreateSession}
        initialData={selectedSession}
        formationId={formationId}
        mode={selectedSession ? 'edit' : 'create'}
      />
    </div>
  )
} 