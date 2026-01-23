import { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Upload, Image, X, Check, Loader2, Info } from 'lucide-react';
import './CreateCollection.css';

const CreateCollection = () => {
    const { isConnected } = useAccount();
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        description: '',
        contractAddress: '',
        website: '',
        twitter: '',
        discord: ''
    });
    const [bannerPreview, setBannerPreview] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (type, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'banner') {
                    setBannerPreview(reader.result);
                } else {
                    setLogoPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isConnected) {
            alert('Please connect your wallet');
            return;
        }

        setIsSubmitting(true);
        // Simulate submission
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 2000);
    };

    if (submitted) {
        return (
            <div className="create-collection-page">
                <div className="create-collection-container">
                    <motion.div
                        className="submission-success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="success-icon">
                            <Check size={48} />
                        </div>
                        <h2>Collection Submitted!</h2>
                        <p>Your collection has been submitted for review. It will appear in the marketplace once approved.</p>
                        <button className="btn btn-primary" onClick={() => window.location.href = '/nft'}>
                            Back to Marketplace
                        </button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="create-collection-page">
            <div className="create-collection-container">
                <div className="page-header">
                    <h1 className="page-title">Create Collection</h1>
                    <p className="page-description">
                        List your NFT collection on the Arc marketplace
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="create-form">
                    {/* Banner Upload */}
                    <div className="upload-section">
                        <label className="upload-label">Banner Image</label>
                        <div className={`upload-area banner-upload ${bannerPreview ? 'has-preview' : ''}`}>
                            {bannerPreview ? (
                                <>
                                    <img src={bannerPreview} alt="Banner preview" />
                                    <button
                                        type="button"
                                        className="remove-image"
                                        onClick={() => setBannerPreview(null)}
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <label className="upload-placeholder">
                                    <Upload size={32} />
                                    <span>Upload banner image</span>
                                    <span className="upload-hint">Recommended: 1400 x 400px</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload('banner', e)}
                                        hidden
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Logo Upload */}
                    <div className="upload-section">
                        <label className="upload-label">Collection Logo</label>
                        <div className={`upload-area logo-upload ${logoPreview ? 'has-preview' : ''}`}>
                            {logoPreview ? (
                                <>
                                    <img src={logoPreview} alt="Logo preview" />
                                    <button
                                        type="button"
                                        className="remove-image"
                                        onClick={() => setLogoPreview(null)}
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <label className="upload-placeholder">
                                    <Image size={32} />
                                    <span>Upload logo</span>
                                    <span className="upload-hint">350 x 350px</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload('logo', e)}
                                        hidden
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="form-section">
                        <h3 className="form-section-title">Basic Information</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Collection Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="e.g., Arc Punks"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Symbol *</label>
                                <input
                                    type="text"
                                    name="symbol"
                                    className="form-input"
                                    placeholder="e.g., APUNKS"
                                    value={formData.symbol}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-input form-textarea"
                                placeholder="Tell the world about your collection..."
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contract Address *</label>
                            <input
                                type="text"
                                name="contractAddress"
                                className="form-input"
                                placeholder="0x..."
                                value={formData.contractAddress}
                                onChange={handleChange}
                                required
                            />
                            <span className="form-hint">The ERC-721 contract address on Arc Network</span>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="form-section">
                        <h3 className="form-section-title">Social Links</h3>

                        <div className="form-group">
                            <label className="form-label">Website</label>
                            <input
                                type="url"
                                name="website"
                                className="form-input"
                                placeholder="https://yourwebsite.com"
                                value={formData.website}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Twitter</label>
                                <input
                                    type="text"
                                    name="twitter"
                                    className="form-input"
                                    placeholder="@username"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Discord</label>
                                <input
                                    type="text"
                                    name="discord"
                                    className="form-input"
                                    placeholder="discord.gg/..."
                                    value={formData.discord}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="info-box">
                        <Info size={18} />
                        <div>
                            <strong>Verification Process</strong>
                            <p>Collections are reviewed before appearing in the marketplace. This typically takes 24-48 hours.</p>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={!isConnected || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Submitting...
                            </>
                        ) : !isConnected ? (
                            'Connect Wallet'
                        ) : (
                            'Submit Collection'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCollection;
