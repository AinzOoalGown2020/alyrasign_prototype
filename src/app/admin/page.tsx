"use client";

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction, TransactionInstruction, Keypair } from '@solana/web3.js';
import { Box, Typography, Paper, Grid, Button, CircularProgress, Alert } from '@mui/material';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const DEV_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_WALLET || "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy";
const PROGRAM_ID = process.env.NEXT_PUBLIC_ALYRA_SIGN_PROGRAM_ID || 'v69C2KjiWjhUcRTKuotEY1E1PykP4oUtFaBE8ZCg5yJ';
const MIN_SOL_REQUIRED = 5;

interface PDAInfo {
  address: string;
  balance: number;
  isInitialized: boolean;
}

export default function AdminPage() {
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storagePDA, setStoragePDA] = useState<PDAInfo | null>(null);
  const [programInfo, setProgramInfo] = useState<{
    exists: boolean;
    balance: number;
    executable: boolean;
    owner: string;
  } | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [needsFunds, setNeedsFunds] = useState(false);
  const [pdas, setPdas] = useState<{
    storage: { initialized: boolean; address: string; balance: number };
    formations: { initialized: boolean; address: string; balance: number };
    sessions: { initialized: boolean; address: string; balance: number };
    students: { initialized: boolean; address: string; balance: number };
  }>({
    storage: { initialized: false, address: '', balance: 0 },
    formations: { initialized: false, address: '', balance: 0 },
    sessions: { initialized: false, address: '', balance: 0 },
    students: { initialized: false, address: '', balance: 0 }
  });
  const [adminBalance, setAdminBalance] = useState<number>(0);

  // Vérification de l'autorisation
  useEffect(() => {
    const checkAuthorization = () => {
      const currentWalletAddress = publicKey?.toString();
      const isAdmin = currentWalletAddress === DEV_ADDRESS;
      setIsAuthorized(isAdmin);
      
      if (!isAdmin && currentWalletAddress) {
        router.push('/');
      }
    };
    
    if (wallet) {
      checkAuthorization();
    }
  }, [wallet, publicKey, router]);

  // Fonction pour vérifier et initialiser les PDAs
  const checkAndInitializePDAs = async () => {
    if (!connection || !isAuthorized) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const programPubkey = new PublicKey(PROGRAM_ID);
      
      // Vérification du programme
      const programAccount = await connection.getAccountInfo(programPubkey);
      setProgramInfo({
        exists: !!programAccount,
        balance: programAccount ? programAccount.lamports / LAMPORTS_PER_SOL : 0,
        executable: programAccount?.executable || false,
        owner: programAccount?.owner.toString() || ''
      });

      // Vérification de la balance du wallet administrateur
      const adminPubkey = new PublicKey(DEV_ADDRESS);
      const adminBalance = await connection.getBalance(adminPubkey);
      setAdminBalance(adminBalance / LAMPORTS_PER_SOL);

      // Vérification des PDAs
      const checkPDAs = async () => {
        if (!programPubkey || !publicKey) return;

        try {
          // Vérification du PDA de Storage
          const [storagePDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('storage')],
            programPubkey
          );
          const storageAccount = await connection.getAccountInfo(storagePDA);
          const storageBalance = await connection.getBalance(storagePDA);
          
          setPdas(prev => ({
            ...prev,
            storage: {
              initialized: !!storageAccount,
              address: storagePDA.toString(),
              balance: storageBalance / LAMPORTS_PER_SOL
            }
          }));

          // Vérification des autres PDAs
          const [formationsPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('formations')],
            programPubkey
          );
          const [sessionsPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('sessions')],
            programPubkey
          );
          const [studentsPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('students')],
            programPubkey
          );

          // Récupération des comptes et soldes
          const [formationsAccount, sessionsAccount, studentsAccount] = await Promise.all([
            connection.getAccountInfo(formationsPDA),
            connection.getAccountInfo(sessionsPDA),
            connection.getAccountInfo(studentsPDA)
          ]);

          const [formationsBalance, sessionsBalance, studentsBalance] = await Promise.all([
            connection.getBalance(formationsPDA),
            connection.getBalance(sessionsPDA),
            connection.getBalance(studentsPDA)
          ]);

          setPdas(prev => ({
            ...prev,
            formations: {
              initialized: !!formationsAccount,
              address: formationsPDA.toString(),
              balance: formationsBalance / LAMPORTS_PER_SOL
            },
            sessions: {
              initialized: !!sessionsAccount,
              address: sessionsPDA.toString(),
              balance: sessionsBalance / LAMPORTS_PER_SOL
            },
            students: {
              initialized: !!studentsAccount,
              address: studentsPDA.toString(),
              balance: studentsBalance / LAMPORTS_PER_SOL
            }
          }));

        } catch (error) {
          console.error('Erreur lors de la vérification des PDAs:', error);
          setError('Erreur lors de la vérification des PDAs');
        }
      };

      await checkPDAs();

    } catch (err) {
      console.error('Erreur lors de la vérification:', err);
      setError('Une erreur est survenue lors de la vérification des comptes');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour initialiser un PDA
  const handleInitializePDA = async (pdaType: string) => {
    if (!connection || !publicKey || !wallet?.adapter) {
      setError('Wallet non connecté');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Vérifier le solde du wallet
      const walletBalance = await connection.getBalance(publicKey);
      if (walletBalance < LAMPORTS_PER_SOL * MIN_SOL_REQUIRED) {
        throw new Error(`Solde insuffisant. Minimum requis: ${MIN_SOL_REQUIRED} SOL`);
      }

      const pdaAddress = new PublicKey(pdas[pdaType].address);
      const pdaAccount = await connection.getAccountInfo(pdaAddress);
      
      // Vérifier si le PDA est déjà initialisé
      if (pdaAccount) {
        setPdas(prev => ({
          ...prev,
          [pdaType]: {
            ...prev[pdaType],
            initialized: true
          }
        }));
        throw new Error(`Le PDA ${pdaType} est déjà initialisé`);
      }

      const transaction = new Transaction();
      
      // Créer l'instruction d'initialisation
      const initInstruction = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: pdaAddress,
        lamports: LAMPORTS_PER_SOL * MIN_SOL_REQUIRED,
        space: 0,
        programId: new PublicKey(PROGRAM_ID)
      });
      
      transaction.add(initInstruction);
      
      // Obtenir le dernier blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      console.log('Transaction préparée:', {
        pdaType,
        pdaAddress: pdaAddress.toString(),
        fromPubkey: publicKey.toString(),
        lamports: LAMPORTS_PER_SOL * MIN_SOL_REQUIRED,
        programId: PROGRAM_ID
      });

      // Envoyer la transaction pour signature via le wallet adapter
      const signature = await wallet.adapter.sendTransaction(transaction, connection, {
        signers: [],
        preflightCommitment: 'confirmed',
        maxRetries: 3
      });
      
      console.log(`Transaction envoyée pour le PDA ${pdaType}:`, signature);
      
      // Attendre la confirmation avec timeout
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Erreur de confirmation: ${confirmation.value.err.toString()}`);
      }
      
      console.log(`PDA ${pdaType} initialisé avec succès:`, signature);
      
      // Mettre à jour l'état après l'initialisation
      setPdas(prev => ({
        ...prev,
        [pdaType]: {
          ...prev[pdaType],
          initialized: true
        }
      }));
      
      // Rafraîchir les informations
      await checkAndInitializePDAs();
      
    } catch (err) {
      console.error(`Erreur détaillée lors de l'initialisation du PDA ${pdaType}:`, err);
      setError(`Erreur lors de l'initialisation du PDA ${pdaType}: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement initial et lors du clic sur Reload
  useEffect(() => {
    if (isAuthorized) {
      checkAndInitializePDAs();
    }
  }, [isAuthorized]);

  if (!wallet) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Veuillez connecter votre wallet
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Cette page nécessite une connexion avec un wallet Solana.
        </Typography>
      </Box>
    );
  }

  if (!isAuthorized) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom color="error">
          Accès non autorisé
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Adresse connectée: {publicKey?.toString() || "Non connecté"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Adresse admin requise: {DEV_ADDRESS}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 3 }}
          onClick={() => router.push('/')}
        >
          Retour à l'accueil
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Administration du Programme
        </Typography>
        <Button 
          variant="contained" 
          onClick={checkAndInitializePDAs}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Reload'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {needsFunds && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Le compte PDA Storage nécessite au moins {MIN_SOL_REQUIRED} SOL pour être initialisé.
          Veuillez transférer des fonds et cliquer sur "Reload".
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Section Initialisation des PDAs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              État des PDAs
            </Typography>
            
            {/* PDA Storage */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Storage PDA: {pdas.storage.initialized ? 'Initialisé' : 'Non initialisé'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adresse: {pdas.storage.address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Solde: {pdas.storage.balance.toFixed(4)} SOL
              </Typography>
              {!pdas.storage.initialized && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleInitializePDA('storage')}
                  disabled={isLoading}
                  sx={{ mt: 1 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Initialiser Storage'}
                </Button>
              )}
            </Box>

            {/* Autres PDAs */}
            {['formations', 'sessions', 'students'].map((pdaType) => (
              <Box key={pdaType} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  {pdaType.charAt(0).toUpperCase() + pdaType.slice(1)} PDA: {pdas[pdaType].initialized ? 'Initialisé' : 'Non initialisé'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Adresse: {pdas[pdaType].address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Solde: {pdas[pdaType].balance.toFixed(4)} SOL
                </Typography>
                {!pdas[pdaType].initialized && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleInitializePDA(pdaType)}
                    disabled={isLoading}
                    sx={{ mt: 1 }}
                  >
                    {isLoading ? <CircularProgress size={24} /> : `Initialiser ${pdaType}`}
                  </Button>
                )}
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Section Informations du Programme */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations du Programme Solana
            </Typography>
            {programInfo && (
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Existe:</strong> {programInfo.exists ? 'Oui' : 'Non'}</Typography>
                <Typography><strong>Balance:</strong> {programInfo.balance.toFixed(4)} SOL</Typography>
                <Typography><strong>Exécutable:</strong> {programInfo.executable ? 'Oui' : 'Non'}</Typography>
                <Typography><strong>Propriétaire:</strong> {programInfo.owner}</Typography>
                <Typography><strong>Program ID:</strong> {PROGRAM_ID}</Typography>
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
              <Typography><strong>Adresse:</strong> {DEV_ADDRESS}</Typography>
              <Typography><strong>Balance:</strong> {adminBalance.toFixed(4)} SOL</Typography>
              <Typography><strong>Initialisé:</strong> {programInfo?.exists ? 'Oui' : 'Non'}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 