"use client";

import { FC, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster } from '@solana/web3.js';

const NetworkSwitcher: FC = () => {
  const { connection, setConnection } = useConnection();
  const [isOpen, setIsOpen] = useState(false);

  const networks: { name: string; endpoint: string }[] = [
    { name: 'Mainnet', endpoint: 'https://api.mainnet-beta.solana.com' },
    { name: 'Devnet', endpoint: 'https://api.devnet.solana.com' },
    { name: 'Testnet', endpoint: 'https://api.testnet.solana.com' },
  ];

  const handleNetworkChange = (endpoint: string) => {
    setConnection(endpoint as Cluster);
    setIsOpen(false);
  };

  const currentNetwork = connection.rpcEndpoint.includes('mainnet') ? 'Mainnet' :
                        connection.rpcEndpoint.includes('devnet') ? 'Devnet' :
                        connection.rpcEndpoint.includes('testnet') ? 'Testnet' : 'Custom';

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 text-purple-400 hover:text-white transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        </svg>
        <span className="text-sm font-medium">{currentNetwork}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-black/90 backdrop-blur-md ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {networks.map((network) => (
              <button
                key={network.name}
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-purple-600/20 hover:text-white"
                onClick={() => handleNetworkChange(network.endpoint)}
              >
                {network.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSwitcher; 