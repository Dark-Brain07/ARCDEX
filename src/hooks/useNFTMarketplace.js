import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { CONTRACTS } from '../config/contracts';

/**
 * Hook for interacting with the NFT Marketplace contract
 */
export function useNFTMarketplace() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // ABI fragments
    const MARKETPLACE_ABI = [
        {
            name: 'listItem',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'nftContract', type: 'address' },
                { name: 'tokenId', type: 'uint256' },
                { name: 'price', type: 'uint256' }
            ],
            outputs: []
        },
        {
            name: 'buyItem',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'nftContract', type: 'address' },
                { name: 'tokenId', type: 'uint256' }
            ],
            outputs: []
        },
        {
            name: 'cancelListing',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'nftContract', type: 'address' },
                { name: 'tokenId', type: 'uint256' }
            ],
            outputs: []
        },
        {
            name: 'makeOffer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'nftContract', type: 'address' },
                { name: 'tokenId', type: 'uint256' },
                { name: 'amount', type: 'uint256' },
                { name: 'expirationTime', type: 'uint256' }
            ],
            outputs: []
        },
        {
            name: 'acceptOffer',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'nftContract', type: 'address' },
                { name: 'tokenId', type: 'uint256' },
                { name: 'offerer', type: 'address' }
            ],
            outputs: []
        },
        {
            name: 'getListing',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'nftContract', type: 'address' },
                { name: 'tokenId', type: 'uint256' }
            ],
            outputs: [
                { name: 'seller', type: 'address' },
                { name: 'price', type: 'uint256' },
                { name: 'isActive', type: 'bool' }
            ]
        },
        {
            name: 'getOffer',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'nftContract', type: 'address' },
                { name: 'tokenId', type: 'uint256' },
                { name: 'offerer', type: 'address' }
            ],
            outputs: [
                { name: 'amount', type: 'uint256' },
                { name: 'expirationTime', type: 'uint256' },
                { name: 'isActive', type: 'bool' }
            ]
        },
        {
            name: 'addCollection',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'nftContract', type: 'address' },
                { name: 'name', type: 'string' },
                { name: 'imageURI', type: 'string' }
            ],
            outputs: []
        },
        {
            name: 'getCollection',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'nftContract', type: 'address' }],
            outputs: [
                { name: 'name', type: 'string' },
                { name: 'imageURI', type: 'string' },
                { name: 'creator', type: 'address' },
                { name: 'floorPrice', type: 'uint256' },
                { name: 'totalVolume', type: 'uint256' },
                { name: 'isVerified', type: 'bool' }
            ]
        },
        {
            name: 'getAllCollections',
            type: 'function',
            stateMutability: 'view',
            inputs: [],
            outputs: [{ name: '', type: 'address[]' }]
        }
    ];

    const ERC721_ABI = [
        {
            name: 'setApprovalForAll',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'operator', type: 'address' },
                { name: 'approved', type: 'bool' }
            ],
            outputs: []
        },
        {
            name: 'isApprovedForAll',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'owner', type: 'address' },
                { name: 'operator', type: 'address' }
            ],
            outputs: [{ name: '', type: 'bool' }]
        }
    ];

    const ERC20_ABI = [
        {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }]
        }
    ];

    // List NFT
    const listItem = useCallback(async (nftContract, tokenId, price) => {
        if (!walletClient) throw new Error('Wallet not connected');

        setIsLoading(true);
        setError(null);

        try {
            // Check if approved
            const isApproved = await publicClient.readContract({
                address: nftContract,
                abi: ERC721_ABI,
                functionName: 'isApprovedForAll',
                args: [address, CONTRACTS.NFT_MARKETPLACE]
            });

            if (!isApproved) {
                const approveHash = await walletClient.writeContract({
                    address: nftContract,
                    abi: ERC721_ABI,
                    functionName: 'setApprovalForAll',
                    args: [CONTRACTS.NFT_MARKETPLACE, true]
                });
                await publicClient.waitForTransactionReceipt({ hash: approveHash });
            }

            const hash = await walletClient.writeContract({
                address: CONTRACTS.NFT_MARKETPLACE,
                abi: MARKETPLACE_ABI,
                functionName: 'listItem',
                args: [nftContract, BigInt(tokenId), price]
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            setIsLoading(false);
            return { hash, receipt };
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, [walletClient, publicClient, address]);

    // Buy NFT
    const buyItem = useCallback(async (nftContract, tokenId, price) => {
        if (!walletClient) throw new Error('Wallet not connected');

        setIsLoading(true);
        setError(null);

        try {
            // Approve USDC spending
            const approveHash = await walletClient.writeContract({
                address: CONTRACTS.USDC,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [CONTRACTS.NFT_MARKETPLACE, price]
            });
            await publicClient.waitForTransactionReceipt({ hash: approveHash });

            const hash = await walletClient.writeContract({
                address: CONTRACTS.NFT_MARKETPLACE,
                abi: MARKETPLACE_ABI,
                functionName: 'buyItem',
                args: [nftContract, BigInt(tokenId)]
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            setIsLoading(false);
            return { hash, receipt };
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, [walletClient, publicClient]);

    // Cancel listing
    const cancelListing = useCallback(async (nftContract, tokenId) => {
        if (!walletClient) throw new Error('Wallet not connected');

        const hash = await walletClient.writeContract({
            address: CONTRACTS.NFT_MARKETPLACE,
            abi: MARKETPLACE_ABI,
            functionName: 'cancelListing',
            args: [nftContract, BigInt(tokenId)]
        });

        return publicClient.waitForTransactionReceipt({ hash });
    }, [walletClient, publicClient]);

    // Make offer
    const makeOffer = useCallback(async (nftContract, tokenId, amount, expirationDays = 7) => {
        if (!walletClient) throw new Error('Wallet not connected');

        setIsLoading(true);
        try {
            // Approve USDC
            const approveHash = await walletClient.writeContract({
                address: CONTRACTS.USDC,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [CONTRACTS.NFT_MARKETPLACE, amount]
            });
            await publicClient.waitForTransactionReceipt({ hash: approveHash });

            const expiration = BigInt(Math.floor(Date.now() / 1000) + expirationDays * 24 * 60 * 60);

            const hash = await walletClient.writeContract({
                address: CONTRACTS.NFT_MARKETPLACE,
                abi: MARKETPLACE_ABI,
                functionName: 'makeOffer',
                args: [nftContract, BigInt(tokenId), amount, expiration]
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            setIsLoading(false);
            return { hash, receipt };
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, [walletClient, publicClient]);

    // Accept offer
    const acceptOffer = useCallback(async (nftContract, tokenId, offerer) => {
        if (!walletClient) throw new Error('Wallet not connected');

        const hash = await walletClient.writeContract({
            address: CONTRACTS.NFT_MARKETPLACE,
            abi: MARKETPLACE_ABI,
            functionName: 'acceptOffer',
            args: [nftContract, BigInt(tokenId), offerer]
        });

        return publicClient.waitForTransactionReceipt({ hash });
    }, [walletClient, publicClient]);

    // Get listing
    const getListing = useCallback(async (nftContract, tokenId) => {
        if (!publicClient) return null;

        try {
            const [seller, price, isActive] = await publicClient.readContract({
                address: CONTRACTS.NFT_MARKETPLACE,
                abi: MARKETPLACE_ABI,
                functionName: 'getListing',
                args: [nftContract, BigInt(tokenId)]
            });
            return { seller, price, isActive };
        } catch {
            return null;
        }
    }, [publicClient]);

    // Add collection
    const addCollection = useCallback(async (nftContract, name, imageURI) => {
        if (!walletClient) throw new Error('Wallet not connected');

        const hash = await walletClient.writeContract({
            address: CONTRACTS.NFT_MARKETPLACE,
            abi: MARKETPLACE_ABI,
            functionName: 'addCollection',
            args: [nftContract, name, imageURI]
        });

        return publicClient.waitForTransactionReceipt({ hash });
    }, [walletClient, publicClient]);

    // Get all collections
    const getAllCollections = useCallback(async () => {
        if (!publicClient) return [];

        try {
            return await publicClient.readContract({
                address: CONTRACTS.NFT_MARKETPLACE,
                abi: MARKETPLACE_ABI,
                functionName: 'getAllCollections',
                args: []
            });
        } catch {
            return [];
        }
    }, [publicClient]);

    return {
        listItem,
        buyItem,
        cancelListing,
        makeOffer,
        acceptOffer,
        getListing,
        addCollection,
        getAllCollections,
        isLoading,
        error,
        contractAddress: CONTRACTS.NFT_MARKETPLACE
    };
}

export default useNFTMarketplace;
