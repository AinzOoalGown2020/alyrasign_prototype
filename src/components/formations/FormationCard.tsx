import { useState } from 'react'
import { useBlockchain } from '@/hooks/useBlockchain'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { Formation } from '@/types/formation'
import { useRouter } from 'next/navigation'
import { useFormationStore } from '@/stores/formationStore'

interface Session {
  id: string
  title: string
  startAt: number
  endAt: number
  isActive: boolean
}

interface FormationCardProps {
  formation: Formation
  currentWallet?: string
  onEdit?: () => void
  onDelete?: () => void
}

export function FormationCard({ formation, currentWallet, onEdit, onDelete }: FormationCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { syncFormation } = useFormationStore()

  const handleManageSessions = () => {
    router.push(`/admin/sessions?formationId=${formation.id}`)
  }

  const handleSync = async () => {
    if (formation.isSynced) return
    
    setIsLoading(true)
    try {
      await syncFormation(formation.id)
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold !text-white">{formation.titre}</h3>
        {!formation.isSynced && (
          <button
            onClick={handleSync}
            disabled={isLoading}
            className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            {isLoading ? 'Synchronisation...' : 'Synchroniser'}
          </button>
        )}
      </div>
      
      <p className="mt-2 text-gray-300">{formation.description}</p>
      
      <div className="mt-4 text-sm text-gray-400">
        <p>
          <span className="font-medium">Date de début:</span>{' '}
          {format(formation.dateDebut, 'dd MMMM yyyy', { locale: fr })}
        </p>
        <p>
          <span className="font-medium">Date de fin:</span>{' '}
          {format(formation.dateFin, 'dd MMMM yyyy', { locale: fr })}
        </p>
        <p>
          <span className="font-medium">Sessions:</span> {formation.sessions.length}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={handleManageSessions}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {formation.sessions.length === 0 ? 'Ajouter des sessions' : 'Gérer les sessions'}
        </button>
        
        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Modifier
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  )
} 