'use client';

import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export function WalletButton() {
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    if (connected && publicKey) {
      console.log('Wallet connected:', publicKey.toString());
    }
  }, [connected, publicKey]);

  return (
    <WalletMultiButtonDynamic 
      className="btn-primary"
      style={{ 
        backgroundColor: 'rgb(147, 51, 234)',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    />
  );
} 