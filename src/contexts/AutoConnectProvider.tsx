"use client";

import { createContext, useContext, useState, FC, ReactNode, useEffect } from 'react';

interface AutoConnectContextState {
  autoConnect: boolean;
  setAutoConnect: (autoConnect: boolean) => void;
}

const AutoConnectContext = createContext<AutoConnectContextState>({
  autoConnect: false,
  setAutoConnect: () => {},
});

export const useAutoConnect = () => {
  const context = useContext(AutoConnectContext);
  if (!context) {
    throw new Error('useAutoConnect must be used within an AutoConnectProvider');
  }
  return context;
};

interface AutoConnectProviderProps {
  children: ReactNode;
}

export const AutoConnectProvider: FC<AutoConnectProviderProps> = ({ children }) => {
  const [autoConnect, setAutoConnect] = useState<boolean>(true);

  useEffect(() => {
    // Vérifier si un wallet était précédemment connecté
    const wasConnected = localStorage.getItem('walletConnected');
    if (wasConnected === 'true') {
      setAutoConnect(true);
    }
  }, []);

  return (
    <AutoConnectContext.Provider value={{ autoConnect, setAutoConnect }}>
      {children}
    </AutoConnectContext.Provider>
  );
}; 