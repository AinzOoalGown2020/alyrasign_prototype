import { useState, useEffect } from 'react';
import { useBlockchain } from '@/hooks/useBlockchain';
import { Button, Typography, Box, CircularProgress, Alert, Paper, Divider } from '@mui/material';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react'
import { Program } from '@coral-xyz/anchor'

// ID du programme par défaut
const DEFAULT_PROGRAM_ID = 'v69C2KjiWjhUcRTKuotEY1E1PykP4oUtFaBE8ZCg5yJ'

export const PDAManager = () => {
  const { program, provider, initializeStorage } = useBlockchain();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [storagePDAAddress, setStoragePDAAddress] = useState<string>('');

  useEffect(() => {
    try {
      // Calculer l'adresse du PDA de storage même si le programme n'est pas initialisé
      const programId = new PublicKey(DEFAULT_PROGRAM_ID);
      const [storagePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('storage')],
        programId
      );
      setStoragePDAAddress(storagePDA.toString());
      console.log('PDAManager - PDA Storage calculé:', storagePDA.toString());
    } catch (err) {
      console.error('Erreur lors de la génération du PDA de storage:', err);
    }
  }, []);

  const handleInitializeStorage = async () => {
    if (!program || !provider) {
      setError('Programme non initialisé');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const tx = await initializeStorage();
      setSuccess(`Storage initialisé avec succès! Transaction: ${tx}`);
    } catch (err) {
      console.error('Erreur lors de l\'initialisation du storage:', err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Initialisation des PDAs
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">
          <strong>Adresse du PDA de Storage:</strong> {storagePDAAddress || 'Non disponible'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Cette adresse sera utilisée pour stocker les données du programme
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          État du programme:
        </Typography>
        <Typography variant="body2">
          <strong>Programme initialisé:</strong> {program ? 'Oui' : 'Non'}
        </Typography>
        <Typography variant="body2">
          <strong>Provider initialisé:</strong> {provider ? 'Oui' : 'Non'}
        </Typography>
        <Typography variant="body2">
          <strong>Program ID:</strong> {DEFAULT_PROGRAM_ID}
        </Typography>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleInitializeStorage}
          disabled={isLoading || !program || !provider}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Initialiser le Storage'}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Note: L'initialisation du Storage est nécessaire avant de pouvoir créer des formations et des sessions.
        Les frais de location seront déduits de votre wallet administrateur.
      </Typography>
    </Paper>
  );
}; 