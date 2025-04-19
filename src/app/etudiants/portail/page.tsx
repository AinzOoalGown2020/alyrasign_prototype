'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useFormations } from '@/hooks/useFormations'
import { FormationCard } from '@/components/formations/FormationCard'

export default function PortailEtudiantPage() {
  const { publicKey } = useWallet()
  const { formations, isLoading } = useFormations()
  const [etudiantFormations, setEtudiantFormations] = useState<any[]>([])
  const [prochaineSession, setProchaineSession] = useState<any>(null)

  useEffect(() => {
    if (formations.length > 0 && publicKey) {
      // Filtrer les formations associées à l'étudiant connecté
      // Dans une implémentation réelle, cette logique serait gérée par la blockchain
      const formationsEtudiant = formations.filter(formation => {
        // Simulation: l'étudiant est associé à toutes les formations pour le développement
        return true
      })
      setEtudiantFormations(formationsEtudiant)
      
      // Trouver la prochaine session
      // Cette logique serait également gérée par la blockchain dans une implémentation réelle
      if (formationsEtudiant.length > 0) {
        const toutesSessions = formationsEtudiant.flatMap(formation => 
          formation.sessions || []
        )
        
        if (toutesSessions.length > 0) {
          const sessionsFutures = toutesSessions.filter(session => 
            new Date(session.date) > new Date()
          )
          
          if (sessionsFutures.length > 0) {
            // Trier par date
            sessionsFutures.sort((a, b) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            setProchaineSession(sessionsFutures[0])
          }
        }
      }
    }
  }, [formations, publicKey])

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-2xl font-bold text-white mb-4">
          Connexion requise
        </h1>
        <p className="text-gray-300 mb-8 text-center">
          Veuillez vous connecter avec votre wallet pour accéder au portail étudiant.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">
        Portail Étudiant
      </h1>
      
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          {prochaineSession && (
            <div className="card bg-purple-900/30 border-purple-500/50">
              <h2 className="text-xl font-semibold mb-2 text-purple-300">
                Prochaine Session
              </h2>
              <div className="text-white">
                <p><span className="font-medium">Formation:</span> {prochaineSession.formation}</p>
                <p><span className="font-medium">Date:</span> {new Date(prochaineSession.date).toLocaleDateString()}</p>
                <p><span className="font-medium">Heure:</span> {new Date(prochaineSession.date).toLocaleTimeString()}</p>
              </div>
            </div>
          )}
          
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Mes Formations
            </h2>
            
            {etudiantFormations.length === 0 ? (
              <p className="text-gray-300">Vous n'êtes inscrit à aucune formation.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {etudiantFormations.map(formation => (
                  <FormationCard key={formation.id} formation={formation} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
} 