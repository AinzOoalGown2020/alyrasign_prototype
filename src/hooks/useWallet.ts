'use client'

import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react'

export function useWallet() {
  const wallet = useSolanaWallet()
  const { connection } = useConnection()

  return {
    wallet,
    connection,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
  }
} 