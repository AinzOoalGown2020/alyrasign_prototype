import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { EtudiantInput } from '@/hooks/useEtudiants'

interface EtudiantModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EtudiantInput) => void
}

export function EtudiantModal({ isOpen, onClose, onSubmit }: EtudiantModalProps) {
  const [formData, setFormData] = useState<EtudiantInput>({
    pseudo: '',
    walletAddress: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <Dialog.Title className="text-xl font-bold text-white mb-4">
            Ajouter un Étudiant
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pseudo" className="block text-sm font-medium text-gray-300">
                Pseudo
              </label>
              <input
                type="text"
                id="pseudo"
                value={formData.pseudo}
                onChange={(e) => setFormData({ ...formData, pseudo: e.target.value })}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300">
                Adresse Wallet
              </label>
              <input
                type="text"
                id="walletAddress"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  )
} 