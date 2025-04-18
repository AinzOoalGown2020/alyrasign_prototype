import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import { Formation } from '@/types/formation'
import { useRouter } from 'next/navigation'

interface FormationCardProps {
  formation: Formation
  onEdit: () => void
  onDelete: () => void
}

export function FormationCard({
  formation,
  onEdit,
  onDelete,
}: FormationCardProps) {
  const router = useRouter()

  const handleManageSessions = () => {
    router.push(`/formateur/sessions?formationId=${formation.id}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {formation.titre}
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

      <p className="text-gray-600 mb-4">{formation.description}</p>

      <div className="text-sm text-gray-500 mb-4">
        <p>
          Du {format(formation.dateDebut, 'dd MMMM yyyy', { locale: fr })} au{' '}
          {format(formation.dateFin, 'dd MMMM yyyy', { locale: fr })}
        </p>
        <p>Sessions: {formation.sessions.length}</p>
      </div>

      <button
        onClick={handleManageSessions}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Gérer les Sessions
      </button>
    </div>
  )
} 