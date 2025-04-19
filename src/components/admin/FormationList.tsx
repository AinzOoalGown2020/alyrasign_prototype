import { useState, useEffect } from 'react';
import { useAdminTransaction } from '@/hooks/useAdminTransaction';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Box,
  CircularProgress,
  Alert
} from '@mui/material';

interface Formation {
  id: string;
  title: string;
  description: string;
  sessions: Session[];
}

interface Session {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export const FormationList = () => {
  const { isAdmin, isLoading, error } = useAdminTransaction();
  const [formations, setFormations] = useState<Formation[]>([]);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        // TODO: Implémenter la récupération des formations depuis le programme Solana
        const mockFormations: Formation[] = [
          {
            id: '1',
            title: 'Formation Solana',
            description: 'Apprenez à développer sur Solana',
            sessions: [
              {
                id: '1',
                title: 'Introduction à Solana',
                description: 'Les bases de Solana',
                startDate: '2024-03-01T10:00:00',
                endDate: '2024-03-01T12:00:00',
              },
            ],
          },
        ];
        setFormations(mockFormations);
      } catch (err) {
        console.error('Erreur lors de la récupération des formations:', err);
      }
    };

    if (isAdmin) {
      fetchFormations();
    }
  }, [isAdmin]);

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
        Liste des Formations
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Sessions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formations.map((formation) => (
              <TableRow key={formation.id}>
                <TableCell>{formation.title}</TableCell>
                <TableCell>{formation.description}</TableCell>
                <TableCell>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Titre</TableCell>
                          <TableCell>Date de début</TableCell>
                          <TableCell>Date de fin</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formation.sessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>{session.title}</TableCell>
                            <TableCell>
                              {new Date(session.startDate).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(session.endDate).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}; 