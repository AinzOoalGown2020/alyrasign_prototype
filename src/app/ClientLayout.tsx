"use client";

import { ReactNode } from 'react';
import { AppBar } from '@/components/layout/AppBar';
import { AutoConnectProvider } from '@/contexts/AutoConnectProvider';
import WalletProvider from '@/components/providers/WalletProvider';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AutoConnectProvider>
      <WalletProvider>
        <div className="min-h-screen">
          <AppBar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </WalletProvider>
    </AutoConnectProvider>
  );
} 