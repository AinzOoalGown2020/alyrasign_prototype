import { useWallet } from '@/hooks/useWallet'

export function WalletButton() {
  const { connect, disconnect, wallet } = useWallet()

  if (wallet) {
    return (
      <button
        onClick={disconnect}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        {wallet.publicKey?.toString().slice(0, 4)}...
        {wallet.publicKey?.toString().slice(-4)}
      </button>
    )
  }

  return (
    <button
      onClick={connect}
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
    >
      Connecter Wallet
    </button>
  )
} 