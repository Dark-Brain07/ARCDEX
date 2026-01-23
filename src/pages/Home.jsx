import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Coins, Image, Zap, Shield, Globe } from 'lucide-react';
import './Home.css';

const Home = () => {
    const features = [
        {
            icon: <Coins size={32} />,
            title: 'Token Swap',
            description: 'Instantly swap tokens with minimal slippage and maximum efficiency.',
            link: '/swap',
            color: '#00FFFF'
        },
        {
            icon: <Sparkles size={32} />,
            title: 'Create Tokens',
            description: 'Launch your own ERC-20 token in minutes with our token factory.',
            link: '/create-token',
            color: '#9D4EDD'
        },
        {
            icon: <Image size={32} />,
            title: 'NFT Marketplace',
            description: 'Explore, buy, and sell NFTs in our premium marketplace.',
            link: '/nft',
            color: '#FF006E'
        }
    ];

    const stats = [
        { value: '$2.5M+', label: 'Total Volume' },
        { value: '10K+', label: 'Transactions' },
        { value: '500+', label: 'Tokens Listed' },
        { value: '1K+', label: 'NFT Collections' },
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg">
                    <div className="hero-glow hero-glow-1"></div>
                    <div className="hero-glow hero-glow-2"></div>
                    <div className="hero-glow hero-glow-3"></div>
                </div>

                <div className="hero-content">
                    <motion.div
                        className="hero-badge"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Zap size={14} />
                        Powered by Arc Network
                    </motion.div>

                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        The Ultimate
                        <span className="hero-title-gradient"> DeFi Hub </span>
                        on Arc
                    </motion.h1>

                    <motion.p
                        className="hero-description"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Trade tokens, create your own coins, and explore the NFT universe.
                        Experience the future of decentralized finance with lightning-fast transactions.
                    </motion.p>

                    <motion.div
                        className="hero-actions"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Link to="/swap" className="btn btn-primary btn-lg">
                            Start Trading
                            <ArrowRight size={20} />
                        </Link>
                        <Link to="/nft" className="btn btn-secondary btn-lg">
                            Explore NFTs
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        className="hero-stats"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="hero-stat">
                                <span className="hero-stat-value">{stat.value}</span>
                                <span className="hero-stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Everything You Need</h2>
                        <p className="section-description">
                            A complete suite of DeFi tools designed for the Arc Network ecosystem.
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <Link to={feature.link} className="feature-card">
                                    <div className="feature-icon" style={{ '--feature-color': feature.color }}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p className="feature-description">{feature.description}</p>
                                    <span className="feature-link">
                                        Learn More <ArrowRight size={16} />
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Arc Section */}
            <section className="why-section">
                <div className="container">
                    <div className="why-grid">
                        <div className="why-content">
                            <h2 className="section-title">Why Build on Arc?</h2>
                            <p className="section-description">
                                Arc Network provides the speed, security, and scalability needed
                                for next-generation DeFi applications.
                            </p>

                            <div className="why-features">
                                <div className="why-feature">
                                    <div className="why-feature-icon">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h4>Lightning Fast</h4>
                                        <p>Sub-second transaction finality with minimal gas fees.</p>
                                    </div>
                                </div>
                                <div className="why-feature">
                                    <div className="why-feature-icon">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h4>Battle Tested</h4>
                                        <p>Built on proven technology with enterprise-grade security.</p>
                                    </div>
                                </div>
                                <div className="why-feature">
                                    <div className="why-feature-icon">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <h4>Cross-Chain Ready</h4>
                                        <p>Seamless interoperability with major blockchain networks.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="why-visual">
                            <div className="arc-visual">
                                <div className="arc-ring arc-ring-1"></div>
                                <div className="arc-ring arc-ring-2"></div>
                                <div className="arc-ring arc-ring-3"></div>
                                <div className="arc-core">◉</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2 className="cta-title">Ready to Get Started?</h2>
                        <p className="cta-description">
                            Connect your wallet and start trading on Arc Network today.
                        </p>
                        <div className="cta-actions">
                            <Link to="/swap" className="btn btn-primary btn-lg">
                                Launch App
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
