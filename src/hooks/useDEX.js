import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { CONTRACTS } from '../config/contracts';

/**
 * Hook for interacting with the ArcDEX contract
 */
export function useDEX() {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // ABI fragments
    const DEX_ABI = [
        {
            name: 'swap',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'tokenIn', type: 'address' },
                { name: 'tokenOut', type: 'address' },
                { name: 'amountIn', type: 'uint256' },
                { name: 'amountOutMin', type: 'uint256' }
            ],
            outputs: [{ name: 'amountOut', type: 'uint256' }]
        },
        {
            name: 'addLiquidity',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'tokenA', type: 'address' },
                { name: 'tokenB', type: 'address' },
                { name: 'amountADesired', type: 'uint256' },
                { name: 'amountBDesired', type: 'uint256' },
                { name: 'amountAMin', type: 'uint256' },
                { name: 'amountBMin', type: 'uint256' }
            ],
            outputs: [
                { name: 'amountA', type: 'uint256' },
                { name: 'amountB', type: 'uint256' },
                { name: 'liq', type: 'uint256' }
            ]
        },
        {
            name: 'removeLiquidity',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
                { name: 'tokenA', type: 'address' },
                { name: 'tokenB', type: 'address' },
                { name: 'liq', type: 'uint256' },
                { name: 'amountAMin', type: 'uint256' },
                { name: 'amountBMin', type: 'uint256' }
            ],
            outputs: [
                { name: 'amountA', type: 'uint256' },
                { name: 'amountB', type: 'uint256' }
            ]
        },
        {
            name: 'getAmountOut',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'amountIn', type: 'uint256' },
                { name: 'reserveIn', type: 'uint256' },
                { name: 'reserveOut', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'uint256' }]
        },
        {
            name: 'getReserves',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'tokenA', type: 'address' },
                { name: 'tokenB', type: 'address' }
            ],
            outputs: [
                { name: 'reserveA', type: 'uint256' },
                { name: 'reserveB', type: 'uint256' }
            ]
        },
        {
            name: 'getLiquidity',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'tokenA', type: 'address' },
                { name: 'tokenB', type: 'address' },
                { name: 'provider', type: 'address' }
            ],
            outputs: [{ name: '', type: 'uint256' }]
        },
        {
            name: 'getPair',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'tokenA', type: 'address' },
                { name: 'tokenB', type: 'address' }
            ],
            outputs: [{ name: '', type: 'uint256' }]
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
        },
        {
            name: 'allowance',
            type: 'function',
            stateMutability: 'view',
            inputs: [
                { name: 'owner', type: 'address' },
                { name: 'spender', type: 'address' }
            ],
            outputs: [{ name: '', type: 'uint256' }]
        },
        {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: '', type: 'uint256' }]
        }
    ];

    // Approve token spending
    const approveToken = useCallback(async (tokenAddress, amount) => {
        if (!walletClient) throw new Error('Wallet not connected');

        const hash = await walletClient.writeContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [CONTRACTS.DEX, amount]
        });

        return publicClient.waitForTransactionReceipt({ hash });
    }, [walletClient, publicClient]);

    // Check allowance
    const checkAllowance = useCallback(async (tokenAddress, owner) => {
        if (!publicClient) return 0n;

        return publicClient.readContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [owner, CONTRACTS.DEX]
        });
    }, [publicClient]);

    // Get reserves for a pair
    const getReserves = useCallback(async (tokenA, tokenB) => {
        if (!publicClient) return { reserveA: 0n, reserveB: 0n };

        try {
            const [reserveA, reserveB] = await publicClient.readContract({
                address: CONTRACTS.DEX,
                abi: DEX_ABI,
                functionName: 'getReserves',
                args: [tokenA, tokenB]
            });
            return { reserveA, reserveB };
        } catch {
            return { reserveA: 0n, reserveB: 0n };
        }
    }, [publicClient]);

    // Get quote for swap
    const getQuote = useCallback(async (amountIn, tokenIn, tokenOut) => {
        if (!publicClient || amountIn === 0n) return 0n;

        try {
            const { reserveA, reserveB } = await getReserves(tokenIn, tokenOut);
            if (reserveA === 0n || reserveB === 0n) return 0n;

            const amountOut = await publicClient.readContract({
                address: CONTRACTS.DEX,
                abi: DEX_ABI,
                functionName: 'getAmountOut',
                args: [amountIn, reserveA, reserveB]
            });
            return amountOut;
        } catch {
            return 0n;
        }
    }, [publicClient, getReserves]);

    // Swap tokens
    const swap = useCallback(async (tokenIn, tokenOut, amountIn, amountOutMin) => {
        if (!walletClient) throw new Error('Wallet not connected');

        setIsLoading(true);
        setError(null);

        try {
            // Check and approve if needed
            const allowance = await checkAllowance(tokenIn, address);
            if (allowance < amountIn) {
                await approveToken(tokenIn, amountIn);
            }

            const hash = await walletClient.writeContract({
                address: CONTRACTS.DEX,
                abi: DEX_ABI,
                functionName: 'swap',
                args: [tokenIn, tokenOut, amountIn, amountOutMin]
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            setIsLoading(false);
            return { hash, receipt };
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, [walletClient, publicClient, address, checkAllowance, approveToken]);

    // Add liquidity
    const addLiquidity = useCallback(async (tokenA, tokenB, amountA, amountB, slippage = 1) => {
        if (!walletClient) throw new Error('Wallet not connected');

        setIsLoading(true);
        setError(null);

        try {
            // Approve both tokens
            const allowanceA = await checkAllowance(tokenA, address);
            const allowanceB = await checkAllowance(tokenB, address);

            if (allowanceA < amountA) {
                await approveToken(tokenA, amountA);
            }
            if (allowanceB < amountB) {
                await approveToken(tokenB, amountB);
            }

            const minA = amountA * BigInt(100 - slippage) / 100n;
            const minB = amountB * BigInt(100 - slippage) / 100n;

            const hash = await walletClient.writeContract({
                address: CONTRACTS.DEX,
                abi: DEX_ABI,
                functionName: 'addLiquidity',
                args: [tokenA, tokenB, amountA, amountB, minA, minB]
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            setIsLoading(false);
            return { hash, receipt };
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
            throw err;
        }
    }, [walletClient, publicClient, address, checkAllowance, approveToken]);

    // Get user's liquidity
    const getUserLiquidity = useCallback(async (tokenA, tokenB) => {
        if (!publicClient || !address) return 0n;

        try {
            return await publicClient.readContract({
                address: CONTRACTS.DEX,
                abi: DEX_ABI,
                functionName: 'getLiquidity',
                args: [tokenA, tokenB, address]
            });
        } catch {
            return 0n;
        }
    }, [publicClient, address]);

    return {
        swap,
        addLiquidity,
        getReserves,
        getQuote,
        getUserLiquidity,
        approveToken,
        checkAllowance,
        isLoading,
        error,
        contractAddress: CONTRACTS.DEX
    };
}

export default useDEX;
