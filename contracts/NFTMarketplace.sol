// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NFTMarketplace (Flattened for Remix)
 * @dev NFT Marketplace for Arc Network
 * No external imports needed - just copy and deploy!
 * 
 * DEPLOYMENT: Pass USDC address as constructor argument
 * On Arc Testnet: 0x3600000000000000000000000000000000000000
 */

// ============ Interfaces ============

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}

// ============ NFT Marketplace ============

contract NFTMarketplace {
    address public owner;
    IERC20 public paymentToken;
    bool private _locked;

    uint256 public platformFee = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public collectedFees;

    // Structs
    struct Listing {
        address seller;
        uint256 price;
        bool isActive;
    }

    struct Offer {
        address offerer;
        uint256 amount;
        uint256 expirationTime;
        bool isActive;
    }

    struct Collection {
        string name;
        string imageURI;
        address creator;
        uint256 floorPrice;
        uint256 totalVolume;
        bool isVerified;
        bool exists;
    }

    // State
    mapping(address => mapping(uint256 => Listing)) public listings;
    mapping(address => mapping(uint256 => mapping(address => Offer))) public offers;
    mapping(address => Collection) public collections;
    address[] public collectionAddresses;

    // Events
    event ItemListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price);
    event ItemSold(address indexed buyer, address indexed nftContract, uint256 indexed tokenId, uint256 price);
    event ItemCanceled(address indexed seller, address indexed nftContract, uint256 indexed tokenId);
    event ListingUpdated(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 newPrice);
    event OfferMade(address indexed offerer, address indexed nftContract, uint256 indexed tokenId, uint256 amount, uint256 expirationTime);
    event OfferCanceled(address indexed offerer, address indexed nftContract, uint256 indexed tokenId);
    event OfferAccepted(address indexed seller, address indexed offerer, address indexed nftContract, uint256 tokenId, uint256 amount);
    event CollectionAdded(address indexed nftContract, string name, address indexed creator);
    event CollectionVerified(address indexed nftContract, bool verified);

    modifier nonReentrant() {
        require(!_locked, "Reentrant");
        _locked = true;
        _;
        _locked = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /**
     * @dev Constructor
     * @param _paymentToken USDC address on Arc: 0x3600000000000000000000000000000000000000
     */
    constructor(address _paymentToken) {
        owner = msg.sender;
        paymentToken = IERC20(_paymentToken);
    }

    // ============ Listing Functions ============

    function listItem(address nftContract, uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be > 0");
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
        require(
            nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)),
            "Not approved"
        );

        listings[nftContract][tokenId] = Listing(msg.sender, price, true);

        if (collections[nftContract].exists) {
            if (collections[nftContract].floorPrice == 0 || price < collections[nftContract].floorPrice) {
                collections[nftContract].floorPrice = price;
            }
        }

        emit ItemListed(msg.sender, nftContract, tokenId, price);
    }

    function updateListing(address nftContract, uint256 tokenId, uint256 newPrice) external nonReentrant {
        require(newPrice > 0, "Price must be > 0");
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive && listing.seller == msg.sender, "Invalid");
        listing.price = newPrice;
        emit ListingUpdated(msg.sender, nftContract, tokenId, newPrice);
    }

    function cancelListing(address nftContract, uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive && listing.seller == msg.sender, "Invalid");
        listing.isActive = false;
        emit ItemCanceled(msg.sender, nftContract, tokenId);
    }

    function buyItem(address nftContract, uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.isActive, "Not listed");

        uint256 price = listing.price;
        address seller = listing.seller;
        listing.isActive = false;

        uint256 fee = (price * platformFee) / FEE_DENOMINATOR;
        uint256 sellerAmount = price - fee;

        require(paymentToken.transferFrom(msg.sender, seller, sellerAmount), "Payment failed");
        require(paymentToken.transferFrom(msg.sender, address(this), fee), "Fee failed");
        collectedFees += fee;

        IERC721(nftContract).safeTransferFrom(seller, msg.sender, tokenId);

        if (collections[nftContract].exists) {
            collections[nftContract].totalVolume += price;
        }

        emit ItemSold(msg.sender, nftContract, tokenId, price);
    }

    // ============ Offer Functions ============

    function makeOffer(address nftContract, uint256 tokenId, uint256 amount, uint256 expirationTime) external nonReentrant {
        require(amount > 0 && expirationTime > block.timestamp, "Invalid");
        require(paymentToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(paymentToken.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");

        offers[nftContract][tokenId][msg.sender] = Offer(msg.sender, amount, expirationTime, true);
        emit OfferMade(msg.sender, nftContract, tokenId, amount, expirationTime);
    }

    function cancelOffer(address nftContract, uint256 tokenId) external nonReentrant {
        Offer storage offer = offers[nftContract][tokenId][msg.sender];
        require(offer.isActive, "No offer");
        offer.isActive = false;
        emit OfferCanceled(msg.sender, nftContract, tokenId);
    }

    function acceptOffer(address nftContract, uint256 tokenId, address offerer) external nonReentrant {
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");

        Offer storage offer = offers[nftContract][tokenId][offerer];
        require(offer.isActive && offer.expirationTime > block.timestamp, "Invalid offer");

        uint256 amount = offer.amount;
        offer.isActive = false;

        if (listings[nftContract][tokenId].isActive) {
            listings[nftContract][tokenId].isActive = false;
        }

        uint256 fee = (amount * platformFee) / FEE_DENOMINATOR;
        uint256 sellerAmount = amount - fee;

        require(paymentToken.transferFrom(offerer, msg.sender, sellerAmount), "Payment failed");
        require(paymentToken.transferFrom(offerer, address(this), fee), "Fee failed");
        collectedFees += fee;

        nft.safeTransferFrom(msg.sender, offerer, tokenId);

        if (collections[nftContract].exists) {
            collections[nftContract].totalVolume += amount;
        }

        emit OfferAccepted(msg.sender, offerer, nftContract, tokenId, amount);
    }

    // ============ Collection Functions ============

    function addCollection(address nftContract, string memory name, string memory imageURI) external {
        require(!collections[nftContract].exists, "Exists");
        require(bytes(name).length > 0, "Name required");

        collections[nftContract] = Collection(name, imageURI, msg.sender, 0, 0, false, true);
        collectionAddresses.push(nftContract);
        emit CollectionAdded(nftContract, name, msg.sender);
    }

    function getCollection(address nftContract) external view returns (
        string memory name, string memory imageURI, address creator,
        uint256 floorPrice, uint256 totalVolume, bool isVerified
    ) {
        Collection storage c = collections[nftContract];
        return (c.name, c.imageURI, c.creator, c.floorPrice, c.totalVolume, c.isVerified);
    }

    function getAllCollections() external view returns (address[] memory) {
        return collectionAddresses;
    }

    function getListing(address nftContract, uint256 tokenId) external view returns (address seller, uint256 price, bool isActive) {
        Listing storage l = listings[nftContract][tokenId];
        return (l.seller, l.price, l.isActive);
    }

    function getOffer(address nftContract, uint256 tokenId, address offerer) external view returns (uint256 amount, uint256 expirationTime, bool isActive) {
        Offer storage o = offers[nftContract][tokenId][offerer];
        return (o.amount, o.expirationTime, o.isActive);
    }

    // ============ Admin Functions ============

    function verifyCollection(address nftContract, bool verified) external onlyOwner {
        require(collections[nftContract].exists, "Not found");
        collections[nftContract].isVerified = verified;
        emit CollectionVerified(nftContract, verified);
    }

    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Too high");
        platformFee = newFee;
    }

    function setPaymentToken(address newToken) external onlyOwner {
        paymentToken = IERC20(newToken);
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = collectedFees;
        collectedFees = 0;
        require(paymentToken.transfer(owner, amount), "Withdraw failed");
    }
}
