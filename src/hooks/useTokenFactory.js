import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACTS, TOKEN_FACTORY_ABI } from '../config/contracts';

/**
 * Hook for creating tokens using the TokenFactory contract
 */
export function useTokenFactory() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const createToken = useCallback(async (name, symbol, totalSupply, decimals) => {
        if (!isConnected || !walletClient) {
            throw new Error('Wallet not connected');
        }

        setIsLoading(true);
        setError(null);

        try {
            // ABI for createToken function
            const abi = [{
                name: 'createToken',
                type: 'function',
                stateMutability: 'payable',
                inputs: [
                    { name: 'name', type: 'string' },
                    { name: 'symbol', type: 'string' },
                    { name: 'totalSupply', type: 'uint256' },
                    { name: 'decimals_', type: 'uint8' }
                ],
                outputs: [{ name: '', type: 'address' }]
            }];

            const hash = await walletClient.writeContract({
                address: CONTRACTS.TOKEN_FACTORY,
                abi,
                functionName: 'createToken',
                args: [name, symbol, BigInt(totalSupply), decimals],
                value: 0n
            });

            // Wait for transaction
            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            // Get token address from logs
            let tokenAddress = null;
            if (receipt.logs && receipt.logs.length > 0) {
                // The TokenCreated event should have the token address
                // For simplicity, we'll return the transaction hash
                tokenAddress = receipt.logs[0]?.address;
            }

            setIsLoading(false);
            return { hash, receipt, tokenAddress };
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, [isConnected, walletClient, publicClient]);

    const getTokensByCreator = useCallback(async (creator) => {
        if (!publicClient) return [];

        try {
            const abi = [{
                name: 'getTokensByCreator',
                type: 'function',
                stateMutability: 'view',
                inputs: [{ name: 'creator', type: 'address' }],
                outputs: [{ name: '', type: 'address[]' }]
            }];

            const tokens = await publicClient.readContract({
                address: CONTRACTS.TOKEN_FACTORY,
                abi,
                functionName: 'getTokensByCreator',
                args: [creator]
            });

            return tokens;
        } catch (err) {
            console.error('Error fetching tokens:', err);
            return [];
        }
    }, [publicClient]);

    return {
        createToken,
        getTokensByCreator,
        isLoading,
        error,
        contractAddress: CONTRACTS.TOKEN_FACTORY
    };
}

export default useTokenFactory;
