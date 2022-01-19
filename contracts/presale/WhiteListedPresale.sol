// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract WhiteListedPresale is Ownable {
    using SafeERC20 for IERC20;

    address public ERC20TokenSourceWallet;

    address public saleTokenAddress;
    address public priceTokenAddress;

    //price to purchase each token (how many busd for 1 token, v.g.)
    uint256 public tokenPrice;

    IERC20 private saleTokenContract;
    IERC20 private priceTokenContract; 

    mapping (address => uint256) public maxBuyMapping;

    constructor(
        address _ERC20TokenSourceWallet,
        address _saleTokenAddress, 
        address _priceTokenAddress,
        uint256 _tokenPrice,
        address[] memory _whiteListAddresses,
        uint256[] memory _whiteListBuyLimits) {
            
            require(_whiteListAddresses.length == _whiteListBuyLimits.length, "WhiteListedPresale: _whiteListAddresses and _whiteListBuyLimits provided have different lengths, must be same");
            
            ERC20TokenSourceWallet = _ERC20TokenSourceWallet;
            saleTokenAddress = _saleTokenAddress;
            priceTokenAddress = _priceTokenAddress;

            saleTokenContract = IERC20(saleTokenAddress);
            priceTokenContract = IERC20(priceTokenAddress);

            tokenPrice = _tokenPrice;

            for(uint256 i = 0; i <= _whiteListAddresses.length; i++) {
                maxBuyMapping[ _whiteListAddresses[i] ] = _whiteListBuyLimits[i];
            }
            
    }

    /**
     * @dev function to retrieve how many tokens address can still purchase
     *
     * @param _address address of the whitelisted wallet
     */
    function getCurrentAllowance(address _address) public view returns (uint256) {
        return maxBuyMapping[_address];
    }

    /**
     * @dev function for user to buy tokens paying with determined ERC20 token
     *
     * @param tokenQuantity quantity of tokens that user wishes to purchase
     */
    function buyTokens(uint256 tokenQuantity) public {
        require(getCurrentAllowance(msg.sender) >= tokenQuantity);
        priceTokenContract.safeTransferFrom(msg.sender, ERC20TokenSourceWallet, tokenQuantity * tokenPrice);
        saleTokenContract.safeTransferFrom(ERC20TokenSourceWallet, msg.sender, tokenPrice);
    }

}