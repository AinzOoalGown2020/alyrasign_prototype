'use client'

import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { redirect } from 'next/navigation'
import { useFormationStore } from '@/stores/formationStore'
import { PresenceManager } from '@/components/presences/PresenceManager'
import Link from 'next/link'

export default function PresencesPage({
  searchParams,
}: {
  searchParams: { formationId: string; sessionId: string }
}) {
  const { wallet } = useWallet()
  const { formations, updateSession } = useFormationStore()
  
  const formation = formations.find((f) => f.id === searchParams.formationId)
  const session = formation?.sessions.find((s) => s.id === searchParams.sessionId)

  if (!wallet || !formation || !session) {
    redirect('/formateur')
  }

  const handleUpdatePresence = (presence: Presence) => {
    const updatedPresences = session.presences.some((p) => p.id === presence.id)
      ? session.presences.map((p) => (p.id === presence.id ? presence : p))
      : [...session.presences, presence]

    updateSession(formation.id, {
      ...session,
      presences: updatedPresences,
    })
  }

  const handleDeletePresence = (presenceId: string) => {
    const updatedPresences = session.presences.filter((p) => p.id !== presenceId)
    updateSession(formation.id, {
      ...session,
      presences: updatedPresences,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href={`/formateur/sessions?formationId=${formation.id}`}
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Retour aux sessions
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Présences
          </h1>
        </div>
      </div>

      <PresenceManager
        session={session}
        onUpdatePresence={handleUpdatePresence}
        onDeletePresence={handleDeletePresence}
      />
    </div>
  )
} 