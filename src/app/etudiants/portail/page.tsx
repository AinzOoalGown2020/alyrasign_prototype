'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useBlockchain } from '@/hooks/useBlockchain'
import { FormationCard } from '@/components/formations/FormationCard'
import { PublicKey } from '@solana/web3.js'
import { Formation } from '@/types/formation'

interface Session {
  id: string
  title: string
  startAt: number
  endAt: number
  isActive: boolean
}

export default function PortailEtudiantPage() {
  const { publicKey } = useWallet()
  const { program } = useBlockchain()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [etudiantFormations, setEtudiantFormations] = useState<Formation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const convertToFormationType = (formation: any): Formation => {
    const startDate = new Date(formation.account.startDate.toNumber() * 1000)
    const endDate = new Date(formation.account.endDate.toNumber() * 1000)
    
    return {
      id: formation.publicKey.toString(),
      titre: Buffer.from(formation.account.title).toString().replace(/\0/g, ''),
      description: Buffer.from(formation.account.description).toString().replace(/\0/g, ''),
      dateDebut: startDate,
      dateFin: endDate,
      formateurId: formation.account.authority.toString(),
      sessions: [],
      isSynced: true,
      pubkey: formation.publicKey
    }
  }

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!program || !publicKey) {
        setIsAuthorized(false)
        setIsLoading(false)
        return
      }

      try {
        // Récupérer toutes les formations
        const formations = await program.account.formation.all()
        
        // Pour chaque formation, vérifier si l'étudiant est inscrit
        for (const formation of formations) {
          const [studentPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('student'), formation.publicKey.toBuffer(), publicKey.toBuffer()],
            program.programId
          )

          try {
            const studentAccount = await program.account.student.fetch(studentPDA)
            setIsAuthorized(true)
            setEtudiantFormations([...etudiantFormations, convertToFormationType(formation)])
          } catch (error) {
            // L'étudiant n'est pas inscrit à cette formation
            continue
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'autorisation:', error)
        setIsAuthorized(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthorization()
  }, [program, publicKey])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Connexion Requise</h1>
          <p>Veuillez vous connecter avec votre wallet pour accéder au portail étudiant.</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Accès Non Autorisé</h1>
          <p>Votre wallet n'est pas reconnu comme étudiant.</p>
          <p className="mt-2">Veuillez communiquer votre adresse wallet à l'administration pour obtenir un accès.</p>
          <p className="mt-4 text-sm text-gray-400">Votre adresse wallet : {publicKey.toString()}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Portail Étudiant
        </h1>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Mes Formations
          </h2>
          
          {etudiantFormations.length === 0 ? (
            <p className="text-gray-300">Vous n'êtes inscrit à aucune formation.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {etudiantFormations.map(formation => (
                <FormationCard 
                  key={formation.id} 
                  formation={formation}
                  currentWallet={publicKey.toString()}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 