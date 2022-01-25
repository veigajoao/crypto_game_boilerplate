//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract CryptoMonkeyChars is ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIds;

    //mapping to nft attributes
    struct CharAttributes {
        uint8 monkeyType;
        uint8 charLevel;
        uint256 mintTime;
    }
    mapping (uint256 => CharAttributes) public tokensAttributes;

    //call to ERC20 contract
    address public tokenAddress;

    //define costs of interactions
    mapping (uint16 => uint256) public mintCost;
    uint256 public levelUpCost;

    //base URI location
    string public baseUriString;

    constructor(
        address _tokenAddress, 
        uint256 _mintCostBasic,
        uint256 _mintCostRare,
        uint256 _mintCostLegendary,
        uint256 _levelUpCost,
        string memory _baseUriString
        ) ERC721("CryptoMonkeys", "CMONKEYS") {

            //setup owner variables
            tokenAddress = _tokenAddress;
            mintCost[1] = _mintCostBasic;
            mintCost[2] = _mintCostRare;
            mintCost[3] = _mintCostLegendary;
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
    function randomElement(uint256 tokenId) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, msg.sender, _tokenIds.current(), tokenId)));
    }
    /**
     * @dev mapping of different monkey types
     */
    function _getMonkeyType(uint256 _seed, uint16 _probabilityMapping) internal pure returns (uint8) {
        //declare rarities
        uint8 commom;
        uint8 rare;
        uint8 epic;
        uint8 legendary;

        //adjust to _probabilityMapping
        if (_probabilityMapping == 1) {
            commom = 68;
            rare = 22;
            epic = 8;
            legendary = 2;
        } else if (_probabilityMapping == 2) {
            commom = 30;
            rare = 40;
            epic = 20;
            legendary = 10;
        } else if (_probabilityMapping == 3) {
            commom = 0;
            rare = 40;
            epic = 40;
            legendary = 20;
        }

        //deliver result
        if (_seed < commom) {
            return uint8( (_seed % 5) + 1 );
        } else if (_seed < commom + rare) {
            return uint8( (_seed % 4) + 6 );
        } else if (_seed < commom + rare + epic) {
            return uint8( (_seed % 3) + 10 );
        } else if (_seed < commom + rare + epic + legendary) {
            return uint8( (_seed % 2) + 13 );
        } else {
            revert("Failure in random selection method");
        }

    }

    /**
     * @dev Sets all of the tokens relevant attributes (monkey tipe, level, 
     * mintTime and URI).
     *
     * @param tokenId id of created token
     * @param _probabilityMapping id of the probebility mapping to be used accordingly to type of
     * box purchased by player
     * Requirements:
     *
     * - `tokenId` must exist.
     * - `tokenId` must not be a mapping key already
     */
    function _setTokenAttributes(uint256 tokenId, uint16 _probabilityMapping) internal {

        uint8 _monkeyType = _getMonkeyType(randomElement(tokenId) % 100, _probabilityMapping);

        tokensAttributes[tokenId] = CharAttributes({
            monkeyType: _monkeyType,
            charLevel: 1,
            mintTime: block.timestamp
        });
        _setTokenURI(tokenId, string(abi.encodePacked("/", Strings.toString(_monkeyType), ".png")));

    }

    /**
     * @dev mints new nft and burns the price
     *
     * @param recipient address that wishes to mint the nft
     * need to add support for multiple box types and prices
     */
    function mintNft(address recipient, uint16 _probabilityMapping) public {

        require(_probabilityMapping == 1 || _probabilityMapping == 2 || _probabilityMapping == 3, "CryptoMonkeyChars: mintNft: _probabilityMapping must belong to uint16[1, 2, 3]");

        ERC20Burnable tokenContract = ERC20Burnable(tokenAddress);
        tokenContract.burnFrom(recipient, mintCost[_probabilityMapping]);

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenAttributes(newItemId, _probabilityMapping);

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

    function setMintCost(uint256 _cost1, uint256 _cost2, uint256 _cost3) public onlyOwner {
        mintCost[1] = _cost1;
        mintCost[2] = _cost2;
        mintCost[3] = _cost3;
    }

    function setLevelUpCost(uint256 _cost) public onlyOwner {
        levelUpCost = _cost;
    }

    function setBaseUriString(string memory _baseUriString) public onlyOwner {
        baseUriString = _baseUriString;
    }

}