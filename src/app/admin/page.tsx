"use client";

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

// Adresse du développeur avec accès complet
const DEV_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_WALLET || "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy"

// ID du programme par défaut
const DEFAULT_PROGRAM_ID = '9mR7S7u8DeaQwqf6poYMUka2Dp2WjcY1GafPuMUp9GLo'

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
      // Récupérer l'adresse du wallet depuis le localStorage
      const storedWalletAddress = localStorage.getItem('walletAddress')
      const currentWalletAddress = wallet?.publicKey?.toString()
      
      // Mettre à jour l'adresse du wallet
      if (currentWalletAddress) {
        setWalletAddress(currentWalletAddress)
        localStorage.setItem('walletAddress', currentWalletAddress)
      } else if (storedWalletAddress) {
        setWalletAddress(storedWalletAddress)
      }
      
      // Vérifier si l'utilisateur est autorisé
      const isAdmin = currentWalletAddress === DEV_ADDRESS || storedWalletAddress === DEV_ADDRESS
      
      console.log('Vérification autorisation:', {
        currentWalletAddress,
        storedWalletAddress,
        adminAddress: DEV_ADDRESS,
        isAdmin,
        walletConnected: !!wallet?.publicKey
      })
      
      setIsAuthorized(isAdmin)
      
      if (!isAdmin && (currentWalletAddress || storedWalletAddress)) {
        console.log('Utilisateur non autorisé, redirection vers la page d\'accueil')
        router.push('/')
      }
    }
    
    // Attendre que le wallet soit initialisé
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
        // Récupérer les informations du programme
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
        
        // Récupérer les PDAs importants
        const pdas: PDAInfo[] = []
        
        try {
          // PDA de stockage
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
          
          // PDA de formation (exemple avec ID 1)
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
          
          // PDA de session (exemple avec ID 1)
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

  // Afficher un message de chargement pendant la vérification d'autorisation
  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-white mb-4">
          Chargement...
        </h1>
        <p className="text-gray-300 mb-6">
          Vérification de votre autorisation...
        </p>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-white mb-4">
          Accès non autorisé
        </h1>
        <p className="text-gray-300 mb-6">
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </p>
        <p className="text-gray-300 mb-6">
          Adresse connectée: {walletAddress || "Non connecté"}
        </p>
        <p className="text-gray-300 mb-6">
          Adresse admin requise: {DEV_ADDRESS}
        </p>
        <button 
          onClick={() => router.push('/')}
          className="btn btn-primary"
        >
          Retour à l'accueil
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Administration
      </h1>
      
      {isLoading && (
        <div className="text-white">Chargement des données...</div>
      )}
      
      {error && (
        <div className="text-red-500 p-4 bg-red-900/30 rounded-lg">
          {error}
        </div>
      )}
      
      {!isLoading && !error && (
        <>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Informations du Programme
          </h2>
            {programInfo && (
              <div className="space-y-2 text-gray-300">
                <p><span className="font-medium">Existe:</span> {programInfo.exists ? 'Oui' : 'Non'}</p>
                <p><span className="font-medium">Balance:</span> {programInfo.balance.toFixed(4)} SOL</p>
                <p><span className="font-medium">Exécutable:</span> {programInfo.executable ? 'Oui' : 'Non'}</p>
                <p><span className="font-medium">Propriétaire:</span> {programInfo.owner}</p>
                <p><span className="font-medium">Program ID:</span> {process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || DEFAULT_PROGRAM_ID}</p>
              </div>
            )}
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Adresses Wallet Admin
            </h2>
            <div className="space-y-2">
              {adminWallets.map((address, index) => (
                <div key={index} className="p-3 bg-gray-700/50 rounded-lg">
                  <p className="text-gray-300 break-all">
                    <span className="font-medium">Admin {index + 1}:</span> {address}
                  </p>
                </div>
              ))}
          </div>
        </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Program IDs & PDAs (Program Derived Addresses)
          </h2>
            <div className="space-y-4">
              {/* Program ID */}
              <div className="p-4 bg-gray-700/50 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Program ID</h3>
                <div className="space-y-1 text-gray-300">
                  <p><span className="font-medium">Adresse:</span> <span className="break-all">{process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || DEFAULT_PROGRAM_ID}</span></p>
                  <p><span className="font-medium">Balance:</span> {programInfo?.balance.toFixed(4) || '0.0000'} SOL</p>
                  <p><span className="font-medium">Initialisé:</span> {programInfo?.exists ? 'Oui' : 'Non'}</p>
                  <p><span className="font-medium">Exécutable:</span> {programInfo?.executable ? 'Oui' : 'Non'}</p>
                  {programInfo?.owner && <p><span className="font-medium">Propriétaire:</span> {programInfo.owner}</p>}
                </div>
              </div>
              
              {/* PDAs */}
              {pdaList.map((pda, index) => (
                <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-2">{pda.name}</h3>
                  <div className="space-y-1 text-gray-300">
                    <p><span className="font-medium">Adresse:</span> <span className="break-all">{pda.address}</span></p>
                    <p><span className="font-medium">Balance:</span> {pda.balance.toFixed(4)} SOL</p>
                    <p><span className="font-medium">Initialisé:</span> {pda.isInitialized ? 'Oui' : 'Non'}</p>
                    {pda.dataSize !== undefined && <p><span className="font-medium">Taille des données:</span> {pda.dataSize} octets</p>}
                    {pda.owner && <p><span className="font-medium">Propriétaire:</span> {pda.owner}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Statistiques du Réseau
            </h2>
            <div className="space-y-2 text-gray-300">
              <p><span className="font-medium">Endpoint RPC:</span> {connection?.rpcEndpoint}</p>
              <p><span className="font-medium">Version:</span> {connection?.version}</p>
              <p><span className="font-medium">Commitment:</span> {connection?.commitment}</p>
        </div>
      </div>
        </>
      )}
    </div>
  )
} 