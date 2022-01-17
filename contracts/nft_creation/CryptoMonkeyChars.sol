//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
        uint8 attr1;
        uint8 attr2;
        uint8 attr3;
        uint8 attr4;
    }
    mapping (uint256 => CharAttributes) private _tokensAttributes;

    constructor() ERC721("CryptoMonkeys", "CMONKEYS") {}

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

    function _baseURI() internal pure override returns (string memory) {
        return "https://foo.com/token/";
    }
    //end override

    //section set token attributes pseudoramdomly
    /**
    * @dev algo will randomly choose from 10 types of monkeys
    */
    function randomElement(uint256 tokenId) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, msg.sender, _tokenIds.current(), tokenId)));
    }
    
    /**
     * @dev Sets `_tokenURI` as the CharAttributes of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _setTokenAttributes(uint256 tokenId) internal {
        uint256 _charType = randomElement(tokenId) % 10;
        uint256 _charAttr1 = randomElement(tokenId) % 100;
        uint256 _charAttr2 = randomElement(tokenId) % 100;
        uint256 _charAttr3 = randomElement(tokenId) % 100;
        uint256 _charAttr4 = randomElement(tokenId) % 100;

        _tokensAttributes[tokenId] = CharAttributes({
            monkeyType: uint8(_charType),
            attr1: uint8(_charAttr1),
            attr2: uint8(_charAttr2),
            attr3: uint8(_charAttr3),
            attr4: uint8(_charAttr4)
        });

    }

    /**
     * @dev mints new nft
     */
    function mintNFT(address recipient)
        public onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI(newItemId));
        _setTokenAttributes(newItemId);

        return newItemId;
    }
}