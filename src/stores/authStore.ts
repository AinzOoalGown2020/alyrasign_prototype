import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Role = 'formateur' | 'etudiant' | null

interface AuthState {
  role: Role
  setRole: (role: Role) => void
  clearRole: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
      clearRole: () => set({ role: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
) 