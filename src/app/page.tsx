"use client";

import { WalletButton } from '@/components/ui/WalletButton'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <h1 className="text-4xl font-bold text-white mb-4 text-center">
        Bienvenue sur AlyraSign
      </h1>
      <p className="text-xl text-gray-300 mb-8 text-center">
        Application de gestion des présences pour les étudiants
      </p>
      <WalletButton />
    </div>
  )
} 