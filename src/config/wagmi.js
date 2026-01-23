import { createConfig, http } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient } from '@tanstack/react-query';

// Arc Testnet chain definition
export const arcTestnet = {
    id: 5042002,
    name: 'Arc Testnet',
    nativeCurrency: {
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.testnet.arc.network']
        }
    },
    blockExplorers: {
        default: {
            name: 'ArcScan',
            url: 'https://testnet.arcscan.app'
        }
    },
    testnet: true
};

// Project ID from WalletConnect Cloud
// Get your own at https://cloud.walletconnect.com
const projectId = 'YOUR_PROJECT_ID'; // Replace with your WalletConnect Project ID

// Wagmi metadata
const metadata = {
    name: 'Arc DApp',
    description: 'DEX & NFT Marketplace on Arc Network',
    url: 'https://arc-dapp.vercel.app',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Create wagmi config
export const wagmiConfig = createConfig({
    chains: [arcTestnet],
    transports: {
        [arcTestnet.id]: http('https://rpc.testnet.arc.network')
    },
    ssr: false
});

// Create query client for React Query
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // 1 minute
            refetchOnWindowFocus: false,
        },
    },
});

// Initialize Web3Modal
export const initWeb3Modal = () => {
    createWeb3Modal({
        wagmiConfig,
        projectId,
        chains: [arcTestnet],
        themeMode: 'dark',
        themeVariables: {
            '--w3m-color-mix': '#00FFFF',
            '--w3m-color-mix-strength': 20,
            '--w3m-accent': '#00FFFF',
            '--w3m-border-radius-master': '12px',
        },
        featuredWalletIds: [
            'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        ],
    });
};

export default wagmiConfig;
