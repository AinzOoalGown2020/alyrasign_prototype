import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

interface Session {
  id: string
  title: string
  date: Date
  startTime: string
  endTime: string
  formationId: string
}

interface SessionCardProps {
  session: Session
  onEdit: () => void
  onDelete: () => void
}

export function SessionCard({ session, onEdit, onDelete }: SessionCardProps) {
  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-gray-900">{session.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="btn btn-secondary"
          >
            Modifier
          </button>
          <button
            onClick={onDelete}
            className="btn bg-red-600 text-white hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Date :</span>
          <p>{format(session.date, 'dd MMMM yyyy', { locale: fr })}</p>
        </div>
        <div>
          <span className="font-medium">Horaire :</span>
          <p>{session.startTime} - {session.endTime}</p>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Link
          href={`/admin/presences?sessionId=${session.id}`}
          className="btn btn-primary"
        >
          Gérer les Présences
        </Link>
      </div>
    </div>
  )
} 