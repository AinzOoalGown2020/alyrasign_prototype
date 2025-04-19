import { Inter } from 'next/font/google'
import ClientLayout from './ClientLayout'
import '@/styles/globals.css'
import '@solana/wallet-adapter-react-ui/styles.css'

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
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
} 