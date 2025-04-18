import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PublicKey } from '@solana/web3.js'
import { Session } from '@/types/formation'

interface SessionFormData {
  title: string
  description: string
  startTime: string
  endTime: string
}

interface SessionModalProps {
  session?: Session
  formationId: string
  onSave: (session: Omit<Session, 'id' | 'presences'>) => void
  onClose: () => void
}

export function SessionModal({
  session,
  formationId,
  onSave,
  onClose,
}: SessionModalProps) {
  const [titre, setTitre] = useState(session?.titre || '')
  const [date, setDate] = useState(
    session?.date ? session.date.toISOString().split('T')[0] : ''
  )
  const [heureDebut, setHeureDebut] = useState(session?.heureDebut || '')
  const [heureFin, setHeureFin] = useState(session?.heureFin || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      titre,
      formationId,
      date: new Date(date),
      heureDebut,
      heureFin,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {session ? 'Modifier la Session' : 'Créer une Session'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Titre
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Heure de début
            </label>
            <input
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Heure de fin
            </label>
            <input
              type="time"
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {session ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 