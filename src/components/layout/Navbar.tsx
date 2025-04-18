import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || '79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy'

export function Navbar() {
  const { publicKey } = useWallet()
  const pathname = usePathname()
  const { role } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isAdmin = publicKey?.toString() === ADMIN_WALLET

  const navigation = [
    { name: 'Accueil', href: '/' },
    ...(role === 'formateur' || isAdmin ? [
      { name: 'Gestion des Formations', href: '/admin/formations' },
      { name: 'Gestion des Étudiants', href: '/admin/etudiants' },
      { name: 'Administration', href: '/admin/ajouts' },
    ] : []),
    ...(role === 'etudiant' ? [
      { name: 'Portail Étudiant', href: '/etudiants/portail' },
    ] : []),
  ]

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/AlyraSign.png"
                  alt="AlyraSign Logo"
                  width={120}
                  height={40}
                  priority
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <WalletMultiButton className="!bg-primary-600 hover:!bg-primary-700" />
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === item.href
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
} 