import { Link, useLocation } from 'react-router-dom';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { Home, ArrowLeftRight, Image, User, Wallet } from 'lucide-react';
import './MobileNav.css';

const MobileNav = () => {
    const location = useLocation();
    const { open } = useWeb3Modal();
    const { isConnected } = useAccount();

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/swap', label: 'Swap', icon: ArrowLeftRight },
        { path: '/nft', label: 'NFTs', icon: Image },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className="mobile-nav" id="mobile-bottom-nav">
            {navItems.map(item => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                >
                    <item.icon size={22} />
                    <span className="mobile-nav-label">{item.label}</span>
                    {isActive(item.path) && <span className="mobile-nav-indicator" />}
                </Link>
            ))}
            <button
                className={`mobile-nav-item mobile-nav-wallet ${isConnected ? 'connected' : ''}`}
                onClick={() => open()}
            >
                <Wallet size={22} />
                <span className="mobile-nav-label">{isConnected ? 'Wallet' : 'Connect'}</span>
                {isConnected && <span className="mobile-nav-dot" />}
            </button>
        </nav>
    );
};

export default MobileNav;
