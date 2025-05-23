import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { Program } from '@coral-xyz/anchor'

// ID du programme par défaut
export const DEFAULT_PROGRAM_ID = 'v69C2KjiWjhUcRTKuotEY1E1PykP4oUtFaBE8ZCg5yJ'

interface ProgramState {
  programExists: boolean;
  storageExists: boolean;
}

export const checkProgramState = async (
  connection: Connection,
  wallet: ReturnType<typeof useWallet>
): Promise<ProgramState> => {
  try {
    // Vérifier si le programme existe
    const programId = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || DEFAULT_PROGRAM_ID
    let programPubkey: PublicKey
    
    try {
      programPubkey = new PublicKey(programId)
    } catch (err) {
      console.error("Erreur lors de la création de la clé publique:", err)
      return {
        programExists: false,
        storageExists: false,
      }
    }
    
    const programAccount = await connection.getAccountInfo(programPubkey)
    const programExists = !!programAccount

    // Vérifier si le storage existe
    const [storagePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('storage')],
      programPubkey
    )
    const storageAccount = await connection.getAccountInfo(storagePda)
    const storageExists = !!storageAccount

    return {
      programExists,
      storageExists,
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'état du programme:', error)
    return {
      programExists: false,
      storageExists: false,
    }
  }
} 