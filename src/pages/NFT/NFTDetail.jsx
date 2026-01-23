import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Share2, ExternalLink, Clock, Tag, ArrowRight,
    ShoppingCart, X, RefreshCw, ChevronDown
} from 'lucide-react';
import { formatAddress, getExplorerUrl } from '../../config/network';
import './NFTDetail.css';

const NFTDetail = () => {
    const { address, tokenId } = useParams();
    const { isConnected } = useAccount();
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [offerAmount, setOfferAmount] = useState('');
    const [activeTab, setActiveTab] = useState('properties');

    // Mock NFT data
    const nft = {
        tokenId,
        name: `Arc Punk #${tokenId}`,
        collection: 'Arc Punks',
        collectionAddress: address,
        image: `https://picsum.photos/seed/punk${tokenId}/600/600`,
        description: 'A unique Arc Punk with rare attributes. Part of the original 10,000 collection.',
        owner: '0x1234567890123456789012345678901234567890',
        creator: '0x0987654321098765432109876543210987654321',
        price: '145',
        lastSale: '120',
        royalty: '5%',
        listed: true
    };

    const properties = [
        { trait: 'Background', value: 'Neon Blue', rarity: '8%' },
        { trait: 'Body', value: 'Robot', rarity: '12%' },
        { trait: 'Eyes', value: 'Laser', rarity: '3%' },
        { trait: 'Head', value: 'Crown', rarity: '1%' },
        { trait: 'Accessory', value: 'Earring', rarity: '15%' },
        { trait: 'Clothing', value: 'Hoodie', rarity: '20%' },
    ];

    const activity = [
        { type: 'Sale', price: '120', from: '0x1234...5678', to: '0x8765...4321', time: '2 days ago' },
        { type: 'Transfer', price: '-', from: '0x2345...6789', to: '0x1234...5678', time: '5 days ago' },
        { type: 'List', price: '145', from: '0x1234...5678', to: '-', time: '1 day ago' },
        { type: 'Mint', price: '-', from: '0x0000...0000', to: '0x2345...6789', time: '30 days ago' },
    ];

    const offers = [
        { from: '0x1111...2222', amount: '130', expiry: 'in 2 days' },
        { from: '0x3333...4444', amount: '125', expiry: 'in 5 days' },
        { from: '0x5555...6666', amount: '110', expiry: 'in 1 day' },
    ];

    return (
        <div className="nft-detail-page">
            <div className="container">
                <div className="nft-detail-grid">
                    {/* Left Column - Image */}
                    <div className="nft-detail-left">
                        <div className="nft-detail-image">
                            <img src={nft.image} alt={nft.name} />
                            <div className="image-actions">
                                <button className="image-action-btn">
                                    <Heart size={20} />
                                </button>
                                <button className="image-action-btn">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="nft-section">
                            <h3 className="section-title">Description</h3>
                            <p className="nft-description">{nft.description}</p>
                        </div>

                        {/* Properties */}
                        <div className="nft-section">
                            <h3 className="section-title">Properties</h3>
                            <div className="properties-grid">
                                {properties.map((prop, index) => (
                                    <div key={index} className="property-card">
                                        <span className="property-trait">{prop.trait}</span>
                                        <span className="property-value">{prop.value}</span>
                                        <span className="property-rarity">{prop.rarity} have this</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="nft-detail-right">
                        {/* Collection Link */}
                        <Link to={`/nft/collection/${nft.collectionAddress}`} className="collection-link">
                            <span className="verified-icon">✓</span>
                            {nft.collection}
                        </Link>

                        <h1 className="nft-detail-title">{nft.name}</h1>

                        {/* Owner Info */}
                        <div className="owner-info">
                            <div className="owner-item">
                                <span className="owner-label">Owner</span>
                                <a href={getExplorerUrl('address', nft.owner)} target="_blank" rel="noopener noreferrer">
                                    {formatAddress(nft.owner)}
                                </a>
                            </div>
                            <div className="owner-item">
                                <span className="owner-label">Creator</span>
                                <a href={getExplorerUrl('address', nft.creator)} target="_blank" rel="noopener noreferrer">
                                    {formatAddress(nft.creator)}
                                </a>
                            </div>
                        </div>

                        {/* Price Card */}
                        <div className="price-card">
                            <div className="price-header">
                                <Clock size={16} />
                                <span>Sale ends in 2d 14h 30m</span>
                            </div>
                            <div className="price-body">
                                <div className="current-price">
                                    <span className="price-label">Current Price</span>
                                    <span className="price-value">{nft.price} USDC</span>
                                    <span className="price-usd">≈ ${nft.price}</span>
                                </div>
                                <div className="price-actions">
                                    <button className="btn btn-primary btn-lg">
                                        <ShoppingCart size={20} />
                                        Buy Now
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-lg"
                                        onClick={() => setShowOfferModal(true)}
                                    >
                                        <Tag size={20} />
                                        Make Offer
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Offers */}
                        <div className="nft-section">
                            <h3 className="section-title">Offers</h3>
                            <div className="offers-list">
                                {offers.map((offer, index) => (
                                    <div key={index} className="offer-item">
                                        <div className="offer-info">
                                            <span className="offer-amount">{offer.amount} USDC</span>
                                            <span className="offer-from">from {offer.from}</span>
                                        </div>
                                        <div className="offer-expiry">
                                            <Clock size={14} />
                                            {offer.expiry}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="nft-section">
                            <h3 className="section-title">Activity</h3>
                            <div className="activity-list">
                                {activity.map((item, index) => (
                                    <div key={index} className="activity-item">
                                        <span className={`activity-type ${item.type.toLowerCase()}`}>{item.type}</span>
                                        <span className="activity-price">{item.price !== '-' ? `${item.price} USDC` : '-'}</span>
                                        <span className="activity-addresses">
                                            {item.from} → {item.to}
                                        </span>
                                        <span className="activity-time">{item.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="nft-section">
                            <h3 className="section-title">Details</h3>
                            <div className="details-list">
                                <div className="detail-row">
                                    <span>Contract Address</span>
                                    <a href={getExplorerUrl('address', nft.collectionAddress)} target="_blank" rel="noopener noreferrer">
                                        {formatAddress(nft.collectionAddress)} <ExternalLink size={12} />
                                    </a>
                                </div>
                                <div className="detail-row">
                                    <span>Token ID</span>
                                    <span>{tokenId}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Token Standard</span>
                                    <span>ERC-721</span>
                                </div>
                                <div className="detail-row">
                                    <span>Chain</span>
                                    <span>Arc Testnet</span>
                                </div>
                                <div className="detail-row">
                                    <span>Creator Royalty</span>
                                    <span>{nft.royalty}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Offer Modal */}
            <AnimatePresence>
                {showOfferModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowOfferModal(false)}
                    >
                        <motion.div
                            className="offer-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>Make an Offer</h3>
                                <button className="modal-close" onClick={() => setShowOfferModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="offer-nft-preview">
                                    <img src={nft.image} alt={nft.name} />
                                    <div>
                                        <span className="offer-collection">{nft.collection}</span>
                                        <span className="offer-name">{nft.name}</span>
                                    </div>
                                </div>

                                <div className="offer-input-group">
                                    <label>Offer Amount</label>
                                    <div className="offer-input-wrapper">
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={offerAmount}
                                            onChange={(e) => setOfferAmount(e.target.value)}
                                        />
                                        <span className="offer-currency">USDC</span>
                                    </div>
                                    <span className="offer-balance">Balance: 1,000 USDC</span>
                                </div>

                                <div className="offer-input-group">
                                    <label>Offer Expiration</label>
                                    <select>
                                        <option>1 day</option>
                                        <option>3 days</option>
                                        <option>7 days</option>
                                        <option>30 days</option>
                                    </select>
                                </div>

                                <div className="offer-summary">
                                    <div className="summary-row">
                                        <span>Offer Amount</span>
                                        <span>{offerAmount || '0'} USDC</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Platform Fee (2.5%)</span>
                                        <span>{(parseFloat(offerAmount || 0) * 0.025).toFixed(2)} USDC</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowOfferModal(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    disabled={!offerAmount || parseFloat(offerAmount) <= 0}
                                >
                                    Make Offer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NFTDetail;
