import Link from 'next/link'
import { useWallet } from '@/hooks/useWallet'
import { WalletButton } from '@/components/ui/WalletButton'

export function Navbar() {
  const { wallet } = useWallet()

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">
            AlyraSign
          </Link>

          <div className="flex items-center space-x-4">
            {wallet && (
              <>
                <Link 
                  href="/etudiant" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Portail Étudiant
                </Link>
                <Link 
                  href="/formateur" 
                  className="text-gray-600 hover:text-gray-900"
                >
                  Portail Formateur
                </Link>
                {wallet.publicKey?.toString() === process.env.NEXT_PUBLIC_ADMIN_WALLET && (
                  <Link 
                    href="/admin" 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Administration
                  </Link>
                )}
              </>
            )}
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  )
} 