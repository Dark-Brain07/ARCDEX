import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { parseUnits, formatUnits, isAddress } from 'viem';

// ERC20 ABI for balanceOf
const ERC20_ABI = [
    {
        name: 'balanceOf',
        type: 'function',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        name: 'symbol',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view',
    },
    {
        name: 'decimals',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
        stateMutability: 'view',
    },
    {
        name: 'name',
        type: 'function',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
        stateMutability: 'view',
    }
];
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Settings, RefreshCw, Info, ChevronDown, X, Search } from 'lucide-react';
import { DEFAULT_TOKEN_LIST, TOKENS } from '../../config/network';
import { useDEX } from '../../hooks/useDEX';
import TokenListItem from '../../components/DEX/TokenListItem';
import './Swap.css';

const Swap = () => {
    const { address, isConnected } = useAccount();
    const { swap, getQuote, getReserves, isLoading: isSwapping, error } = useDEX();
    const [fromToken, setFromToken] = useState(TOKENS.USDC);
    const [toToken, setToToken] = useState(TOKENS.EURC);
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [slippage, setSlippage] = useState('0.5');
    const [showSettings, setShowSettings] = useState(false);
    const [showTokenModal, setShowTokenModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [importToken, setImportToken] = useState(null);
    const [swapError, setSwapError] = useState(null);

    // Fetch token balances
    const { data: fromTokenBalance } = useReadContract({
        address: fromToken.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        enabled: isConnected && !!address,
        watch: true,
    });

    const { data: toTokenBalance } = useReadContract({
        address: toToken.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        enabled: isConnected && !!address,
        watch: true,
    });

    // Format balances
    const formattedFromBalance = fromTokenBalance
        ? parseFloat(formatUnits(fromTokenBalance, fromToken.decimals)).toFixed(4)
        : '0.00';

    const formattedToBalance = toTokenBalance
        ? parseFloat(formatUnits(toTokenBalance, toToken.decimals)).toFixed(4)
        : '0.00';

    // Search Token Logic
    const isSearchAddress = isAddress(searchQuery);

    const { data: searchSymbol } = useReadContract({
        address: isSearchAddress ? searchQuery : undefined,
        abi: ERC20_ABI,
        functionName: 'symbol',
        enabled: isSearchAddress,
    });

    const { data: searchDecimals } = useReadContract({
        address: isSearchAddress ? searchQuery : undefined,
        abi: ERC20_ABI,
        functionName: 'decimals',
        enabled: isSearchAddress,
    });

    const { data: searchName } = useReadContract({
        address: isSearchAddress ? searchQuery : undefined,
        abi: ERC20_ABI,
        functionName: 'name',
        enabled: isSearchAddress,
    });

    useEffect(() => {
        if (isSearchAddress && searchSymbol && searchDecimals) {
            setImportToken({
                address: searchQuery,
                symbol: searchSymbol,
                name: searchName || searchSymbol,
                decimals: searchDecimals,
                logoURI: null // Default icon
            });
        } else {
            setImportToken(null);
        }
    }, [isSearchAddress, searchSymbol, searchDecimals, searchQuery, searchName]);

    // Get quote when amount changes
    useEffect(() => {
        const fetchQuote = async () => {
            if (fromAmount && parseFloat(fromAmount) > 0) {
                try {
                    const amountIn = parseUnits(fromAmount, fromToken.decimals);
                    const quote = await getQuote(amountIn, fromToken.address, toToken.address);
                    if (quote > 0n) {
                        setToAmount(formatUnits(quote, toToken.decimals));
                    } else {
                        // Fallback to simulated rate if no liquidity
                        const rate = fromToken.symbol === 'USDC' && toToken.symbol === 'EURc' ? 0.92 :
                            fromToken.symbol === 'EURc' && toToken.symbol === 'USDC' ? 1.08 : 1;
                        setToAmount((parseFloat(fromAmount) * rate).toFixed(6));
                    }
                } catch {
                    setToAmount('');
                }
            } else {
                setToAmount('');
            }
        };
        fetchQuote();
    }, [fromAmount, fromToken, toToken, getQuote]);

    const switchTokens = () => {
        setFromToken(toToken);
        setToToken(fromToken);
        setFromAmount(toAmount);
        setToAmount(fromAmount);
    };

    const handleSwap = async () => {
        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }

        setSwapError(null);

        try {
            const amountIn = parseUnits(fromAmount, fromToken.decimals);
            const amountOutMin = parseUnits(
                (parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(toToken.decimals),
                toToken.decimals
            );

            await swap(fromToken.address, toToken.address, amountIn, amountOutMin);

            // Reset after successful swap
            setFromAmount('');
            setToAmount('');
            alert('Swap successful!');
        } catch (err) {
            console.error('Swap error:', err);
            setSwapError(err.message);
            alert('Swap failed: ' + err.message);
        }
    };

    const selectToken = (token) => {
        if (showTokenModal === 'from') {
            if (token.address === toToken.address) {
                switchTokens();
            } else {
                setFromToken(token);
            }
        } else {
            if (token.address === fromToken.address) {
                switchTokens();
            } else {
                setToToken(token);
            }
        }
        setShowTokenModal(null);
        setSearchQuery('');
        setImportToken(null);
    };

    const filteredTokens = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase();
        const baseList = DEFAULT_TOKEN_LIST.filter(token =>
            token.name.toLowerCase().includes(lowerQuery) ||
            token.symbol.toLowerCase().includes(lowerQuery) ||
            token.address.toLowerCase() === lowerQuery
        );

        if (importToken && !baseList.find(t => t.address.toLowerCase() === importToken.address.toLowerCase())) {
            return [...baseList, importToken];
        }
        return baseList;
    }, [searchQuery, importToken]);

    const getButtonText = () => {
        if (!isConnected) return 'Connect Wallet';
        if (!fromAmount || parseFloat(fromAmount) === 0) return 'Enter Amount';
        if (isSwapping) return 'Swapping...';
        return 'Swap';
    };

    return (
        <div className="swap-page">
            <div className="swap-container">
                {/* Header */}
                <div className="swap-header">
                    <h1 className="swap-title">Swap</h1>
                    <button
                        className="swap-settings-btn"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <Settings size={20} />
                    </button>
                </div>

                {/* Settings Panel */}
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            className="swap-settings"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <div className="settings-row">
                                <span className="settings-label">
                                    Slippage Tolerance
                                    <Info size={14} />
                                </span>
                                <div className="slippage-options">
                                    {['0.1', '0.5', '1.0'].map(value => (
                                        <button
                                            key={value}
                                            className={`slippage-btn ${slippage === value ? 'active' : ''}`}
                                            onClick={() => setSlippage(value)}
                                        >
                                            {value}%
                                        </button>
                                    ))}
                                    <div className="slippage-custom">
                                        <input
                                            type="number"
                                            value={slippage}
                                            onChange={(e) => setSlippage(e.target.value)}
                                            placeholder="0.5"
                                        />
                                        <span>%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* From Token */}
                <div className="token-input-container">
                    <div className="token-input-col-left">
                        <span className="token-input-label">You Pay</span>
                        <input
                            type="number"
                            className="token-amount-input"
                            placeholder="0.0"
                            value={fromAmount}
                            onChange={(e) => setFromAmount(e.target.value)}
                        />
                        <span className="token-value">~$0.00</span>
                    </div>
                    <div className="token-input-col-right">
                        <span className="token-balance">Balance: {formattedFromBalance}</span>
                        <button
                            className="token-select-btn"
                            onClick={() => setShowTokenModal('from')}
                        >
                            <div className="token-icon">{fromToken.symbol.charAt(0)}</div>
                            <span className="token-symbol">{fromToken.symbol}</span>
                            <ChevronDown size={16} />
                        </button>
                        <div className="quick-amounts">
                            <button onClick={() => {
                                if (fromTokenBalance) {
                                    const balance = parseFloat(formatUnits(fromTokenBalance, fromToken.decimals));
                                    setFromAmount((balance * 0.25).toFixed(6));
                                }
                            }}>25%</button>
                            <button onClick={() => {
                                if (fromTokenBalance) {
                                    const balance = parseFloat(formatUnits(fromTokenBalance, fromToken.decimals));
                                    setFromAmount((balance * 0.5).toFixed(6));
                                }
                            }}>50%</button>
                            <button onClick={() => {
                                if (fromTokenBalance) {
                                    const balance = parseFloat(formatUnits(fromTokenBalance, fromToken.decimals));
                                    setFromAmount((balance * 0.75).toFixed(6));
                                }
                            }}>75%</button>
                            <button onClick={() => {
                                if (fromTokenBalance) {
                                    const balance = parseFloat(formatUnits(fromTokenBalance, fromToken.decimals));
                                    setFromAmount(balance.toFixed(6));
                                }
                            }}>MAX</button>
                        </div>
                    </div>
                </div>

                {/* Switch Button */}
                <div className="swap-switch-container">
                    <button className="swap-switch-btn" onClick={switchTokens}>
                        <ArrowDown size={20} />
                    </button>
                </div>

                {/* To Token */}
                <div className="token-input-container">
                    <div className="token-input-col-left">
                        <span className="token-input-label">You Receive</span>
                        <input
                            type="number"
                            className="token-amount-input"
                            placeholder="0.0"
                            value={toAmount}
                            readOnly
                        />
                        <span className="token-value">~$0.00</span>
                    </div>
                    <div className="token-input-col-right">
                        <span className="token-balance">Balance: {formattedToBalance}</span>
                        <button
                            className="token-select-btn"
                            onClick={() => setShowTokenModal('to')}
                        >
                            <div className="token-icon">{toToken.symbol.charAt(0)}</div>
                            <span className="token-symbol">{toToken.symbol}</span>
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>

                {/* Swap Details */}
                {fromAmount && parseFloat(fromAmount) > 0 && (
                    <motion.div
                        className="swap-details"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <div className="swap-detail-row">
                            <span>Rate</span>
                            <span>1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}</span>
                        </div>
                        <div className="swap-detail-row">
                            <span>Price Impact</span>
                            <span className="text-success">&lt; 0.01%</span>
                        </div>
                        <div className="swap-detail-row">
                            <span>Min. Received</span>
                            <span>{(parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {toToken.symbol}</span>
                        </div>
                        <div className="swap-detail-row">
                            <span>Network Fee</span>
                            <span>~$0.01</span>
                        </div>
                    </motion.div>
                )}

                {/* Swap Button */}
                <button
                    className={`swap-btn ${isSwapping ? 'loading' : ''}`}
                    onClick={handleSwap}
                    disabled={!isConnected || !fromAmount || parseFloat(fromAmount) === 0 || isSwapping}
                >
                    {isSwapping && <RefreshCw size={20} className="animate-spin" />}
                    {getButtonText()}
                </button>
            </div>

            {/* Token Selection Modal */}
            <AnimatePresence>
                {showTokenModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTokenModal(null)}
                    >
                        <motion.div
                            className="token-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="token-modal-header">
                                <h3>Select a Token</h3>
                                <button className="modal-close" onClick={() => setShowTokenModal(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="token-search">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name or address"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="token-list">
                                {filteredTokens.length > 0 ? (
                                    filteredTokens.map(token => (
                                        <TokenListItem
                                            key={token.address}
                                            token={token}
                                            isSelected={
                                                (showTokenModal === 'from' && token.address === fromToken.address) ||
                                                (showTokenModal === 'to' && token.address === toToken.address)
                                            }
                                            onSelect={() => selectToken(token)}
                                        />
                                    ))
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        {isSearchAddress && !importToken ? 'Loading token details...' : 'No tokens found'}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Swap;
