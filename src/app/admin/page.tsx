import { useWallet } from '@/hooks/useWallet'
import { redirect } from 'next/navigation'

export default function AdminPage() {
  const { wallet } = useWallet()

  if (!wallet || wallet.publicKey?.toString() !== process.env.NEXT_PUBLIC_ADMIN_WALLET) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Administration
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Gestion des Utilisateurs
          </h2>
          <div className="space-y-4">
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => {/* TODO: Ajouter modal d'ajout */}}
            >
              Ajouter un Utilisateur
            </button>
            {/* Liste des utilisateurs sera ajoutée ici */}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Statistiques
          </h2>
          <div className="text-gray-500">
            Aucune statistique disponible
          </div>
        </div>
      </div>
    </div>
  )
} 