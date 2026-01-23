// Contract Addresses - Deployed on Arc Testnet
// Updated: 2024-01-23

export const CONTRACTS = {
    // Token Factory for creating new ERC20 tokens
    TOKEN_FACTORY: '0x5254A45291C56D735a8A8ED36f9c04C7fa3fb639',

    // DEX for swapping tokens and liquidity
    DEX: '0x84D934a9A39fd521030d1e3a94Ff3eDBb490d230',

    // NFT Marketplace
    NFT_MARKETPLACE: '0x4b2d528beF9F5512336Cc114d94195f2f175b23C',

    // USDC on Arc Testnet (native gas token)
    USDC: '0x3600000000000000000000000000000000000000',
};

// ERC20 ABI (Standard)
export const ERC20_ABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function transferFrom(address from, address to, uint256 amount) returns (bool)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// Uniswap V2 Router ABI (Partial)
export const DEX_ROUTER_ABI = [
    'function factory() view returns (address)',
    'function WETH() view returns (address)',
    'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB, uint liquidity)',
    'function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)',
    'function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)',
    'function quote(uint amountA, uint reserveA, uint reserveB) pure returns (uint amountB)',
    'function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) pure returns (uint amountOut)',
    'function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) pure returns (uint amountIn)',
    'function getAmountsOut(uint amountIn, address[] calldata path) view returns (uint[] memory amounts)',
    'function getAmountsIn(uint amountOut, address[] calldata path) view returns (uint[] memory amounts)'
];

// Uniswap V2 Factory ABI (Partial)
export const DEX_FACTORY_ABI = [
    'function getPair(address tokenA, address tokenB) view returns (address pair)',
    'function allPairs(uint) view returns (address pair)',
    'function allPairsLength() view returns (uint)',
    'function createPair(address tokenA, address tokenB) returns (address pair)',
    'event PairCreated(address indexed token0, address indexed token1, address pair, uint)'
];

// Uniswap V2 Pair ABI (Partial)
export const DEX_PAIR_ABI = [
    'function token0() view returns (address)',
    'function token1() view returns (address)',
    'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function price0CumulativeLast() view returns (uint)',
    'function price1CumulativeLast() view returns (uint)',
    'function totalSupply() view returns (uint)',
    'function balanceOf(address owner) view returns (uint)',
    'function approve(address spender, uint value) returns (bool)',
    'function transfer(address to, uint value) returns (bool)',
    'function transferFrom(address from, address to, uint value) returns (bool)'
];

// Token Factory ABI
export const TOKEN_FACTORY_ABI = [
    'function createToken(string memory name, string memory symbol, uint256 totalSupply, uint8 decimals) returns (address)',
    'function getTokensByCreator(address creator) view returns (address[] memory)',
    'function allTokens(uint256 index) view returns (address)',
    'function allTokensLength() view returns (uint256)',
    'event TokenCreated(address indexed creator, address indexed tokenAddress, string name, string symbol)'
];

// ERC721 ABI (Standard)
export const ERC721_ABI = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function tokenURI(uint256 tokenId) view returns (string)',
    'function balanceOf(address owner) view returns (uint256)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function safeTransferFrom(address from, address to, uint256 tokenId)',
    'function transferFrom(address from, address to, uint256 tokenId)',
    'function approve(address to, uint256 tokenId)',
    'function setApprovalForAll(address operator, bool approved)',
    'function getApproved(uint256 tokenId) view returns (address)',
    'function isApprovedForAll(address owner, address operator) view returns (bool)',
    'function totalSupply() view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
    'function tokenByIndex(uint256 index) view returns (uint256)',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
    'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)'
];

// NFT Marketplace ABI
export const NFT_MARKETPLACE_ABI = [
    // Listings
    'function listItem(address nftContract, uint256 tokenId, uint256 price) external',
    'function updateListing(address nftContract, uint256 tokenId, uint256 newPrice) external',
    'function cancelListing(address nftContract, uint256 tokenId) external',
    'function buyItem(address nftContract, uint256 tokenId) external payable',

    // Offers
    'function makeOffer(address nftContract, uint256 tokenId, uint256 amount, uint256 expirationTime) external payable',
    'function cancelOffer(address nftContract, uint256 tokenId) external',
    'function acceptOffer(address nftContract, uint256 tokenId, address offerer) external',

    // View Functions
    'function getListing(address nftContract, uint256 tokenId) view returns (tuple(address seller, uint256 price, bool isActive))',
    'function getOffer(address nftContract, uint256 tokenId, address offerer) view returns (tuple(uint256 amount, uint256 expirationTime, bool isActive))',
    'function getPlatformFee() view returns (uint256)',

    // Collection Management
    'function addCollection(address nftContract, string memory name, string memory imageURI) external',
    'function getCollection(address nftContract) view returns (tuple(string name, string imageURI, uint256 floorPrice, uint256 totalVolume, bool isVerified))',
    'function getAllCollections() view returns (address[] memory)',

    // Events
    'event ItemListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price)',
    'event ItemSold(address indexed buyer, address indexed nftContract, uint256 indexed tokenId, uint256 price)',
    'event ItemCanceled(address indexed seller, address indexed nftContract, uint256 indexed tokenId)',
    'event OfferMade(address indexed offerer, address indexed nftContract, uint256 indexed tokenId, uint256 amount)',
    'event OfferAccepted(address indexed seller, address indexed offerer, address indexed nftContract, uint256 tokenId, uint256 amount)',
    'event CollectionAdded(address indexed nftContract, string name)'
];

export default CONTRACTS;
