'use client'

import { useWallet } from '@/hooks/useWallet'
import { redirect } from 'next/navigation'

export default function EtudiantPage() {
  const { wallet } = useWallet()

  if (!wallet) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Portail Étudiant
      </h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Mes Formations
        </h2>
        
        {/* Liste des formations sera ajoutée ici */}
        <div className="text-gray-500">
          Aucune formation disponible
        </div>
      </div>
    </div>
  )
} 