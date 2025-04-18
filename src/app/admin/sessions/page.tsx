'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SessionCard } from '@/components/sessions/SessionCard'
import { SessionModal } from '@/components/sessions/SessionModal'
import { useSessions } from '@/hooks/useSessions'
import { Navbar } from '@/components/layout/Navbar'
import Link from 'next/link'
import { PublicKey } from '@solana/web3.js'

export default function SessionsPage() {
  const searchParams = useSearchParams()
  const formationPubkey = searchParams.get('formationPubkey')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const { sessions, isLoading, createSession, updateSession, deleteSession } = useSessions()

  const handleCreateSession = async (data: any) => {
    if (!formationPubkey) return
    await createSession.mutateAsync({
      id: sessions.length + 1,
      formationPubkey: new PublicKey(formationPubkey),
      title: data.title,
      description: data.description,
      startTime: Math.floor(new Date(data.startTime).getTime() / 1000),
      endTime: Math.floor(new Date(data.endTime).getTime() / 1000),
    })
    setIsModalOpen(false)
  }

  const handleEditSession = async (data: any) => {
    if (!selectedSession) return
    await updateSession.mutateAsync({
      pubkey: selectedSession.pubkey,
      input: {
        id: selectedSession.id,
        title: data.title,
        description: data.description,
        startTime: Math.floor(new Date(data.startTime).getTime() / 1000),
        endTime: Math.floor(new Date(data.endTime).getTime() / 1000),
      },
    })
    setIsModalOpen(false)
    setSelectedSession(null)
  }

  const handleDeleteSession = async (pubkey: PublicKey) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      await deleteSession.mutateAsync(pubkey)
    }
  }

  if (!formationPubkey) {
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

  const formationSessions = sessions.filter(
    session => session.formationPubkey.toString() === formationPubkey
  )

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
          ) : formationSessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune session disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {formationSessions.map((session) => (
                <SessionCard
                  key={session.pubkey.toString()}
                  session={session}
                  formationId={formationPubkey}
                  onEdit={() => {
                    setSelectedSession(session)
                    setIsModalOpen(true)
                  }}
                  onDelete={() => handleDeleteSession(session.pubkey)}
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
        formationPubkey={new PublicKey(formationPubkey)}
        mode={selectedSession ? 'edit' : 'create'}
      />
    </div>
  )
} 