//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract CryptoMonkeyChars is ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    //mapping to nft attributes
    struct CharAttributes {
        uint8 monkeyType;
        uint8 charLevel;
        uint8 attr1;
        uint8 attr2;
        uint8 attr3;
        uint8 attr4;
    }
    mapping (uint256 => CharAttributes) public tokensAttributes;

    //call to ERC20 contract
    address public tokenAddress;
    uint256 public mintCost;
    uint256 public levelUpCost;

    //base URI location
    string public baseUriString;

    constructor(
        address _tokenAddress, 
        uint256 _mintCost, 
        uint256 _levelUpCost,
        string memory _baseUriString
        ) ERC721("CryptoMonkeys", "CMONKEYS") {
            tokenAddress = _tokenAddress;
            mintCost = _mintCost;
            levelUpCost = _levelUpCost;
            baseUriString = _baseUriString;
    }

    //override attributes of base classes that collude
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return baseUriString;
    }
    //end override

    /**
     * @dev Secton to create actual nft functionalities
     * will create:
     *  - randomness source V
     *  - function to set attributes of each minted nft V
     *  - nft minting function V
     *  - nft levelling up function V
     *  - owner interface to change cost of minting V
     *  - owner interface to change cost of upgrading V
     *  - owner interface to change base url of tokens V
     */

    /**
    * @dev source of randomness for contract
    */
    function randomElement(uint256 tokenId) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, msg.sender, _tokenIds.current(), tokenId)));
    }
    
    /**
     * @dev Sets `_tokenURI` as the CharAttributes of `tokenId`.
     *
     * @param tokenId id of created token
     * Requirements:
     *
     * - `tokenId` must exist.
     * - `tokenId` must not be a mapping key already
     */
    function _setTokenAttributes(uint256 tokenId) internal {
        //require(tokensAttributes[tokenId].monkeyType > 0, "CryptoMonkeyChar: token attributes were already set");

        uint256 _charType = randomElement(tokenId) % 10;
        uint256 _charAttr1 = randomElement(tokenId) % 100;
        uint256 _charAttr2 = randomElement(tokenId) % 100;
        uint256 _charAttr3 = randomElement(tokenId) % 100;
        uint256 _charAttr4 = randomElement(tokenId) % 100;

        tokensAttributes[tokenId] = CharAttributes({
            monkeyType: uint8(_charType),
            charLevel: 1,
            attr1: uint8(_charAttr1),
            attr2: uint8(_charAttr2),
            attr3: uint8(_charAttr3),
            attr4: uint8(_charAttr4)
        });

    }

    /**
     * @dev mints new nft and burns the price
     *
     * @param recipient address that wishes to mint the nft
     * need to add support for multiple box types and prices
     */
    function mintNft(address recipient) public {

        ERC20Burnable tokenContract = ERC20Burnable(tokenAddress);
        tokenContract.burnFrom(recipient, mintCost);

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI(newItemId));
        _setTokenAttributes(newItemId);

    }

    /**
     * @dev upgrades nft to level 2
     * 
     * @param recipient owner of the asset. Must have granted allowance for contract and 
     * must be the caller
     * @param nftIndex index of the asset
     * user will pay upgrade price by burning tokens and nft will be upgraded to level 2
     */
    function upgradeNft(address recipient, uint256 nftIndex) public {

        require(ownerOf(nftIndex) == recipient, "CryptoMonkeysChars: owner is not recipient");
        require(ownerOf(nftIndex) == msg.sender, "CryptoMonkeysChars: owner is not sender");
        require(tokensAttributes[nftIndex].charLevel == 1, "CryptoMonkeysChars: char is already level 2");

        ERC20Burnable tokenContract = ERC20Burnable(tokenAddress);
        tokenContract.burnFrom(recipient, levelUpCost);

        tokensAttributes[nftIndex].charLevel = 2;
        
    }

    /**
     * @dev owner private functions to set contract attributes
     */
    function setTokenAddress(address _address) public onlyOwner {
        tokenAddress = _address;
    }

    function setMintCost(uint256 _cost) public onlyOwner {
        mintCost = _cost;
    }

    function setLevelUpCost(uint256 _cost) public onlyOwner {
        levelUpCost = _cost;
    }

    function setBaseUriString(string memory _baseUriString) public onlyOwner {
        baseUriString = _baseUriString;
    }

}