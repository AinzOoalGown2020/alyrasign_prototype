"use client";

import { WalletButton } from '@/components/ui/WalletButton'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-[100px] h-[100px] md:w-[140px] md:h-[140px] relative mb-8">
        <Image 
          src="/AlyraSign.png" 
          alt="AlyraSign Logo" 
          width={300}
          height={100}
          sizes="(max-width: 768px) 200px, 300px"
          className="object-contain"
          priority
        />
      </div>
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