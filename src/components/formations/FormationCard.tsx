import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

interface Formation {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  sessionCount: number
  isSynced: boolean
  lastSyncDate?: Date
  walletAddress?: string
}

interface FormationCardProps {
  formation: Formation
  onEdit: () => void
  onDelete: () => void
  onSync: () => void
}

export function FormationCard({ formation, onEdit, onDelete, onSync }: FormationCardProps) {
  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-gray-900">{formation.title}</h3>
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

      <p className="text-gray-600">{formation.description}</p>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Date de début :</span>
          <p>{format(formation.startDate, 'dd MMMM yyyy', { locale: fr })}</p>
        </div>
        <div>
          <span className="font-medium">Date de fin :</span>
          <p>{format(formation.endDate, 'dd MMMM yyyy', { locale: fr })}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Sessions : {formation.sessionCount}
        </span>
        {formation.walletAddress && (
          <a
            href={`https://explorer.solana.com/address/${formation.walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Voir sur Solana Explorer
          </a>
        )}
      </div>

      {formation.lastSyncDate && (
        <p className="text-sm text-gray-500">
          Dernière synchronisation : {format(formation.lastSyncDate, 'dd/MM/yyyy HH:mm', { locale: fr })}
        </p>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <Link
          href={`/admin/sessions?formationId=${formation.id}`}
          className="btn btn-primary"
        >
          Gérer les Sessions
        </Link>
        {!formation.isSynced && (
          <button
            onClick={onSync}
            className="btn bg-secondary-600 text-white hover:bg-secondary-700"
          >
            Synchroniser
          </button>
        )}
      </div>
    </div>
  )
} 