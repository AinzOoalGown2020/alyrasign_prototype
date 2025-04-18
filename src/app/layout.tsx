import { Inter } from 'next/font/google'
import { WalletProvider } from '@/components/providers/WalletProvider'
import { Navbar } from '@/components/layout/Navbar'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AlyraSign',
  description: 'Application de gestion des présences pour les étudiants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <WalletProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </WalletProvider>
      </body>
    </html>
  )
} 