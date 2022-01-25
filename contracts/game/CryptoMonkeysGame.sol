// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "../nft_creation/CryptoMonkeyChars.sol";

contract CryptoMonkeysGame is Ownable{

    address public ERC20TokenSourceWallet;

    address public tokenAddress;
    address public nftAddress;

    ERC20Burnable public tokenContract;
    CryptoMonkeyChars public nftContract; 

    uint256 public waitPeriod;
    mapping (uint256 => uint256) public lastMiningMapping;

    constructor(
        address _ERC20TokenSourceWallet,
        address _tokenAddress, 
        address _nftAddress,
        uint256 _waitPeriod) {
            
            ERC20TokenSourceWallet = _ERC20TokenSourceWallet;
            tokenAddress = _tokenAddress;
            nftAddress = _nftAddress;
            waitPeriod = _waitPeriod;

            tokenContract = ERC20Burnable(tokenAddress);
            nftContract = CryptoMonkeyChars(nftAddress);
            
    }

    /**
     * @dev function to store last time each nft was used for mining inside the game
     *
     * @param _tokenId id of nft in the original ERC721 contract
     */
    function setLastMiningMapping(uint256 _tokenId) internal {
        lastMiningMapping[_tokenId] = block.timestamp;
    }

    /**
     * @dev function to retrieve last time a nft was used for mining inside the game,
     * will be called to require a minimum time elapsed between game plays
     */
    function getLastMiningMapping(uint256 _tokenId) public view returns (uint256) {
        return lastMiningMapping[_tokenId];
    }

    /**
     * @dev modifier to validate that wait time has been elapsed and that nft belongs to
     * user, will compose all mining functions
     */
    modifier validateMiningConditions(uint256 _tokenId) {
        require( nftContract.ownerOf(_tokenId) == msg.sender, "CryptoMonkeysGame: trying to use nft that belongs to different address");
        require( block.timestamp > getLastMiningMapping(_tokenId) + waitPeriod, "CryptoMonkeysGame: waitPeriod not yet elapsed");
        _;
        setLastMiningMapping(_tokenId);
    }

    /**
     * @dev function to do basic game minin, that can be perfomerd by any charm
     * regardless of level, attributes, etc.
     *
     * @param _tokenId Id of the nft in the ERC721 contract
     */
    function baseMining(uint256 _tokenId) public validateMiningConditions(_tokenId) {

        (uint8 monkeyType, , ) = nftContract.tokensAttributes(_tokenId);
        //need to define monkey salary

        tokenContract.transferFrom(ERC20TokenSourceWallet, msg.sender, uint256(salary) );
    
    }

    //owner reserved functions for changing contract behaviour

    function setERC20TokenSourceWallet(address _address) public onlyOwner {
        ERC20TokenSourceWallet = _address;
    }

    function setWaitPeriod(uint256 _waitPeriod) public onlyOwner {
        waitPeriod = _waitPeriod;
    }

    function setTokenAddress(address _address) public onlyOwner {
        tokenAddress = _address;
        tokenContract = ERC20Burnable(tokenAddress);
    }

    function setNftAddress(address _address) public onlyOwner {
        nftAddress = _address;
        nftContract = CryptoMonkeyChars(nftAddress);
    }

}