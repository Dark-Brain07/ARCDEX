# Smart Contracts for Arc Network DApp

## Deployment Guide for Remix IDE

### Prerequisites
1. Open [Remix IDE](https://remix.ethereum.org)
2. Add Arc Testnet to MetaMask:
   - Network Name: Arc Testnet
   - RPC URL: https://rpc.testnet.arc.network
   - Chain ID: 5042002
   - Currency Symbol: USDC
   - Explorer: https://testnet.arcscan.app

3. Get test USDC from the Arc testnet faucet

---

## Contract Deployment Order

### 1. TokenFactory.sol
**Purpose:** Create custom ERC-20 tokens

**Steps:**
1. Copy `TokenFactory.sol` to Remix
2. Compile with Solidity 0.8.20+
3. Deploy with no constructor arguments
4. **Save the deployed contract address**

**After deployment, users can:**
- Call `createToken(name, symbol, totalSupply, decimals)` to create tokens

---

### 2. SimpleDEX.sol
**Purpose:** Swap tokens and provide liquidity

**Steps:**
1. Copy `SimpleDEX.sol` to Remix
2. Compile with Solidity 0.8.20+
3. Deploy with no constructor arguments
4. **Save the deployed contract address**

**After deployment:**
- Users must approve the DEX to spend their tokens before swapping
- Call `addLiquidity()` to create trading pairs
- Call `swap()` or `swapExactTokensForTokens()` to trade

---

### 3. NFTMarketplace.sol
**Purpose:** List, buy, sell NFTs and make offers

**Steps:**
1. Copy `NFTMarketplace.sol` to Remix
2. Compile with Solidity 0.8.20+
3. Deploy with constructor argument:
   ```
   _paymentToken: 0x3600000000000000000000000000000000000000 (USDC on Arc)
   ```
4. **Save the deployed contract address**

**After deployment:**
- NFT owners must approve the marketplace before listing
- Call `listItem(nftContract, tokenId, price)` to list
- Call `buyItem(nftContract, tokenId)` to buy (requires USDC approval)
- Call `makeOffer()` / `acceptOffer()` for offers

---

### 4. SampleNFT.sol (Optional - for testing)
**Purpose:** Sample NFT collection for testing

**Steps:**
1. Copy `SampleNFT.sol` to Remix
2. Compile with Solidity 0.8.20+
3. Deploy with constructor arguments:
   ```
   name_: "Arc Punks"
   symbol_: "APUNK"
   maxSupply_: 10000
   mintPrice_: 0 (or in wei for paid mints)
   ```
4. Mint NFTs using `mint(to, tokenURI)`

---

## Token Addresses on Arc Testnet

| Token | Address |
|-------|---------|
| USDC (Gas) | `0x3600000000000000000000000000000000000000` |
| USYC | `0xe9185F0c5F296Ed1797AaE4238D26CCaBEadb86C` |
| EURc | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` |

---

## After Deployment

Send me the following contract addresses:
1. **TokenFactory:** `0x...`
2. **SimpleDEX:** `0x...`
3. **NFTMarketplace:** `0x...`

I will then update the frontend to connect to your deployed contracts!

---

## Remix Settings

- **Compiler:** 0.8.20 or higher
- **EVM Version:** Paris or later
- **Optimization:** Enabled (200 runs recommended)
- **Environment:** Injected Provider (MetaMask on Arc Testnet)
