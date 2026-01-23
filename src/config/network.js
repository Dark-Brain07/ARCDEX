// Arc Testnet Network Configuration
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
        },
        public: {
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

// Token Addresses on Arc Testnet
export const TOKENS = {
    USDC: {
        address: '0x3600000000000000000000000000000000000000',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: '/tokens/usdc.svg',
        isNative: true
    },
    USYC: {
        address: '0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C',
        symbol: 'USYC',
        name: 'US Yield Coin',
        decimals: 6,
        logoURI: '/tokens/usyc.svg',
        isYieldBearing: true
    },
    EURC: {
        address: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
        symbol: 'EURC',
        name: 'Euro Coin',
        decimals: 6,
        logoURI: '/tokens/eurc.svg'
    },
    ARX: {
        address: '0x52ba246a3e98a40b284566e032fc035dd704ec7b',
        symbol: 'ARX',
        name: 'ARC DEX',
        decimals: 18,
        logoURI: '/tokens/arx.svg',
        isOfficial: true
    }
};

// Default token list for the DEX
export const DEFAULT_TOKEN_LIST = [
    TOKENS.USDC,
    TOKENS.EURC,
    TOKENS.ARX
];

// Special Addresses
export const SPECIAL_ADDRESSES = {
    ENTITLEMENT: '0xcc205224862c7641930c87679e98999d23c26113',
    TELLER: '0x9fdF14c5B14173D74C08Af27AebFf39240dC105A'
};

// Network helpers
export const getExplorerUrl = (type, value) => {
    const baseUrl = arcTestnet.blockExplorers.default.url;
    switch (type) {
        case 'tx':
            return `${baseUrl}/tx/${value}`;
        case 'address':
            return `${baseUrl}/address/${value}`;
        case 'token':
            return `${baseUrl}/token/${value}`;
        case 'block':
            return `${baseUrl}/block/${value}`;
        default:
            return baseUrl;
    }
};

export const formatAddress = (address, chars = 4) => {
    if (!address) return '';
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export default arcTestnet;
