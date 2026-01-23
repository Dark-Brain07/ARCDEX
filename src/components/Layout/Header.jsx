import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { Menu, X, Wallet, ChevronDown, ExternalLink } from 'lucide-react';
import { formatAddress, TOKENS } from '../../config/network';
import './Header.css';

// ERC20 ABI for balance and symbol
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
    }
];

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dexDropdownOpen, setDexDropdownOpen] = useState(false);
    const location = useLocation();
    const { open } = useWeb3Modal();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    const { data: balanceValue } = useReadContract({
        address: TOKENS.USDC.address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        enabled: isConnected && !!address,
        watch: true,
    });

    // We know it's USDC, so we can hardcode symbol or fetch it. 
    // Since config has it, we'll use that to be safe, or just render "USDC".
    const symbol = TOKENS.USDC.symbol;

    const isActive = (path) => location.pathname === path;
    const isDexActive = ['/swap', '/create-token', '/liquidity'].includes(location.pathname);
    const isNftActive = location.pathname.startsWith('/nft');

    const navLinks = [
        { path: '/', label: 'Home' },
    ];

    const dexLinks = [
        { path: '/swap', label: 'Swap', icon: '🔄' },
        { path: '/create-token', label: 'Create Token', icon: '🪙' },
        { path: '/liquidity', label: 'Liquidity', icon: '💧' },
    ];

    const nftLinks = [
        { path: '/nft', label: 'Explore', icon: '🖼️' },
        { path: '/nft/create', label: 'Create Collection', icon: '➕' },
        { path: '/profile', label: 'My Profile', icon: '👤' },
    ];

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="header-logo">
                    <div className="logo-icon">
                        <span className="logo-arc">◉</span>
                    </div>
                    <span className="logo-text">ARC DEX</span>
                    <span className="logo-badge">DAPP</span>
                </Link>

                {/* Developer Credit */}
                <a href="https://rajuice.xyz" target="_blank" rel="noopener noreferrer" className="header-dev-credit">
                    <div className="dev-avatar">
                        <img src="/images/rajuice.jpg" alt="Rajuice" />
                    </div>
                    <div className="dev-info">
                        <span className="dev-label">Developed by</span>
                        <span className="dev-name">Rajuice</span>
                    </div>
                </a>

                {/* Desktop Navigation */}
                <nav className="header-nav">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* DEX Dropdown */}
                    <div
                        className="nav-dropdown"
                        onMouseEnter={() => setDexDropdownOpen(true)}
                        onMouseLeave={() => setDexDropdownOpen(false)}
                    >
                        <button className={`nav-link ${isDexActive ? 'active' : ''}`}>
                            DEX <ChevronDown size={16} />
                        </button>
                        <div className={`dropdown-menu ${dexDropdownOpen ? 'open' : ''}`}>
                            {dexLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="dropdown-item"
                                    onClick={() => setDexDropdownOpen(false)}
                                >
                                    <span className="dropdown-icon">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* NFT Link */}
                    <Link
                        to="/nft"
                        className={`nav-link ${isNftActive ? 'active' : ''}`}
                    >
                        NFT Marketplace
                    </Link>
                </nav>

                {/* Right Section */}
                <div className="header-right">
                    {/* Network Badge */}
                    <div className="network-badge">
                        <span className="network-dot"></span>
                        Arc Testnet
                    </div>

                    {/* Wallet Button */}
                    {isConnected ? (
                        <div className="wallet-connected">
                            <div className="wallet-info">
                                <span className="wallet-balance">
                                    {balanceValue !== undefined
                                        ? `${Number(formatUnits(balanceValue, TOKENS.USDC.decimals)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`
                                        : '...'}
                                </span>
                                <span className="wallet-address">{formatAddress(address)}</span>
                            </div>
                            <button className="wallet-dropdown-btn" onClick={() => open()}>
                                <Wallet size={18} />
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn-primary wallet-btn" onClick={() => open()}>
                            <Wallet size={18} />
                            Connect Wallet
                        </button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-section">
                    <span className="mobile-menu-label">Navigation</span>
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="mobile-menu-link"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="mobile-menu-section">
                    <span className="mobile-menu-label">DEX</span>
                    {dexLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="mobile-menu-link"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="dropdown-icon">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="mobile-menu-section">
                    <span className="mobile-menu-label">NFT Marketplace</span>
                    {nftLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="mobile-menu-link"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="dropdown-icon">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default Header;
