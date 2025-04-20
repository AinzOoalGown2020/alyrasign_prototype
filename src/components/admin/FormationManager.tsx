import { useState } from 'react';
import { useAdminTransaction } from '@/hooks/useAdminTransaction';
import { Button, TextField, Typography, Box, CircularProgress, Alert } from '@mui/material';

export const FormationManager = () => {
  const { isAdmin, isLoading, error, createFormation, createSession } = useAdminTransaction();
  const [formationData, setFormationData] = useState({
    title: '',
    description: '',
  });
  const [sessionData, setSessionData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  });
  const [selectedFormationId, setSelectedFormationId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const handleFormationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createFormation(formationData);
      console.log('Formation créée:', result);
      // Réinitialiser le formulaire
      setFormationData({
        title: '',
        description: '',
      });
    } catch (err) {
      console.error('Erreur lors de la création de la formation:', err);
    }
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormationId) {
      setSessionError('Veuillez sélectionner une formation');
      return;
    }
    setSessionError(null);
    try {
      const result = await createSession(sessionData, selectedFormationId);
      console.log('Session créée:', result);
      // Réinitialiser le formulaire
      setSessionData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
      });
    } catch (err) {
      console.error('Erreur lors de la création de la session:', err);
      setSessionError('Une erreur est survenue lors de la création de la session');
    }
  };

  if (!isAdmin) {
    return (
      <Alert severity="error">
        Vous devez être connecté en tant qu'administrateur pour accéder à cette page.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Formations et Sessions
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleFormationSubmit} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Créer une Formation
        </Typography>
        <TextField
          fullWidth
          label="Titre"
          value={formationData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormationData({ ...formationData, title: (e.target as HTMLInputElement).value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Description"
          value={formationData.description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormationData({ ...formationData, description: e.target.value })}
          margin="normal"
          multiline
          rows={4}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Créer la Formation'}
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSessionSubmit}>
        <Typography variant="h6" gutterBottom>
          Créer une Session
        </Typography>
        {sessionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {sessionError}
          </Alert>
        )}
        <TextField
          fullWidth
          label="Titre"
          value={sessionData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionData({ ...sessionData, title: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Description"
          value={sessionData.description}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionData({ ...sessionData, description: e.target.value })}
          margin="normal"
          multiline
          rows={4}
          required
        />
        <TextField
          fullWidth
          label="Date de début"
          type="datetime-local"
          value={sessionData.startDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionData({ ...sessionData, startDate: e.target.value })}
          margin="normal"
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          fullWidth
          label="Date de fin"
          type="datetime-local"
          value={sessionData.endDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionData({ ...sessionData, endDate: e.target.value })}
          margin="normal"
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading || !selectedFormationId}
          sx={{ mt: 2 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Créer la Session'}
        </Button>
      </Box>
    </Box>
  );
}; 