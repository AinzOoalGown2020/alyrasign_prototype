"use client";

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { PDAManager } from '@/components/admin/PDAManager';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { Program } from '@project-serum/anchor'

// Adresse du développeur avec accès complet
const DEV_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_WALLET || "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy"

// ID du programme par défaut
const DEFAULT_PROGRAM_ID = 'v69C2KjiWjhUcRTKuotEY1E1PykP4oUtFaBE8ZCg5yJ'

interface PDAInfo {
  name: string
  address: string
  balance: number
  isInitialized: boolean
  dataSize?: number
  owner?: string
}

export default function AdminPage() {
  const { wallet } = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdaList, setPdaList] = useState<PDAInfo[]>([])
  const [programInfo, setProgramInfo] = useState<{
    exists: boolean
    balance: number
    executable: boolean
    owner: string
  } | null>(null)
  const [adminWallets, setAdminWallets] = useState<string[]>([DEV_ADDRESS])
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // Vérifier si l'utilisateur est autorisé
  useEffect(() => {
    const checkAuthorization = () => {
      const storedWalletAddress = localStorage.getItem('walletAddress')
      const currentWalletAddress = wallet?.publicKey?.toString()
      
      if (currentWalletAddress) {
        setWalletAddress(currentWalletAddress)
        localStorage.setItem('walletAddress', currentWalletAddress)
      } else if (storedWalletAddress) {
        setWalletAddress(storedWalletAddress)
      }
      
      const isAdmin = currentWalletAddress === DEV_ADDRESS || storedWalletAddress === DEV_ADDRESS
      setIsAuthorized(isAdmin)
      
      if (!isAdmin && (currentWalletAddress || storedWalletAddress)) {
        router.push('/')
      }
    }
    
    if (wallet) {
      checkAuthorization()
    }
  }, [wallet, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!connection) {
        setError("Connexion à Solana non disponible")
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      try {
        const programId = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || DEFAULT_PROGRAM_ID
        let programPubkey: PublicKey
        
        try {
          programPubkey = new PublicKey(programId)
        } catch (err) {
          console.error("Erreur lors de la création de la clé publique:", err)
          setError("ID de programme invalide")
          setIsLoading(false)
          return
        }
        
        const programAccount = await connection.getAccountInfo(programPubkey)
        
        if (programAccount) {
          setProgramInfo({
            exists: true,
            balance: programAccount.lamports / LAMPORTS_PER_SOL,
            executable: programAccount.executable,
            owner: programAccount.owner.toString()
          })
        } else {
          setProgramInfo({
            exists: false,
            balance: 0,
            executable: false,
            owner: ''
          })
        }
        
        const pdas: PDAInfo[] = []
        
        try {
          const [storagePDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('storage')],
            programPubkey
          )
          const storageAccount = await connection.getAccountInfo(storagePDA)
          pdas.push({
            name: 'Storage',
            address: storagePDA.toString(),
            balance: storageAccount ? storageAccount.lamports / LAMPORTS_PER_SOL : 0,
            isInitialized: !!storageAccount,
            dataSize: storageAccount ? storageAccount.data.length : 0,
            owner: storageAccount ? storageAccount.owner.toString() : undefined
          })
          
          const [formationPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('formation'), Buffer.from('1')],
            programPubkey
          )
          const formationAccount = await connection.getAccountInfo(formationPDA)
          pdas.push({
            name: 'Formation #1',
            address: formationPDA.toString(),
            balance: formationAccount ? formationAccount.lamports / LAMPORTS_PER_SOL : 0,
            isInitialized: !!formationAccount,
            dataSize: formationAccount ? formationAccount.data.length : 0,
            owner: formationAccount ? formationAccount.owner.toString() : undefined
          })
          
          const [sessionPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('session'), Buffer.from('1')],
            programPubkey
          )
          const sessionAccount = await connection.getAccountInfo(sessionPDA)
          pdas.push({
            name: 'Session #1',
            address: sessionPDA.toString(),
            balance: sessionAccount ? sessionAccount.lamports / LAMPORTS_PER_SOL : 0,
            isInitialized: !!sessionAccount,
            dataSize: sessionAccount ? sessionAccount.data.length : 0,
            owner: sessionAccount ? sessionAccount.owner.toString() : undefined
          })
        } catch (err) {
          console.error("Erreur lors de la récupération des PDAs:", err)
          setError("Erreur lors de la récupération des PDAs")
        }
        
        setPdaList(pdas)
        
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err)
        setError('Une erreur est survenue lors de la récupération des données')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (isAuthorized) {
      fetchData()
    }
  }, [connection, isAuthorized])

  if (!wallet) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Chargement...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vérification de votre autorisation...
        </Typography>
      </Box>
    )
  }

  if (!isAuthorized) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Accès non autorisé
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Adresse connectée: {walletAddress || "Non connecté"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Adresse admin requise: {DEV_ADDRESS}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Administration du Programme
      </Typography>

      <Grid container spacing={3}>
        {/* Section PDAs */}
        <Grid item xs={12}>
          <PDAManager />
        </Grid>

        {/* Section Informations du Programme */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations du Programme
            </Typography>
            {programInfo && (
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Existe:</strong> {programInfo.exists ? 'Oui' : 'Non'}</Typography>
                <Typography><strong>Balance:</strong> {programInfo.balance.toFixed(4)} SOL</Typography>
                <Typography><strong>Exécutable:</strong> {programInfo.executable ? 'Oui' : 'Non'}</Typography>
                <Typography><strong>Propriétaire:</strong> {programInfo.owner}</Typography>
                <Typography><strong>Program ID:</strong> {process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || DEFAULT_PROGRAM_ID}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Section Wallet Admin */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Wallet Administrateur
            </Typography>
            <Box sx={{ mt: 2 }}>
              {adminWallets.map((address, index) => (
                <Typography key={index}>
                  <strong>Admin {index + 1}:</strong> {address}
                </Typography>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Section PDAs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Program Derived Addresses (PDAs)
            </Typography>
            <Box sx={{ mt: 2 }}>
              {pdaList.map((pda, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="subtitle1"><strong>{pda.name}</strong></Typography>
                  <Typography><strong>Adresse:</strong> {pda.address}</Typography>
                  <Typography><strong>Balance:</strong> {pda.balance.toFixed(4)} SOL</Typography>
                  <Typography><strong>Initialisé:</strong> {pda.isInitialized ? 'Oui' : 'Non'}</Typography>
                  {pda.dataSize !== undefined && <Typography><strong>Taille des données:</strong> {pda.dataSize} octets</Typography>}
                  {pda.owner && <Typography><strong>Propriétaire:</strong> {pda.owner}</Typography>}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
} 