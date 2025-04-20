'use client'

import { useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { SessionCard } from '@/components/sessions/SessionCard'
import { SessionModal } from '@/components/sessions/SessionModal'
import { useSessions } from '@/hooks/useSessions'
import { AppBar } from '@/components/layout/AppBar'
import Link from 'next/link'
import { PublicKey } from '@solana/web3.js'
import { useConfirm } from '@/hooks/useConfirm'
import { Session } from '@/types/formation'

export default function SessionsPage() {
  const searchParams = useSearchParams()
  const formationPubkey = searchParams?.get('formationPubkey')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const { sessions, isLoading, createSession, updateSession, deleteSession } = useSessions()
  const { confirm } = useConfirm()

  const handleCreateSession = useCallback(async (data: any) => {
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
  }, [formationPubkey, sessions.length, createSession])

  const handleEditSession = useCallback(async (data: any) => {
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
  }, [selectedSession, updateSession])

  const handleDeleteSession = useCallback(async (pubkey: PublicKey) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      await deleteSession.mutateAsync(pubkey)
    }
  }, [deleteSession, confirm])

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedSession(null)
  }, [])

  const convertToSessionType = (session: any): Session => {
    const startDate = new Date(session.startTime * 1000)
    const endDate = new Date(session.endTime * 1000)
    
    return {
      id: session.pubkey.toString(),
      formationId: session.formationPubkey.toString(),
      titre: Buffer.from(session.title).toString().replace(/\0/g, ''),
      description: Buffer.from(session.description).toString().replace(/\0/g, ''),
      date: startDate,
      heureDebut: startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      heureFin: endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      presences: [],
      pubkey: session.pubkey
    }
  }

  if (!formationPubkey) {
    return (
      <div className="min-h-screen">
        <AppBar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-300">Aucune formation sélectionnée</p>
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
    <div className="min-h-screen">
      <AppBar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link
            href="/admin/formations"
            className="text-primary-600 hover:text-primary-700 mr-4"
          >
            ← Retour aux formations
          </Link>
          <h1 className="text-2xl font-semibold text-white">
            Sessions de la formation
          </h1>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={handleOpenModal}
            className="btn-primary"
          >
            Créer une Session
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-300">Chargement des sessions...</p>
          </div>
        ) : formationSessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300">Aucune session disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {formationSessions.map((session) => (
              <SessionCard
                key={session.pubkey.toString()}
                session={convertToSessionType(session)}
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
      </main>

      <SessionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={selectedSession ? handleEditSession : handleCreateSession}
        initialData={selectedSession}
        formationPubkey={new PublicKey(formationPubkey)}
        mode={selectedSession ? 'edit' : 'create'}
      />
    </div>
  )
} 