'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { redirect } from 'next/navigation'
import { useFormationStore } from '@/stores/formationStore'
import { SessionCard } from '@/components/sessions/SessionCard'
import { SessionModal } from '@/components/sessions/SessionModal'
import Link from 'next/link'
import { Session } from '@/types/formation'

export default function SessionsPage({
  searchParams,
}: {
  searchParams: { formationId: string }
}) {
  const { wallet } = useWallet()
  const [showModal, setShowModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | undefined>()
  
  const { formations, addSession, updateSession, deleteSession } = useFormationStore()
  
  const formation = formations.find((f) => f.id === searchParams.formationId)

  if (!wallet || !formation) {
    redirect('/formateur')
  }

  const handleCreateSession = () => {
    setSelectedSession(undefined)
    setShowModal(true)
  }

  const handleEditSession = (session: Session) => {
    setSelectedSession(session)
    setShowModal(true)
  }

  const handleSaveSession = (sessionData: Omit<Session, 'id' | 'presences'>) => {
    if (selectedSession) {
      updateSession(formation.id, {
        ...selectedSession,
        ...sessionData,
      })
    } else {
      addSession(formation.id, {
        ...sessionData,
        id: crypto.randomUUID(),
        presences: [],
      })
    }
    setShowModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <Link
          href="/formateur"
          className="text-blue-600 hover:text-blue-800 inline-flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Retour aux formations
        </Link>
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Sessions de {formation.titre}
          </h1>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleCreateSession}
          >
            Créer une Session
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formation.sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onEdit={() => handleEditSession(session)}
            onDelete={() => deleteSession(formation.id, session.id)}
          />
        ))}
      </div>

      {showModal && (
        <SessionModal
          session={selectedSession}
          formationId={formation.id}
          onSave={handleSaveSession}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
} 