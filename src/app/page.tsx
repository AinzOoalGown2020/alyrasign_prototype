import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { connected } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (connected) {
      // Rediriger vers le portail approprié selon le rôle
      // Pour l'instant, on reste sur la page d'accueil
    }
  }, [connected])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-primary-600">
          Bienvenue sur AlyraSign
        </h1>
        <p className="text-xl text-gray-600">
          Application de gestion des présences pour les étudiants
        </p>
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700" />
        </div>
        {!connected && (
          <p className="text-gray-500">
            Connectez-vous pour accéder à votre espace
          </p>
        )}
      </div>
    </main>
  )
} 