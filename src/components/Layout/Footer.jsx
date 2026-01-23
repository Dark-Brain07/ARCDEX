import { Link } from 'react-router-dom';
import { ExternalLink, Github, Twitter } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        dex: [
            { label: 'Swap', path: '/swap' },
            { label: 'Create Token', path: '/create-token' },
            { label: 'Liquidity', path: '/liquidity' },
        ],
        nft: [
            { label: 'Explore', path: '/nft' },
            { label: 'Create Collection', path: '/nft/create' },
            { label: 'My Profile', path: '/profile' },
        ],
        resources: [
            { label: 'Arc Network', url: 'https://arc.network', external: true },
            { label: 'Documentation', url: 'https://docs.arc.network', external: true },
            { label: 'Block Explorer', url: 'https://testnet.arcscan.app', external: true },
        ],
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-main">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="logo-icon">
                                <span className="logo-arc">◉</span>
                            </div>
                            <span className="logo-text">ARC</span>
                            <span className="logo-badge">DAPP</span>
                        </div>
                        <p className="footer-description">
                            The ultimate decentralized exchange and NFT marketplace built on Arc Network.
                            Trade tokens, create your own coins, and explore the NFT universe.
                        </p>
                        <div className="footer-socials">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                                <Twitter size={20} />
                            </a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
                                <Github size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="footer-links-section">
                        <h4 className="footer-title">DEX</h4>
                        <nav className="footer-nav">
                            {footerLinks.dex.map(link => (
                                <Link key={link.path} to={link.path} className="footer-link">
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="footer-links-section">
                        <h4 className="footer-title">NFT Marketplace</h4>
                        <nav className="footer-nav">
                            {footerLinks.nft.map(link => (
                                <Link key={link.path} to={link.path} className="footer-link">
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="footer-links-section">
                        <h4 className="footer-title">Resources</h4>
                        <nav className="footer-nav">
                            {footerLinks.resources.map(link => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-link"
                                >
                                    {link.label}
                                    <ExternalLink size={12} />
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} ARC DApp. All rights reserved.
                    </p>
                    <div className="footer-network">
                        <span className="network-dot"></span>
                        Arc Testnet
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
