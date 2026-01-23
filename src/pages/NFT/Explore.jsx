import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, TrendingUp, Flame, Clock, ChevronDown } from 'lucide-react';
import './Explore.css';

const Explore = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('volume');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Mock collections data
    const collections = [
        {
            address: '0x1234567890123456789012345678901234567890',
            name: 'Arc Punks',
            image: 'https://picsum.photos/seed/arcpunks/400/400',
            floorPrice: '125',
            volume24h: '2,450',
            volumeChange: '+12.5%',
            owners: 1234,
            items: 10000,
            verified: true
        },
        {
            address: '0x2345678901234567890123456789012345678901',
            name: 'Cosmic Apes',
            image: 'https://picsum.photos/seed/cosmicapes/400/400',
            floorPrice: '89',
            volume24h: '1,890',
            volumeChange: '+8.3%',
            owners: 892,
            items: 5000,
            verified: true
        },
        {
            address: '0x3456789012345678901234567890123456789012',
            name: 'Pixel Warriors',
            image: 'https://picsum.photos/seed/pixelwarriors/400/400',
            floorPrice: '45',
            volume24h: '980',
            volumeChange: '-2.1%',
            owners: 567,
            items: 8888,
            verified: false
        },
        {
            address: '0x4567890123456789012345678901234567890123',
            name: 'Meta Land',
            image: 'https://picsum.photos/seed/metaland/400/400',
            floorPrice: '250',
            volume24h: '3,200',
            volumeChange: '+25.6%',
            owners: 2100,
            items: 15000,
            verified: true
        },
        {
            address: '0x5678901234567890123456789012345678901234',
            name: 'Neon Dreams',
            image: 'https://picsum.photos/seed/neondreams/400/400',
            floorPrice: '67',
            volume24h: '750',
            volumeChange: '+5.2%',
            owners: 445,
            items: 3333,
            verified: true
        },
        {
            address: '0x6789012345678901234567890123456789012345',
            name: 'Cyber Cats',
            image: 'https://picsum.photos/seed/cybercats/400/400',
            floorPrice: '38',
            volume24h: '520',
            volumeChange: '-1.8%',
            owners: 320,
            items: 4444,
            verified: false
        }
    ];

    const stats = [
        { label: 'Total Collections', value: '1,234' },
        { label: 'Total Volume', value: '$12.5M' },
        { label: 'Active Traders', value: '5,678' },
        { label: '24h Volume', value: '$890K' },
    ];

    const filteredCollections = collections.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortOptions = [
        { value: 'volume', label: 'Volume', icon: <TrendingUp size={14} /> },
        { value: 'floor', label: 'Floor Price', icon: <Flame size={14} /> },
        { value: 'recent', label: 'Recently Listed', icon: <Clock size={14} /> },
    ];

    return (
        <div className="explore-page">
            <div className="container">
                {/* Header */}
                <div className="explore-header">
                    <motion.h1
                        className="explore-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Explore NFT Collections
                    </motion.h1>
                    <motion.p
                        className="explore-description"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Discover, collect, and trade unique digital assets on Arc Network
                    </motion.p>
                </div>

                {/* Stats */}
                <motion.div
                    className="explore-stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {stats.map((stat, index) => (
                        <div key={index} className="explore-stat">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Controls */}
                <div className="explore-controls">
                    <div className="search-container">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search collections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="controls-right">
                        <div className="sort-dropdown">
                            <button className="sort-btn">
                                {sortOptions.find(s => s.value === sortBy)?.icon}
                                {sortOptions.find(s => s.value === sortBy)?.label}
                                <ChevronDown size={16} />
                            </button>
                        </div>

                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <List size={18} />
                            </button>
                        </div>

                        <Link to="/nft/create" className="btn btn-primary">
                            Create Collection
                        </Link>
                    </div>
                </div>

                {/* Collections Grid */}
                <div className={`collections-${viewMode}`}>
                    {filteredCollections.map((collection, index) => (
                        <motion.div
                            key={collection.address}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                to={`/nft/collection/${collection.address}`}
                                className="collection-card"
                            >
                                <div className="collection-image">
                                    <img src={collection.image} alt={collection.name} />
                                    {collection.verified && (
                                        <span className="verified-badge">✓</span>
                                    )}
                                </div>
                                <div className="collection-info">
                                    <h3 className="collection-name">{collection.name}</h3>
                                    <div className="collection-stats">
                                        <div className="collection-stat">
                                            <span className="stat-label">Floor</span>
                                            <span className="stat-value">{collection.floorPrice} USDC</span>
                                        </div>
                                        <div className="collection-stat">
                                            <span className="stat-label">24h Vol</span>
                                            <span className="stat-value">{collection.volume24h} USDC</span>
                                        </div>
                                    </div>
                                    <div className="collection-meta">
                                        <span>{collection.items.toLocaleString()} items</span>
                                        <span className={`volume-change ${collection.volumeChange.startsWith('+') ? 'positive' : 'negative'}`}>
                                            {collection.volumeChange}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {filteredCollections.length === 0 && (
                    <div className="no-results">
                        <Search size={48} />
                        <h3>No Collections Found</h3>
                        <p>Try adjusting your search or create a new collection</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;
