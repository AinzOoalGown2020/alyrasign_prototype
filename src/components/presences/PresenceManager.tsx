import { useState } from 'react'
import { Session, Presence } from '@/types/formation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface PresenceManagerProps {
  session: Session
  onUpdatePresence: (presence: Presence) => void
  onDeletePresence: (presenceId: string) => void
}

export function PresenceManager({
  session,
  onUpdatePresence,
  onDeletePresence,
}: PresenceManagerProps) {
  const [newEtudiantId, setNewEtudiantId] = useState('')

  const handleAddPresence = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEtudiantId.trim()) return

    const newPresence: Presence = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      etudiantId: newEtudiantId.trim(),
      date: new Date(),
      statut: 'present',
    }

    onUpdatePresence(newPresence)
    setNewEtudiantId('')
  }

  const handleUpdateStatut = (presence: Presence, newStatut: Presence['statut']) => {
    onUpdatePresence({
      ...presence,
      statut: newStatut,
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          Gestion des Présences - {session.titre}
        </h3>
        
        <div className="text-sm text-gray-500 mb-4">
          <p>
            Date: {format(session.date, 'dd MMMM yyyy', { locale: fr })}
          </p>
          <p>
            Horaire: {session.heureDebut} - {session.heureFin}
          </p>
        </div>

        <form onSubmit={handleAddPresence} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newEtudiantId}
              onChange={(e) => setNewEtudiantId(e.target.value)}
              placeholder="ID de l'étudiant"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Ajouter
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {session.presences.map((presence) => (
                <tr key={presence.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {presence.etudiantId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={presence.statut}
                      onChange={(e) => handleUpdateStatut(presence, e.target.value as Presence['statut'])}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="present">Présent</option>
                      <option value="absent">Absent</option>
                      <option value="retard">En retard</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => onDeletePresence(presence.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 