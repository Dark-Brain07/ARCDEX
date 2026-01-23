import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import {
    Copy, ExternalLink, Settings, Grid, List,
    Image, Tag, Activity, Heart, Check
} from 'lucide-react';
import { formatAddress, getExplorerUrl } from '../../config/network';
import './Profile.css';

const Profile = () => {
    const { address: paramAddress } = useParams();
    const { address: connectedAddress, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState('owned');
    const [copied, setCopied] = useState(false);

    const profileAddress = paramAddress || connectedAddress;
    const isOwnProfile = !paramAddress || paramAddress === connectedAddress;

    // Mock user data
    const user = {
        address: profileAddress || '0x0000000000000000000000000000000000000000',
        username: 'ArcCollector',
        bio: 'NFT enthusiast and crypto trader. Building on Arc Network.',
        joinDate: 'January 2024',
        stats: {
            owned: 12,
            listed: 3,
            offers: 2,
            favorites: 25
        }
    };

    // Mock owned NFTs
    const ownedNFTs = Array.from({ length: 8 }, (_, i) => ({
        tokenId: i + 1,
        name: `NFT #${i + 1}`,
        collection: 'Arc Punks',
        collectionAddress: '0x1234567890123456789012345678901234567890',
        image: `https://picsum.photos/seed/owned${i + 1}/400/400`,
        price: Math.floor(Math.random() * 200 + 50),
        listed: i < 3
    }));

    // Mock activity
    const activities = [
        { type: 'Purchase', nft: 'Arc Punk #123', price: '145', time: '2 hours ago' },
        { type: 'Sale', nft: 'Cosmic Ape #456', price: '89', time: '1 day ago' },
        { type: 'List', nft: 'Arc Punk #789', price: '200', time: '3 days ago' },
    ];

    const copyAddress = () => {
        if (profileAddress) {
            navigator.clipboard.writeText(profileAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isConnected && !paramAddress) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="connect-prompt">
                        <Image size={64} />
                        <h2>Connect Your Wallet</h2>
                        <p>Connect your wallet to view your profile and NFT collection.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Header Banner */}
            <div className="profile-banner">
                <div className="banner-gradient"></div>
            </div>

            <div className="container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        <div className="avatar-placeholder">
                            {user.username.charAt(0)}
                        </div>
                    </div>

                    <div className="profile-info">
                        <div className="profile-name-row">
                            <h1 className="profile-name">{user.username}</h1>
                            {isOwnProfile && (
                                <button className="edit-profile-btn">
                                    <Settings size={18} />
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        <div className="profile-address" onClick={copyAddress}>
                            <code>{formatAddress(user.address, 6)}</code>
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </div>

                        <p className="profile-bio">{user.bio}</p>

                        <div className="profile-meta">
                            <span>Joined {user.joinDate}</span>
                            <a
                                href={getExplorerUrl('address', user.address)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View on Explorer <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="profile-stats">
                    <div className="profile-stat" onClick={() => setActiveTab('owned')}>
                        <span className="stat-value">{user.stats.owned}</span>
                        <span className="stat-label">Owned</span>
                    </div>
                    <div className="profile-stat" onClick={() => setActiveTab('listed')}>
                        <span className="stat-value">{user.stats.listed}</span>
                        <span className="stat-label">Listed</span>
                    </div>
                    <div className="profile-stat" onClick={() => setActiveTab('offers')}>
                        <span className="stat-value">{user.stats.offers}</span>
                        <span className="stat-label">Offers Made</span>
                    </div>
                    <div className="profile-stat" onClick={() => setActiveTab('favorites')}>
                        <span className="stat-value">{user.stats.favorites}</span>
                        <span className="stat-label">Favorites</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="profile-tabs">
                    <button
                        className={`profile-tab ${activeTab === 'owned' ? 'active' : ''}`}
                        onClick={() => setActiveTab('owned')}
                    >
                        <Image size={18} />
                        Owned
                    </button>
                    <button
                        className={`profile-tab ${activeTab === 'listed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('listed')}
                    >
                        <Tag size={18} />
                        Listed
                    </button>
                    <button
                        className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        <Activity size={18} />
                        Activity
                    </button>
                    <button
                        className={`profile-tab ${activeTab === 'favorites' ? 'active' : ''}`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        <Heart size={18} />
                        Favorites
                    </button>
                </div>

                {/* Content */}
                {(activeTab === 'owned' || activeTab === 'listed') && (
                    <div className="nft-grid">
                        {ownedNFTs
                            .filter(nft => activeTab === 'owned' || nft.listed)
                            .map((nft, index) => (
                                <motion.div
                                    key={nft.tokenId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Link
                                        to={`/nft/${nft.collectionAddress}/${nft.tokenId}`}
                                        className="nft-card"
                                    >
                                        <div className="nft-image">
                                            <img src={nft.image} alt={nft.name} />
                                            {nft.listed && (
                                                <span className="listed-badge">Listed</span>
                                            )}
                                        </div>
                                        <div className="nft-info">
                                            <span className="nft-collection">{nft.collection}</span>
                                            <h4 className="nft-name">{nft.name}</h4>
                                            {nft.listed && (
                                                <span className="nft-price">{nft.price} USDC</span>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="activity-list">
                        {activities.map((activity, index) => (
                            <div key={index} className="activity-row">
                                <span className={`activity-type ${activity.type.toLowerCase()}`}>
                                    {activity.type}
                                </span>
                                <span className="activity-nft">{activity.nft}</span>
                                <span className="activity-price">{activity.price} USDC</span>
                                <span className="activity-time">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'favorites' && (
                    <div className="empty-state">
                        <Heart size={48} />
                        <h3>No Favorites Yet</h3>
                        <p>Items you favorite will appear here</p>
                        <Link to="/nft" className="btn btn-primary">
                            Explore NFTs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
