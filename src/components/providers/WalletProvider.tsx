"use client";

import { FC, ReactNode, useMemo, useEffect } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useAutoConnect } from '../../contexts/AutoConnectProvider';
import { clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

interface WalletProviderProps {
  children: ReactNode;
}

const WalletStateManager: FC<{ children: ReactNode }> = ({ children }) => {
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toString();
      console.log('WalletStateManager - Wallet connecté:', address);
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', address);
    } else {
      console.log('WalletStateManager - Wallet déconnecté');
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletAddress');
    }
  }, [connected, publicKey]);

  return <>{children}</>;
};

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const { autoConnect } = useAutoConnect();

  // Configuration du endpoint Solana
  const endpoint = useMemo(() => {
    console.log('WalletProvider - Initialisation endpoint');
    return clusterApiUrl('devnet');
  }, []);

  // Configuration des wallets supportés
  const wallets = useMemo(() => {
    console.log('WalletProvider - Initialisation des wallets');
    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ];
  }, []);

  console.log('WalletProvider - Rendu avec:', {
    endpoint,
    autoConnect,
    walletsCount: wallets.length
  });

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={autoConnect}>
        <WalletModalProvider>
          <WalletStateManager>
            {children}
          </WalletStateManager>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProvider; 