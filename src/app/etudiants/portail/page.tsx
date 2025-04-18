'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
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
        // Simulation: la première formation a la prochaine session
        setProchaineSession(formationsEtudiant[0])
      }
    }
  }, [formations, publicKey])

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Veuillez vous connecter avec votre wallet pour accéder au portail étudiant.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Portail Étudiant
          </h1>

          {prochaineSession && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Prochaine session
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      {prochaineSession.title} - {new Date(prochaineSession.startDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mes Formations
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chargement des formations...</p>
            </div>
          ) : etudiantFormations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune formation disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {etudiantFormations.map((formation) => (
                <div key={formation.id} className="card space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">{formation.title}</h3>
                  <p className="text-gray-600">{formation.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Date de début :</span>
                      <p>{new Date(formation.startDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <span className="font-medium">Date de fin :</span>
                      <p>{new Date(formation.endDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Sessions : {formation.sessionCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 