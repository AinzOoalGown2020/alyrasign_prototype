import { Inter } from 'next/font/google'
import { WalletProvider } from '@/components/providers/WalletProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AlyraSign - Gestion des Formations',
  description: 'Application de gestion des formations et des présences sur Solana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <QueryProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  )
} 