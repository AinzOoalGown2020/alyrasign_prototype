import { useState, useCallback } from 'react'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { WalletContextState } from '@solana/wallet-adapter-react'

export function useWallet() {
  const solanaWallet = useSolanaWallet()
  const [wallet, setWallet] = useState<WalletContextState | null>(null)

  const connect = useCallback(async () => {
    try {
      await solanaWallet.connect()
      setWallet(solanaWallet)
    } catch (error) {
      console.error('Erreur de connexion:', error)
    }
  }, [solanaWallet])

  const disconnect = useCallback(async () => {
    try {
      await solanaWallet.disconnect()
      setWallet(null)
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
    }
  }, [solanaWallet])

  return {
    wallet,
    connect,
    disconnect,
  }
} 