import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Etudiant } from '@/hooks/useEtudiants'

interface EtudiantCardProps {
  etudiant: Etudiant
  onEdit: () => void
  onDelete: () => void
}

export function EtudiantCard({ etudiant, onEdit, onDelete }: EtudiantCardProps) {
  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-gray-900">
          {etudiant.walletAddress.substring(0, 6)}...{etudiant.walletAddress.substring(etudiant.walletAddress.length - 4)}
        </h3>
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
          <span className="font-medium">Pseudo :</span>
          <p className="capitalize">{etudiant.pseudo}</p>
        </div>
        <div>
          <span className="font-medium">Statut :</span>
          <p>{etudiant.isAuthorized ? 'Autorisé' : 'Non autorisé'}</p>
        </div>
      </div>

      {etudiant.lastSyncDate && (
        <p className="text-sm text-gray-500">
          Dernière synchronisation : {format(etudiant.lastSyncDate, 'dd/MM/yyyy HH:mm', { locale: fr })}
        </p>
      )}

      <div className="flex justify-end pt-4 border-t">
        <a
          href={`https://explorer.solana.com/address/${etudiant.walletAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          Voir sur Solana Explorer
        </a>
      </div>
    </div>
  )
} 