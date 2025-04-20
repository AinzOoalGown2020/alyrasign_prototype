import { useState } from 'react'
import { Formation } from '@/types/formation'
import { PublicKey } from '@solana/web3.js'

interface FormationModalProps {
  formation?: Formation
  onSave: (formation: Omit<Formation, 'id' | 'sessions'>) => void
  onClose: () => void
}

export function FormationModal({ formation, onSave, onClose }: FormationModalProps) {
  const [title, setTitle] = useState(formation?.titre || '')
  const [description, setDescription] = useState(formation?.description || '')
  const [dateDebut, setDateDebut] = useState(
    formation?.dateDebut ? formation.dateDebut.toISOString().split('T')[0] : ''
  )
  const [dateFin, setDateFin] = useState(
    formation?.dateFin ? formation.dateFin.toISOString().split('T')[0] : ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      titre: title,
      description,
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      formateurId: formation?.formateurId || '',
      pubkey: formation?.pubkey || new PublicKey('11111111111111111111111111111111'),
      isSynced: formation?.isSynced || false
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 !text-white">
          {formation ? 'Modifier la Formation' : 'Créer une Formation'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium !text-gray-200">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 !text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium !text-gray-200">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 !text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium !text-gray-200">
              Date de début
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 !text-white focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium !text-gray-200">
              Date de fin
            </label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 !text-white focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium !text-gray-200 bg-gray-700 rounded-md hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium !text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {formation ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 