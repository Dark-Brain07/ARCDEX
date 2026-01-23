import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { parseUnits, formatUnits, isAddress } from 'viem';
import { useDEX } from '../../hooks/useDEX';
import { motion } from 'framer-motion';
import { Droplets, Plus, Minus, ChevronDown, X, Search, Settings, Info } from 'lucide-react';
import { DEFAULT_TOKEN_LIST, TOKENS } from '../../config/network';
import TokenListItem from '../../components/DEX/TokenListItem';
import './Liquidity.css';

// ERC20 ABI
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

const Liquidity = () => {
    const { address, isConnected } = useAccount();
    const { addLiquidity, isLoading } = useDEX();
    const [activeTab, setActiveTab] = useState('add');
    const [tokenA, setTokenA] = useState(TOKENS.USDC);
    const [tokenB, setTokenB] = useState(TOKENS.EURC);
    const [amountA, setAmountA] = useState('');
    const [amountB, setAmountB] = useState('');
    const [showTokenModal, setShowTokenModal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [importToken, setImportToken] = useState(null);

    // Fetch balances
    const { data: balanceA } = useReadContract({
        address: tokenA.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        enabled: isConnected && !!address,
        watch: true,
    });

    const { data: balanceB } = useReadContract({
        address: tokenB.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        enabled: isConnected && !!address,
        watch: true,
    });

    const formattedBalanceA = balanceA
        ? parseFloat(formatUnits(balanceA, tokenA.decimals)).toFixed(4)
        : '0.00';

    const formattedBalanceB = balanceB
        ? parseFloat(formatUnits(balanceB, tokenB.decimals)).toFixed(4)
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


    // Mock user positions
    const userPositions = [
        {
            id: 1,
            tokenA: TOKENS.USDC,
            tokenB: TOKENS.EURC,
            liquidity: '1,234.56',
            valueUSD: '$2,450.00',
            share: '0.05%'
        }
    ];

    const selectToken = (token) => {
        if (showTokenModal === 'A') {
            if (token.address === tokenB.address) {
                setTokenB(tokenA);
            }
            setTokenA(token);
            setAmountA(''); // Reset amount on token change
        } else {
            if (token.address === tokenA.address) {
                setTokenA(tokenB);
            }
            setTokenB(token);
            setAmountB(''); // Reset amount on token change
        }
        setShowTokenModal(null);
        setSearchQuery('');
        setImportToken(null);
    };

    const handleAddLiquidity = async () => {
        if (!isConnected || !amountA || !amountB) return;

        try {
            const amountADesired = parseUnits(amountA, tokenA.decimals);
            const amountBDesired = parseUnits(amountB, tokenB.decimals);

            await addLiquidity(
                tokenA.address,
                tokenB.address,
                amountADesired,
                amountBDesired
            );

            // Clear inputs on success
            setAmountA('');
            setAmountB('');
            alert('Liquidity added successfully!');
        } catch (error) {
            console.error('Failed to add liquidity:', error);
            alert(`Failed to add liquidity: ${error.message}`);
        }
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

    return (
        <div className="liquidity-page">
            <div className="liquidity-container">
                {/* Header */}
                <div className="liquidity-header">
                    <div className="liquidity-icon">
                        <Droplets size={32} />
                    </div>
                    <h1 className="liquidity-title">Liquidity</h1>
                    <p className="liquidity-description">
                        Add liquidity to earn trading fees
                    </p>
                </div>

                {/* Tabs */}
                <div className="liquidity-tabs">
                    <button
                        className={`liquidity-tab ${activeTab === 'add' ? 'active' : ''}`}
                        onClick={() => setActiveTab('add')}
                    >
                        <Plus size={18} />
                        Add
                    </button>
                    <button
                        className={`liquidity-tab ${activeTab === 'remove' ? 'active' : ''}`}
                        onClick={() => setActiveTab('remove')}
                    >
                        <Minus size={18} />
                        Remove
                    </button>
                </div>

                {activeTab === 'add' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="add-liquidity"
                    >
                        {/* Token A Input */}
                        <div className="token-input-container">
                            <div className="token-input-col-left">
                                <span className="token-input-label">Token A</span>
                                <input
                                    type="number"
                                    className="token-amount-input"
                                    placeholder="0.0"
                                    value={amountA}
                                    onChange={(e) => setAmountA(e.target.value)}
                                />
                            </div>
                            <div className="token-input-col-right">
                                <span className="token-balance">Balance: {formattedBalanceA}</span>
                                <button
                                    className="token-select-btn"
                                    onClick={() => setShowTokenModal('A')}
                                >
                                    <div className="token-icon">{tokenA.symbol.charAt(0)}</div>
                                    <span className="token-symbol">{tokenA.symbol}</span>
                                    <ChevronDown size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Plus Icon */}
                        <div className="liquidity-plus">
                            <Plus size={20} />
                        </div>

                        {/* Token B Input */}
                        <div className="token-input-container">
                            <div className="token-input-col-left">
                                <span className="token-input-label">Token B</span>
                                <input
                                    type="number"
                                    className="token-amount-input"
                                    placeholder="0.0"
                                    value={amountB}
                                    onChange={(e) => setAmountB(e.target.value)}
                                />
                            </div>
                            <div className="token-input-col-right">
                                <span className="token-balance">Balance: {formattedBalanceB}</span>
                                <button
                                    className="token-select-btn"
                                    onClick={() => setShowTokenModal('B')}
                                >
                                    <div className="token-icon">{tokenB.symbol.charAt(0)}</div>
                                    <span className="token-symbol">{tokenB.symbol}</span>
                                    <ChevronDown size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Pool Info */}
                        <div className="pool-info">
                            <h4 className="pool-info-title">Pool Information</h4>
                            <div className="pool-stats">
                                <div className="pool-stat">
                                    <span>Pool Rate</span>
                                    <span>1 {tokenA.symbol} = 0.98 {tokenB.symbol}</span>
                                </div>
                                <div className="pool-stat">
                                    <span>Share of Pool</span>
                                    <span>0.00%</span>
                                </div>
                                <div className="pool-stat">
                                    <span>LP Tokens</span>
                                    <span>0.00</span>
                                </div>
                            </div>
                        </div>

                        {/* Add Button */}
                        <button
                            className="liquidity-btn"
                            disabled={!isConnected || !amountA || !amountB || isLoading}
                            onClick={handleAddLiquidity}
                        >
                            {isLoading ? 'Adding Liquidity...' : !isConnected ? 'Connect Wallet' : 'Add Liquidity'}
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="remove-liquidity"
                    >
                        {userPositions.length > 0 ? (
                            <div className="positions-list">
                                {userPositions.map(position => (
                                    <div key={position.id} className="position-card">
                                        <div className="position-header">
                                            <div className="position-tokens">
                                                <div className="position-token-icons">
                                                    <div className="position-token-icon">{position.tokenA.symbol.charAt(0)}</div>
                                                    <div className="position-token-icon overlap">{position.tokenB.symbol.charAt(0)}</div>
                                                </div>
                                                <span className="position-pair">
                                                    {position.tokenA.symbol}/{position.tokenB.symbol}
                                                </span>
                                            </div>
                                            <span className="position-value">{position.valueUSD}</span>
                                        </div>
                                        <div className="position-stats">
                                            <div className="position-stat">
                                                <span>Liquidity</span>
                                                <span>{position.liquidity} LP</span>
                                            </div>
                                            <div className="position-stat">
                                                <span>Pool Share</span>
                                                <span>{position.share}</span>
                                            </div>
                                        </div>
                                        <button className="remove-position-btn">
                                            Remove Liquidity
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-positions">
                                <Droplets size={48} className="no-positions-icon" />
                                <h3 className="no-positions-title">No Liquidity Positions</h3>
                                <p className="no-positions-desc">You don't have any liquidity positions yet. Add liquidity to start earning fees.</p>
                                <button
                                    className="liquidity-btn-small"
                                    onClick={() => setActiveTab('add')}
                                >
                                    Add Liquidity
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Token Selection Modal */}
            {showTokenModal && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setShowTokenModal(null)}
                >
                    <motion.div
                        className="token-modal"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
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
                                        isSelected={false} // Selection logic in Liquidity is just clicking, no highlight persistence usually needed in modal or can implementation simple check if needed. But for now false is fine or check against tokenA/tokenB.
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
        </div>
    );
};

export default Liquidity;
