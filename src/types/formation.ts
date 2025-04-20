import { PublicKey } from '@solana/web3.js'

export interface Formation {
  id: string
  titre: string
  description: string
  dateDebut: Date
  dateFin: Date
  formateurId: string
  sessions: Session[]
  isSynced: boolean
  pubkey: PublicKey
}

export interface Session {
  id: string
  formationId: string
  titre: string
  description: string
  date: Date
  heureDebut: string
  heureFin: string
  presences: Presence[]
  pubkey: PublicKey
}

export interface Presence {
  id: string
  sessionId: string
  etudiantId: string
  date: Date
  statut: 'present' | 'absent' | 'retard'
} 