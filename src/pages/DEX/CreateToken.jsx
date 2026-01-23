import { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Coins, Copy, ExternalLink, Check, Loader2 } from 'lucide-react';
import { getExplorerUrl } from '../../config/network';
import { useTokenFactory } from '../../hooks/useTokenFactory';
import './CreateToken.css';

const CreateToken = () => {
    const { isConnected } = useAccount();
    const { createToken, isLoading: isCreating, error } = useTokenFactory();
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        totalSupply: '',
        decimals: '18'
    });
    const [createdToken, setCreatedToken] = useState(null);
    const [copied, setCopied] = useState(false);
    const [txError, setTxError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isConnected) {
            alert('Please connect your wallet first');
            return;
        }

        setTxError(null);

        try {
            const result = await createToken(
                formData.name,
                formData.symbol,
                formData.totalSupply,
                parseInt(formData.decimals)
            );

            setCreatedToken({
                address: result.tokenAddress || result.hash,
                txHash: result.hash,
                name: formData.name,
                symbol: formData.symbol,
                totalSupply: formData.totalSupply,
                decimals: formData.decimals
            });
        } catch (err) {
            console.error('Error creating token:', err);
            setTxError(err.message);
        }
    };

    const copyAddress = () => {
        if (createdToken) {
            navigator.clipboard.writeText(createdToken.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const resetForm = () => {
        setCreatedToken(null);
        setFormData({ name: '', symbol: '', totalSupply: '', decimals: '18' });
    };

    return (
        <div className="create-token-page">
            <div className="create-token-container">
                {/* Header */}
                <div className="create-token-header">
                    <div className="create-token-icon">
                        <Coins size={32} />
                    </div>
                    <h1 className="create-token-title">Create Token</h1>
                    <p className="create-token-description">
                        Launch your own ERC-20 token on Arc Network in minutes
                    </p>
                </div>

                {!createdToken ? (
                    <motion.form
                        className="create-token-form"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Token Name */}
                        <div className="form-group">
                            <label className="form-label">Token Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="e.g., My Awesome Token"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <span className="form-hint">The full name of your token</span>
                        </div>

                        {/* Token Symbol */}
                        <div className="form-group">
                            <label className="form-label">Token Symbol</label>
                            <input
                                type="text"
                                name="symbol"
                                className="form-input"
                                placeholder="e.g., MAT"
                                value={formData.symbol}
                                onChange={handleChange}
                                maxLength={10}
                                required
                            />
                            <span className="form-hint">Usually 3-5 characters (e.g., ETH, USDC)</span>
                        </div>

                        {/* Total Supply */}
                        <div className="form-group">
                            <label className="form-label">Total Supply</label>
                            <input
                                type="number"
                                name="totalSupply"
                                className="form-input"
                                placeholder="e.g., 1000000"
                                value={formData.totalSupply}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                            <span className="form-hint">Total number of tokens to create</span>
                        </div>

                        {/* Decimals */}
                        <div className="form-group">
                            <label className="form-label">Decimals</label>
                            <select
                                name="decimals"
                                className="form-input form-select"
                                value={formData.decimals}
                                onChange={handleChange}
                            >
                                <option value="18">18 (Standard)</option>
                                <option value="6">6 (Like USDC)</option>
                                <option value="8">8 (Like WBTC)</option>
                                <option value="0">0 (Whole tokens only)</option>
                            </select>
                            <span className="form-hint">Number of decimal places (18 is standard)</span>
                        </div>

                        {/* Summary Card */}
                        <div className="token-preview">
                            <h4 className="preview-title">Token Preview</h4>
                            <div className="preview-row">
                                <span>Name:</span>
                                <span>{formData.name || '-'}</span>
                            </div>
                            <div className="preview-row">
                                <span>Symbol:</span>
                                <span>{formData.symbol || '-'}</span>
                            </div>
                            <div className="preview-row">
                                <span>Total Supply:</span>
                                <span>{formData.totalSupply ? Number(formData.totalSupply).toLocaleString() : '-'}</span>
                            </div>
                            <div className="preview-row">
                                <span>Decimals:</span>
                                <span>{formData.decimals}</span>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="info-box">
                            <span className="info-icon">ℹ️</span>
                            <span>All tokens will be sent to your connected wallet. You'll pay a small gas fee in USDC.</span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="create-btn"
                            disabled={!isConnected || isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Creating Token...
                                </>
                            ) : !isConnected ? (
                                'Connect Wallet'
                            ) : (
                                <>
                                    <Coins size={20} />
                                    Create Token
                                </>
                            )}
                        </button>
                    </motion.form>
                ) : (
                    <motion.div
                        className="token-success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="success-icon">
                            <Check size={40} />
                        </div>
                        <h2 className="success-title">Token Created!</h2>
                        <p className="success-description">
                            Your token <strong>{createdToken.name} ({createdToken.symbol})</strong> has been created successfully.
                        </p>

                        <div className="token-address-box">
                            <span className="address-label">Contract Address</span>
                            <div className="address-row">
                                <code className="token-address">{createdToken.address}</code>
                                <button className="copy-btn" onClick={copyAddress}>
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="success-actions">
                            <a
                                href={getExplorerUrl('token', createdToken.address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                View on Explorer
                                <ExternalLink size={16} />
                            </a>
                            <button className="btn btn-primary" onClick={resetForm}>
                                Create Another
                            </button>
                        </div>

                        <div className="next-steps">
                            <h4>Next Steps</h4>
                            <ul>
                                <li>Add liquidity to enable trading</li>
                                <li>List your token on the DEX</li>
                                <li>Share with your community</li>
                            </ul>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CreateToken;
