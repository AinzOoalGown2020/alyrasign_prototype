import { create } from 'zustand'
import { Formation, Session } from '@/types/formation'

interface FormationStore {
  formations: Formation[]
  selectedFormation: Formation | null
  setFormations: (formations: Formation[]) => void
  addFormation: (formation: Formation) => void
  updateFormation: (formation: Formation) => void
  deleteFormation: (id: string) => void
  setSelectedFormation: (formation: Formation | null) => void
  addSession: (formationId: string, session: Session) => void
  updateSession: (formationId: string, session: Session) => void
  deleteSession: (formationId: string, sessionId: string) => void
}

export const useFormationStore = create<FormationStore>((set) => ({
  formations: [],
  selectedFormation: null,
  
  setFormations: (formations) => set({ formations }),
  
  addFormation: (formation) => 
    set((state) => ({ 
      formations: [...state.formations, formation] 
    })),
  
  updateFormation: (formation) =>
    set((state) => ({
      formations: state.formations.map((f) => 
        f.id === formation.id ? formation : f
      ),
    })),
  
  deleteFormation: (id) =>
    set((state) => ({
      formations: state.formations.filter((f) => f.id !== id),
    })),
  
  setSelectedFormation: (formation) =>
    set({ selectedFormation: formation }),
  
  addSession: (formationId, session) =>
    set((state) => ({
      formations: state.formations.map((f) =>
        f.id === formationId
          ? { ...f, sessions: [...f.sessions, session] }
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
            }
          : f
      ),
    })),
})) 