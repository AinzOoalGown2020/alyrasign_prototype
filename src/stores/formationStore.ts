import { create } from 'zustand'
import { Formation, Session } from '@/types/formation'
import { useBlockchain } from '@/hooks/useBlockchain'
import { useFormations } from '@/hooks/useFormations'

interface FormationStore {
  formations: Formation[]
  selectedFormation: Formation | null
  setFormations: (formations: Formation[]) => void
  addFormation: (formation: Formation) => void
  updateLocalFormation: (formation: Formation) => void
  deleteLocalFormation: (id: string) => void
  setSelectedFormation: (formation: Formation | null) => void
  addSession: (formationId: string, session: Session) => void
  updateSession: (formationId: string, session: Session) => void
  deleteSession: (formationId: string, sessionId: string) => void
  syncFormation: (formationId: string) => Promise<void>
  syncAllFormations: () => Promise<void>
}

export const useFormationStore = create<FormationStore>((set, get) => ({
  formations: [],
  selectedFormation: null,
  
  setFormations: (formations) => set({ formations }),
  
  addFormation: (formation) => 
    set((state) => ({ 
      formations: [...state.formations, { ...formation, isSynced: false }] 
    })),
  
  updateLocalFormation: (formation) =>
    set((state) => ({
      formations: state.formations.map((f) => 
        f.id === formation.id ? { ...formation, isSynced: false } : f
      ),
    })),
  
  deleteLocalFormation: (id) =>
    set((state) => ({
      formations: state.formations.filter((f) => f.id !== id),
    })),
  
  setSelectedFormation: (formation) =>
    set({ selectedFormation: formation }),
  
  addSession: (formationId, session) =>
    set((state) => ({
      formations: state.formations.map((f) =>
        f.id === formationId
          ? { ...f, sessions: [...f.sessions, session], isSynced: false }
          : f
      ),
    })),
  
  updateSession: (formationId, session) =>
    set((state) => ({
      formations: state.formations.map((f) =>
        f.id === formationId
          ? {
              ...f,
              sessions: f.sessions.map((s) =>
                s.id === session.id ? session : s
              ),
              isSynced: false
            }
          : f
      ),
    })),
  
  deleteSession: (formationId, sessionId) =>
    set((state) => ({
      formations: state.formations.map((f) =>
        f.id === formationId
          ? {
              ...f,
              sessions: f.sessions.filter((s) => s.id !== sessionId),
              isSynced: false
            }
          : f
      ),
    })),

  syncFormation: async (formationId) => {
    const { program } = useBlockchain()
    const formation = get().formations.find(f => f.id === formationId)
    if (!formation || !program) return

    try {
      // Convertir les dates en timestamps
      const startDate = new Date(formation.dateDebut).getTime() / 1000
      const endDate = new Date(formation.dateFin).getTime() / 1000

      // Convertir les chaînes en tableaux de bytes
      const titleBytes = Buffer.from(formation.titre.padEnd(32, '\0'))
      const descriptionBytes = Buffer.from(formation.description.padEnd(64, '\0'))

      // Créer la formation sur la blockchain
      await program.methods
        .createFormation(
          Array.from(titleBytes),
          Array.from(descriptionBytes),
          startDate,
          endDate
        )
        .accounts({
          formation: program.programId,
          authority: program.provider.publicKey,
          systemProgram: program.programId,
        })
        .rpc()

      // Marquer la formation comme synchronisée
      set((state) => ({
        formations: state.formations.map((f) =>
          f.id === formationId ? { ...f, isSynced: true } : f
        ),
      }))
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error)
      throw error
    }
  },

  syncAllFormations: async () => {
    const { formations } = get()
    const unsyncedFormations = formations.filter(f => !f.isSynced)
    
    for (const formation of unsyncedFormations) {
      await get().syncFormation(formation.id)
    }
  },
})) 