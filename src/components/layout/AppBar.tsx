"use client";

import { FC, useState, useEffect } from 'react';
import Link from "next/link";
import dynamic from 'next/dynamic';
import React from "react";
import { useAutoConnect } from '../../contexts/AutoConnectProvider';
import NetworkSwitcher from '../ui/NetworkSwitcher';
import NavElement from '../ui/nav-element';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import { checkProgramState } from '../../lib/solana';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

// Adresses des administrateurs avec accès complet
const ADMIN_ADDRESSES = [
  process.env.NEXT_PUBLIC_ADMIN_WALLET || "79ziyYSUHVNENrJVinuotWZQ2TX7n44vSeo1cgxFPzSy",
  process.env.NEXT_PUBLIC_ADMIN_WALLET_1 || "HYogRLGSbAxY1dYkAvBsNdc3QMowLL9ZnJ1qhW5Ew7hG",
  process.env.NEXT_PUBLIC_ADMIN_WALLET_2 || "E6AdR4Q6H6N7mnXeJJ5bUG8oMfPu9e9PNM1emMsw376g"
];

// Définir des types pour les rôles
type UserRole = 'formateur' | 'etudiant' | null;

export const AppBar: React.FC = () => {
  const { autoConnect, setAutoConnect } = useAutoConnect();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const wallet = useWallet();
  const { connection } = useConnection();
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [isBlockchainInitialized, setIsBlockchainInitialized] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  
  // Effet pour suivre l'état de connexion du wallet
  useEffect(() => {
    const isConnected = wallet.connected && !!wallet.publicKey;
    console.log('État du wallet:', {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toString(),
      isConnected
    });
    setWalletConnected(isConnected);
  }, [wallet.connected, wallet.publicKey]);
  
  // Vérifier si le programme est initialisé sur la blockchain
  useEffect(() => {
    const checkBlockchainState = async () => {
      if (walletConnected && connection && wallet.publicKey) {
        try {
          console.log('Vérification de l\'état de la blockchain...');
          const state = await checkProgramState(connection, wallet);
          console.log('État de la blockchain:', state);
          setIsBlockchainInitialized(state.programExists && state.storageExists);
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'état de la blockchain:', error);
          setIsBlockchainInitialized(false);
        }
      } else {
        setIsBlockchainInitialized(false);
      }
    };
    
    checkBlockchainState();
  }, [walletConnected, connection, wallet]);
  
  // Vérifier le rôle de l'utilisateur
  useEffect(() => {
    const checkUserRole = () => {
      if (walletConnected && wallet.publicKey) {
        const address = wallet.publicKey.toString();
        
        // Vérifier si c'est une adresse admin
        if (ADMIN_ADDRESSES.includes(address)) {
          console.log('Adresse admin détectée dans AppBar:', {
            address,
            ADMIN_ADDRESSES
          });
          setUserRole('formateur');
          return;
        }
        
        // Pour les autres utilisateurs, vérifier le localStorage
        const storedRole = localStorage.getItem(`role_${address}`);
        if (storedRole) {
          console.log('Rôle trouvé dans localStorage:', storedRole);
          setUserRole(storedRole as UserRole);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    };
    
    checkUserRole();
  }, [walletConnected, wallet.publicKey]);
  
  const handleDisconnect = async () => {
    // Réinitialiser l'état lors de la déconnexion
    setWalletConnected(false);
    setUserRole(null);
    setIsBlockchainInitialized(false);
  };
  
  return (
    <div className="w-full">
      {/* NavBar / Header */}
      <div className="navbar flex h-20 flex-row md:mb-2 shadow-lg w-full">
        <div className="navbar-start flex-1 flex items-center">
          <div className="flex w-22 h-22 md:p-2 ml-4 md:ml-16 items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex-shrink-0 w-[50px] h-[50px] md:w-[70px] md:h-[70px] relative flex items-center">
                <Image 
                  src="/AlyraSign.png" 
                  alt="AlyraSign Logo" 
                  width={150}
                  height={50}
                  sizes="(max-width: 768px) 100px, 150px"
                  className="object-contain hover:scale-105 transition-transform duration-200"
                  priority
                />
              </div>
              <Link href="/" className="text-purple-400 hover:text-white text-xl md:text-2xl font-bold transition-colors duration-200">
                AlyraSign
              </Link>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="navbar-end flex-1 flex justify-end items-center">
          <div className="hidden md:inline-flex items-center justify-end gap-6 h-full">
            <NavElement
              label="Accueil"
              href="/"
              navigationStarts={() => setIsNavOpen(false)}
              className="nav-link"
            />
            
            {wallet.connected && userRole === 'formateur' && (
              <>
                <NavElement
                  label="Gestion des Formations"
                  href="/admin/formations"
                  navigationStarts={() => setIsNavOpen(false)}
                  className="nav-link whitespace-nowrap"
                />
                <NavElement
                  label="Gestion des Étudiants"
                  href="/admin/etudiants"
                  navigationStarts={() => setIsNavOpen(false)}
                  className="nav-link whitespace-nowrap"
                />
                <NavElement
                  label="Administration"
                  href="/admin"
                  navigationStarts={() => setIsNavOpen(false)}
                  className="nav-link"
                />
              </>
            )}
            
            {wallet.connected && userRole === 'etudiant' && (
              <NavElement
                label="Portail Étudiant"
                href="/etudiants"
                navigationStarts={() => setIsNavOpen(false)}
                className="nav-link whitespace-nowrap"
              />
            )}
            
            <div className="flex items-center h-full">
              <WalletMultiButtonDynamic className="btn-primary mr-6 h-full flex items-center" />
            </div>
          </div>
          
          {/* Menu mobile */}
          <div className="md:hidden">
            <button
              className="flex items-center px-3 py-2 border rounded text-purple-400 border-purple-400 hover:text-white hover:border-white mr-6 transition-colors duration-200"
              onClick={() => setIsNavOpen(!isNavOpen)}>
              <svg className="fill-current h-5 w-5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                {isNavOpen 
                  ? <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/>
                  : <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/>
                }
              </svg>
            </button>
          </div>
          
          {/* Menu mobile déroulant */}
          {isNavOpen && (
            <div className="absolute top-20 right-0 bg-black/90 backdrop-blur-md w-full z-10 md:hidden border-b border-gray-800">
              <div className="flex flex-col p-4 space-y-3">
                <NavElement
                  label="Accueil"
                  href="/"
                  navigationStarts={() => setIsNavOpen(false)}
                  className="nav-link"
                />
                
                {wallet.connected && userRole === 'formateur' && (
                  <>
                    <NavElement
                      label="Gestion des Formations"
                      href="/admin/formations"
                      navigationStarts={() => setIsNavOpen(false)}
                      className="nav-link"
                    />
                    <NavElement
                      label="Gestion des Étudiants"
                      href="/admin/etudiants"
                      navigationStarts={() => setIsNavOpen(false)}
                      className="nav-link"
                    />
                    <NavElement
                      label="Administration"
                      href="/admin"
                      navigationStarts={() => setIsNavOpen(false)}
                      className="nav-link"
                    />
                  </>
                )}
                
                {wallet.connected && userRole === 'etudiant' && (
                  <NavElement
                    label="Portail Étudiant"
                    href="/etudiants"
                    navigationStarts={() => setIsNavOpen(false)}
                    className="nav-link"
                  />
                )}
                
                <div className="flex justify-center mt-4">
                  <WalletMultiButtonDynamic className="btn-primary" />
                </div>
              </div>
            </div>
          )}
          
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="btn btn-square btn-ghost text-right mr-4 hover:bg-purple-600/20">
              <NetworkSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 