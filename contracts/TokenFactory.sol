// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TokenFactory (Flattened for Remix)
 * @dev Factory contract for creating ERC20 tokens on Arc Network
 * No external imports needed - just copy and deploy!
 */

// ============ OpenZeppelin Interfaces ============

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// ============ ERC20 Implementation ============

contract ERC20 is IERC20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    function name() public view virtual returns (string memory) { return _name; }
    function symbol() public view virtual returns (string memory) { return _symbol; }
    function decimals() public view virtual returns (uint8) { return 18; }
    function totalSupply() public view virtual override returns (uint256) { return _totalSupply; }
    function balanceOf(address account) public view virtual override returns (uint256) { return _balances[account]; }

    function transfer(address to, uint256 value) public virtual override returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 value) public virtual override returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public virtual override returns (bool) {
        _spendAllowance(from, msg.sender, value);
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(from != address(0), "ERC20: transfer from zero");
        require(to != address(0), "ERC20: transfer to zero");
        uint256 fromBalance = _balances[from];
        require(fromBalance >= value, "ERC20: insufficient balance");
        _balances[from] = fromBalance - value;
        _balances[to] += value;
        emit Transfer(from, to, value);
    }

    function _mint(address account, uint256 value) internal {
        require(account != address(0), "ERC20: mint to zero");
        _totalSupply += value;
        _balances[account] += value;
        emit Transfer(address(0), account, value);
    }

    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0), "ERC20: approve from zero");
        require(spender != address(0), "ERC20: approve to zero");
        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _spendAllowance(address owner, address spender, uint256 value) internal {
        uint256 currentAllowance = allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= value, "ERC20: insufficient allowance");
            _approve(owner, spender, currentAllowance - value);
        }
    }
}

// ============ Custom Token ============

contract CustomToken is ERC20 {
    uint8 private _decimals;
    address public owner;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 totalSupply_,
        uint8 decimals_,
        address owner_
    ) ERC20(name_, symbol_) {
        _decimals = decimals_;
        owner = owner_;
        _mint(owner_, totalSupply_ * (10 ** decimals_));
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}

// ============ Token Factory ============

contract TokenFactory {
    address public owner;
    address[] public allTokens;
    mapping(address => address[]) public tokensByCreator;
    uint256 public creationFee = 0;

    event TokenCreated(
        address indexed creator,
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 totalSupply,
        uint8 decimals
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /**
     * @dev Create a new ERC20 token
     * @param name Token name (e.g., "My Token")
     * @param symbol Token symbol (e.g., "MTK")
     * @param totalSupply Total supply WITHOUT decimals (e.g., 1000000)
     * @param decimals_ Number of decimals (usually 18 or 6)
     */
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint8 decimals_
    ) external payable returns (address) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(symbol).length > 0, "Symbol required");
        require(totalSupply > 0, "Supply must be > 0");
        require(msg.value >= creationFee, "Insufficient fee");

        CustomToken newToken = new CustomToken(
            name,
            symbol,
            totalSupply,
            decimals_,
            msg.sender
        );

        address tokenAddress = address(newToken);
        allTokens.push(tokenAddress);
        tokensByCreator[msg.sender].push(tokenAddress);

        emit TokenCreated(
            msg.sender,
            tokenAddress,
            name,
            symbol,
            totalSupply,
            decimals_
        );

        return tokenAddress;
    }

    function getTokensByCreator(address creator) external view returns (address[] memory) {
        return tokensByCreator[creator];
    }

    function allTokensLength() external view returns (uint256) {
        return allTokens.length;
    }

    function setCreationFee(uint256 newFee) external onlyOwner {
        creationFee = newFee;
    }

    function withdrawFees() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
