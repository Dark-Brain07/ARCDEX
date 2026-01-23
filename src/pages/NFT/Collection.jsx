import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ExternalLink, Globe, Twitter, Share2, Grid, List,
    Search, Filter, ChevronDown, Heart, ShoppingCart
} from 'lucide-react';
import { formatAddress, getExplorerUrl } from '../../config/network';
import './Collection.css';

const Collection = () => {
    const { address } = useParams();
    const [activeTab, setActiveTab] = useState('items');
    const [sortBy, setSortBy] = useState('price-low');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock collection data
    const collection = {
        address,
        name: 'Arc Punks',
        description: 'A collection of 10,000 unique Arc Punks living on the Arc Network. Each punk is algorithmically generated and truly unique.',
        image: 'https://picsum.photos/seed/arcpunks/400/400',
        banner: 'https://picsum.photos/seed/arcpunksbanner/1200/400',
        verified: true,
        website: 'https://arcpunks.io',
        twitter: 'arcpunks',
        floorPrice: '125',
        totalVolume: '45,678',
        owners: 1234,
        items: 10000,
        listed: 567,
        royalty: '5%'
    };

    // Mock NFTs
    const nfts = Array.from({ length: 12 }, (_, i) => ({
        tokenId: i + 1,
        name: `Arc Punk #${i + 1}`,
        image: `https://picsum.photos/seed/punk${i + 1}/400/400`,
        price: Math.floor(Math.random() * 200 + 50),
        lastSale: Math.floor(Math.random() * 150 + 30),
        rarity: Math.floor(Math.random() * 10000),
        listed: Math.random() > 0.5
    }));

    // Mock activity
    const activities = [
        { type: 'Sale', nft: 'Arc Punk #123', price: '145', from: '0x1234...5678', to: '0x8765...4321', time: '2 hours ago' },
        { type: 'List', nft: 'Arc Punk #456', price: '180', from: '0x2345...6789', to: '-', time: '3 hours ago' },
        { type: 'Offer', nft: 'Arc Punk #789', price: '120', from: '0x3456...7890', to: '-', time: '5 hours ago' },
    ];

    return (
        <div className="collection-page">
            {/* Banner */}
            <div className="collection-banner">
                <img src={collection.banner} alt={collection.name} />
                <div className="banner-overlay"></div>
            </div>

            <div className="container">
                {/* Collection Header */}
                <div className="collection-header">
                    <div className="collection-avatar">
                        <img src={collection.image} alt={collection.name} />
                        {collection.verified && <span className="verified-badge">✓</span>}
                    </div>

                    <div className="collection-details">
                        <div className="collection-title-row">
                            <h1 className="collection-title">{collection.name}</h1>
                            <div className="collection-actions">
                                <button className="action-btn" title="Share">
                                    <Share2 size={18} />
                                </button>
                                {collection.website && (
                                    <a href={collection.website} target="_blank" rel="noopener noreferrer" className="action-btn" title="Website">
                                        <Globe size={18} />
                                    </a>
                                )}
                                {collection.twitter && (
                                    <a href={`https://twitter.com/${collection.twitter}`} target="_blank" rel="noopener noreferrer" className="action-btn" title="Twitter">
                                        <Twitter size={18} />
                                    </a>
                                )}
                                <a href={getExplorerUrl('address', collection.address)} target="_blank" rel="noopener noreferrer" className="action-btn" title="View on Explorer">
                                    <ExternalLink size={18} />
                                </a>
                            </div>
                        </div>

                        <p className="collection-description">{collection.description}</p>

                        <div className="collection-contract">
                            Contract: <code>{formatAddress(collection.address, 6)}</code>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="collection-stats-grid">
                    <div className="stat-card">
                        <span className="stat-value">{collection.floorPrice} USDC</span>
                        <span className="stat-label">Floor Price</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{collection.totalVolume} USDC</span>
                        <span className="stat-label">Total Volume</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{collection.owners.toLocaleString()}</span>
                        <span className="stat-label">Owners</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{collection.items.toLocaleString()}</span>
                        <span className="stat-label">Items</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{collection.listed}</span>
                        <span className="stat-label">Listed</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{collection.royalty}</span>
                        <span className="stat-label">Royalty</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="collection-tabs">
                    <button
                        className={`collection-tab ${activeTab === 'items' ? 'active' : ''}`}
                        onClick={() => setActiveTab('items')}
                    >
                        Items
                    </button>
                    <button
                        className={`collection-tab ${activeTab === 'activity' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        Activity
                    </button>
                </div>

                {activeTab === 'items' && (
                    <>
                        {/* Filters */}
                        <div className="items-controls">
                            <div className="search-container">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="sort-select">
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="recent">Recently Listed</option>
                                    <option value="rarity">Rarity</option>
                                </select>
                            </div>
                        </div>

                        {/* NFT Grid */}
                        <div className="nft-grid">
                            {nfts.map((nft, index) => (
                                <motion.div
                                    key={nft.tokenId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Link to={`/nft/${address}/${nft.tokenId}`} className="nft-card">
                                        <div className="nft-image">
                                            <img src={nft.image} alt={nft.name} />
                                            <button className="nft-favorite">
                                                <Heart size={16} />
                                            </button>
                                            {nft.listed && (
                                                <span className="nft-listed-badge">Listed</span>
                                            )}
                                        </div>
                                        <div className="nft-info">
                                            <h4 className="nft-name">{nft.name}</h4>
                                            <div className="nft-price-row">
                                                <div className="nft-price">
                                                    <span className="price-label">Price</span>
                                                    <span className="price-value">{nft.price} USDC</span>
                                                </div>
                                                <div className="nft-last-sale">
                                                    <span className="price-label">Last</span>
                                                    <span className="price-value">{nft.lastSale} USDC</span>
                                                </div>
                                            </div>
                                            <div className="nft-rarity">
                                                Rarity: #{nft.rarity.toLocaleString()}
                                            </div>
                                        </div>
                                        <button className="nft-buy-btn">
                                            <ShoppingCart size={16} />
                                            Buy Now
                                        </button>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'activity' && (
                    <div className="activity-table">
                        <div className="activity-header">
                            <span>Event</span>
                            <span>Item</span>
                            <span>Price</span>
                            <span>From</span>
                            <span>To</span>
                            <span>Time</span>
                        </div>
                        {activities.map((activity, index) => (
                            <div key={index} className="activity-row">
                                <span className={`activity-type ${activity.type.toLowerCase()}`}>
                                    {activity.type}
                                </span>
                                <span className="activity-item">{activity.nft}</span>
                                <span className="activity-price">{activity.price} USDC</span>
                                <span className="activity-address">{activity.from}</span>
                                <span className="activity-address">{activity.to}</span>
                                <span className="activity-time">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Collection;
