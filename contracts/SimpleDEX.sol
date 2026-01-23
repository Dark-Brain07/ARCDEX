// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ArcDEX
 * @dev Simple DEX for Arc Network - Flattened, no imports
 * 
 * HOW TO DEPLOY:
 * 1. Compile with Solidity 0.8.20+
 * 2. In Deploy tab, select "ArcDEX" from dropdown (NOT IERC20)
 * 3. Click Deploy (no constructor arguments needed)
 */

contract ArcDEX {
    address public owner;
    bool private _locked;

    struct PairInfo {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
    }

    mapping(bytes32 => uint256) public pairIndex;
    PairInfo[] public pairs;
    mapping(uint256 => mapping(address => uint256)) public liquidity;
    
    uint256 public swapFee = 30; // 0.3%
    uint256 public constant FEE_DENOMINATOR = 10000;

    event LiquidityAdded(address indexed provider, address tokenA, address tokenB, uint256 amountA, uint256 amountB, uint256 liq);
    event LiquidityRemoved(address indexed provider, address tokenA, address tokenB, uint256 amountA, uint256 amountB);
    event Swap(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event PairCreated(address tokenA, address tokenB, uint256 idx);

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

    constructor() {
        owner = msg.sender;
        pairs.push(PairInfo(address(0), address(0), 0, 0, 0));
    }

    // ============ ERC20 Helper ============
    
    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0x23b872dd, from, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }

    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool success, bytes memory data) = token.call(
            abi.encodeWithSelector(0xa9059cbb, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }

    // ============ View Functions ============

    function getPairHash(address tokenA, address tokenB) public pure returns (bytes32) {
        (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        return keccak256(abi.encodePacked(t0, t1));
    }

    function getPair(address tokenA, address tokenB) public view returns (uint256) {
        return pairIndex[getPairHash(tokenA, tokenB)];
    }

    function getReserves(address tokenA, address tokenB) public view returns (uint256 reserveA, uint256 reserveB) {
        uint256 idx = getPair(tokenA, tokenB);
        require(idx > 0, "Pair not found");
        PairInfo storage p = pairs[idx];
        if (p.tokenA == tokenA) {
            return (p.reserveA, p.reserveB);
        }
        return (p.reserveB, p.reserveA);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public view returns (uint256) {
        require(amountIn > 0 && reserveIn > 0 && reserveOut > 0, "Invalid");
        uint256 amountInFee = amountIn * (FEE_DENOMINATOR - swapFee);
        return (amountInFee * reserveOut) / ((reserveIn * FEE_DENOMINATOR) + amountInFee);
    }

    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) public pure returns (uint256) {
        require(amountA > 0 && reserveA > 0 && reserveB > 0, "Invalid");
        return (amountA * reserveB) / reserveA;
    }

    function getLiquidity(address tokenA, address tokenB, address provider) public view returns (uint256) {
        uint256 idx = getPair(tokenA, tokenB);
        return idx > 0 ? liquidity[idx][provider] : 0;
    }

    function allPairsLength() public view returns (uint256) {
        return pairs.length - 1;
    }

    // ============ Add Liquidity ============

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant returns (uint256 amountA, uint256 amountB, uint256 liq) {
        require(tokenA != tokenB && amountADesired > 0 && amountBDesired > 0, "Invalid");

        uint256 idx = getPair(tokenA, tokenB);

        if (idx == 0) {
            idx = pairs.length;
            (address t0, address t1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
            pairs.push(PairInfo(t0, t1, 0, 0, 0));
            pairIndex[getPairHash(tokenA, tokenB)] = idx;
            emit PairCreated(tokenA, tokenB, idx);
        }

        PairInfo storage p = pairs[idx];
        bool ordered = p.tokenA == tokenA;

        if (p.reserveA == 0 && p.reserveB == 0) {
            amountA = amountADesired;
            amountB = amountBDesired;
        } else {
            uint256 rA = ordered ? p.reserveA : p.reserveB;
            uint256 rB = ordered ? p.reserveB : p.reserveA;
            uint256 optB = quote(amountADesired, rA, rB);
            if (optB <= amountBDesired) {
                require(optB >= amountBMin, "B too low");
                amountA = amountADesired;
                amountB = optB;
            } else {
                uint256 optA = quote(amountBDesired, rB, rA);
                require(optA <= amountADesired && optA >= amountAMin, "A too low");
                amountA = optA;
                amountB = amountBDesired;
            }
        }

        _safeTransferFrom(tokenA, msg.sender, address(this), amountA);
        _safeTransferFrom(tokenB, msg.sender, address(this), amountB);

        if (p.totalLiquidity == 0) {
            liq = sqrt(amountA * amountB);
        } else {
            uint256 rA = ordered ? p.reserveA : p.reserveB;
            uint256 rB = ordered ? p.reserveB : p.reserveA;
            liq = min((amountA * p.totalLiquidity) / rA, (amountB * p.totalLiquidity) / rB);
        }
        require(liq > 0, "No liquidity");

        liquidity[idx][msg.sender] += liq;
        p.totalLiquidity += liq;

        if (ordered) { p.reserveA += amountA; p.reserveB += amountB; }
        else { p.reserveA += amountB; p.reserveB += amountA; }

        emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB, liq);
    }

    // ============ Remove Liquidity ============

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liq,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        uint256 idx = getPair(tokenA, tokenB);
        require(idx > 0, "No pair");

        PairInfo storage p = pairs[idx];
        require(liquidity[idx][msg.sender] >= liq, "Not enough");

        bool ordered = p.tokenA == tokenA;
        uint256 rA = ordered ? p.reserveA : p.reserveB;
        uint256 rB = ordered ? p.reserveB : p.reserveA;

        amountA = (liq * rA) / p.totalLiquidity;
        amountB = (liq * rB) / p.totalLiquidity;
        require(amountA >= amountAMin && amountB >= amountBMin, "Slippage");

        liquidity[idx][msg.sender] -= liq;
        p.totalLiquidity -= liq;

        if (ordered) { p.reserveA -= amountA; p.reserveB -= amountB; }
        else { p.reserveA -= amountB; p.reserveB -= amountA; }

        _safeTransfer(tokenA, msg.sender, amountA);
        _safeTransfer(tokenB, msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, tokenA, tokenB, amountA, amountB);
    }

    // ============ Swap ============

    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external nonReentrant returns (uint256 amountOut) {
        require(tokenIn != tokenOut && amountIn > 0, "Invalid");

        uint256 idx = getPair(tokenIn, tokenOut);
        require(idx > 0, "No pair");

        PairInfo storage p = pairs[idx];
        bool ordered = p.tokenA == tokenIn;

        uint256 rIn = ordered ? p.reserveA : p.reserveB;
        uint256 rOut = ordered ? p.reserveB : p.reserveA;

        amountOut = getAmountOut(amountIn, rIn, rOut);
        require(amountOut >= amountOutMin, "Slippage");

        _safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);
        _safeTransfer(tokenOut, msg.sender, amountOut);

        if (ordered) { p.reserveA += amountIn; p.reserveB -= amountOut; }
        else { p.reserveA -= amountOut; p.reserveB += amountIn; }

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    // ============ Admin ============

    function setSwapFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Max 10%");
        swapFee = newFee;
    }

    // ============ Helpers ============

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y; uint256 x = y / 2 + 1;
            while (x < z) { z = x; x = (y / x + x) / 2; }
        } else if (y != 0) { z = 1; }
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) { return a < b ? a : b; }
}
