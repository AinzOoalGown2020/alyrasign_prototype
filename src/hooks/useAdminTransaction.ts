import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useState, useCallback } from 'react';
import { useBlockchain } from './useBlockchain';

// Adresses des administrateurs avec accès complet
const ADMIN_ADDRESSES = [
  process.env.NEXT_PUBLIC_ADMIN_WALLET || "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy",
  process.env.NEXT_PUBLIC_ADMIN_WALLET_1 || "HYogRLGSbAxY1dYkAvBsNdc3QMowLL9ZnJ1qhW5Ew7hG",
  process.env.NEXT_PUBLIC_ADMIN_WALLET_2 || "HwkDskvuMJbaMwEKTJaZBKWmMxjxpNGhUU7mQECiRzyH"
];

export const useAdminTransaction = () => {
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();
  const { program } = useBlockchain();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si l'utilisateur est admin
  const isAdmin = publicKey ? ADMIN_ADDRESSES.includes(publicKey.toString()) : false;

  // Fonction pour calculer le rent minimum pour un PDA
  const calculateRentExemption = useCallback(async (dataSize: number) => {
    try {
      const rentExemptionAmount = await connection.getMinimumBalanceForRentExemption(dataSize);
      return rentExemptionAmount;
    } catch (err) {
      console.error("Erreur lors du calcul du rent exemption:", err);
      throw new Error("Impossible de calculer le montant de rent nécessaire");
    }
  }, [connection]);

  // Fonction pour créer un PDA sans lui transférer de fonds
  const createPDA = useCallback(async (
    seeds: Buffer[],
    dataSize: number,
    instruction: (pda: PublicKey) => Promise<Transaction>
  ) => {
    if (!isAdmin) {
      throw new Error("Vous devez être connecté en tant qu'administrateur");
    }

    if (!program) {
      throw new Error("Programme non initialisé");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calculer le PDA
      const [pda, bump] = await PublicKey.findProgramAddress(
        seeds,
        program.programId
      );

      // Créer la transaction
      const transaction = await instruction(pda);

      // Envoyer la transaction
      const signature = await wallet?.adapter.sendTransaction(transaction, connection);
      
      // Attendre la confirmation
      if (signature) {
        await connection.confirmTransaction(signature);
      }

      return { pda, signature };
    } catch (err) {
      console.error("Erreur lors de la création du PDA:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, program, wallet, connection]);

  // Fonction pour créer une formation
  const createFormation = useCallback(async (formationData: any) => {
    if (!isAdmin) {
      throw new Error("Vous devez être connecté en tant qu'administrateur");
    }

    if (!program) {
      throw new Error("Programme non initialisé");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Générer un ID unique pour la formation (exemple simple)
      const formationId = Date.now().toString();
      
      // Créer le PDA pour la formation
      const [formationPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('formation'), Buffer.from(formationId)],
        program.programId
      );

      // Créer la transaction
      const transaction = new Transaction();
      
      // Ajouter l'instruction pour créer la formation
      // Note: Cette partie dépend de votre programme spécifique
      // Vous devrez adapter cette partie en fonction de votre IDL
      transaction.add(
        await (program as any).methods
          .createFormation(formationData)
          .accounts({
            formation: formationPDA,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      );

      // Envoyer la transaction
      const signature = await wallet?.adapter.sendTransaction(transaction, connection);
      
      // Attendre la confirmation
      if (signature) {
        await connection.confirmTransaction(signature);
      }

      return { formationPDA, signature };
    } catch (err) {
      console.error("Erreur lors de la création de la formation:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, program, wallet, connection, publicKey]);

  // Fonction pour créer une session
  const createSession = useCallback(async (sessionData: any, formationId: string) => {
    if (!isAdmin) {
      throw new Error("Vous devez être connecté en tant qu'administrateur");
    }

    if (!program) {
      throw new Error("Programme non initialisé");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Générer un ID unique pour la session (exemple simple)
      const sessionId = Date.now().toString();
      
      // Créer le PDA pour la session
      const [sessionPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('session'), Buffer.from(sessionId)],
        program.programId
      );

      // Calculer le PDA de la formation
      const [formationPDA] = await PublicKey.findProgramAddress(
        [Buffer.from('formation'), Buffer.from(formationId)],
        program.programId
      );

      // Créer la transaction
      const transaction = new Transaction();
      
      // Ajouter l'instruction pour créer la session
      // Note: Cette partie dépend de votre programme spécifique
      // Vous devrez adapter cette partie en fonction de votre IDL
      transaction.add(
        await (program as any).methods
          .createSession(sessionData)
          .accounts({
            session: sessionPDA,
            formation: formationPDA,
            authority: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      );

      // Envoyer la transaction
      const signature = await wallet?.adapter.sendTransaction(transaction, connection);
      
      // Attendre la confirmation
      if (signature) {
        await connection.confirmTransaction(signature);
      }

      return { sessionPDA, signature };
    } catch (err) {
      console.error("Erreur lors de la création de la session:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, program, wallet, connection, publicKey]);

  return {
    isAdmin,
    isLoading,
    error,
    createPDA,
    createFormation,
    createSession,
    calculateRentExemption
  };
}; 