import { Session } from '@/types/formation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

interface SessionCardProps {
  session: Session
  formationId: string
  onEdit: () => void
  onDelete: () => void
}

export function SessionCard({
  session,
  formationId,
  onEdit,
  onDelete,
}: SessionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {session.titre}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
          >
            Modifier
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        <p>
          Date: {format(session.date, 'dd MMMM yyyy', { locale: fr })}
        </p>
        <p>
          Horaire: {session.heureDebut} - {session.heureFin}
        </p>
        <p>
          Présences: {session.presences.length}
        </p>
      </div>

      <Link
        href={`/formateur/presences?formationId=${formationId}&sessionId=${session.id}`}
        className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center"
      >
        Gérer les Présences
      </Link>
    </div>
  )
} 