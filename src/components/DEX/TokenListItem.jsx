import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { formatAddress } from '../../config/network';

// ERC20 ABI for balance (and symbol if needed, though usually passed in)
const ERC20_ABI = [
    {
        name: 'balanceOf',
        type: 'function',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    }
];

const TokenListItem = ({ token, isSelected, onSelect }) => {
    const { address, isConnected } = useAccount();

    const { data: balance } = useReadContract({
        address: token.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        enabled: isConnected && !!address,
    });

    const formattedBalance = balance
        ? Number(formatUnits(balance, token.decimals)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
        : '0.00';

    return (
        <button
            className={`token-list-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(token)}
        >
            <div className="token-list-icon">
                {token.logoURI ? <img src={token.logoURI} alt={token.symbol} /> : token.symbol.charAt(0)}
            </div>
            <div className="token-list-info">
                <div className="token-list-name-row">
                    <span className="token-list-symbol">{token.symbol}</span>
                    {token.isOfficial && <span className="token-badge-official">OFFICIAL</span>}
                </div>
                <span className="token-list-name">{token.name}</span>
            </div>
            <span className="token-list-balance">{formattedBalance}</span>
        </button>
    );
};

export default TokenListItem;
