import { useState } from 'react';
import { useAdminTransaction } from '@/hooks/useAdminTransaction';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';

export const InscriptionManager = () => {
  const { isAdmin, isLoading, error, sendTransaction } = useAdminTransaction();
  const [studentAddress, setStudentAddress] = useState('');
  const [formationId, setFormationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setIsSubmitting(true);
    try {
      // TODO: Implémenter l'inscription d'un étudiant à une formation
      await sendTransaction({
        instruction: 'inscrire_etudiant',
        data: {
          studentAddress,
          formationId
        }
      });

      // Réinitialiser le formulaire
      setStudentAddress('');
      setFormationId('');
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <Alert severity="error">
        Vous devez être connecté en tant qu'administrateur pour accéder à cette page.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Inscriptions
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse du wallet de l'étudiant"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID de la formation"
                value={formationId}
                onChange={(e) => setFormationId(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Inscription en cours...
                  </>
                ) : (
                  'Inscrire l\'étudiant'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}; 