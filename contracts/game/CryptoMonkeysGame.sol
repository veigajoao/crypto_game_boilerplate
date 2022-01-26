// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "../nft_creation/CryptoMonkeyChars.sol";

contract CryptoMonkeysGame is Ownable{

    //address for wallet holding play to earn funds
    address public ERC20TokenSourceWallet;

    //address of ERC20 and ERC721 contracts
    address public tokenAddress;
    address public nftAddress;

    //ERC20 and ERC721 interfaces
    ERC20Burnable public tokenContract;
    CryptoMonkeyChars public nftContract; 

    //wait period controls
    uint256 public waitPeriod;
    mapping (uint256 => uint256) public lastMiningMapping;

    //salary mappings
    mapping (uint256 => uint256) public baseSalary;
    mapping (uint256 => uint256) public upgradedSalary;

    //sets balance of users
    mapping (address => uint256) public userBalance;
    mapping (address => uint256) public lastWithdrawal;
    uint256 public withdrawalTime;
    uint256 public withdrawalLoss;

    constructor(
        address _ERC20TokenSourceWallet,
        address _tokenAddress, 
        address _nftAddress,
        uint256 _waitPeriod,
        uint256[14] memory _baseSalary,
        uint256[14] memory _upgradedSalary,
        uint256 _withdrawalTime,
        uint256 _withdrawalLoss) {
            
            ERC20TokenSourceWallet = _ERC20TokenSourceWallet;
            tokenAddress = _tokenAddress;
            nftAddress = _nftAddress;
            waitPeriod = _waitPeriod;

            tokenContract = ERC20Burnable(tokenAddress);
            nftContract = CryptoMonkeyChars(nftAddress);

            baseSalary[1] = _baseSalary[0];
            baseSalary[2] = _baseSalary[1];
            baseSalary[3] = _baseSalary[2];
            baseSalary[4] = _baseSalary[3];
            baseSalary[5] = _baseSalary[4];
            baseSalary[6] = _baseSalary[5];
            baseSalary[7] = _baseSalary[6];
            baseSalary[8] = _baseSalary[7];
            baseSalary[9] = _baseSalary[8];
            baseSalary[10] = _baseSalary[9];
            baseSalary[11] = _baseSalary[10];
            baseSalary[12] = _baseSalary[11];
            baseSalary[13] = _baseSalary[12];
            baseSalary[14] = _baseSalary[13];

            upgradedSalary[1] = _upgradedSalary[0];
            upgradedSalary[2] = _upgradedSalary[1];
            upgradedSalary[3] = _upgradedSalary[2];
            upgradedSalary[4] = _upgradedSalary[3];
            upgradedSalary[5] = _upgradedSalary[4];
            upgradedSalary[6] = _upgradedSalary[5];
            upgradedSalary[7] = _upgradedSalary[6];
            upgradedSalary[8] = _upgradedSalary[7];
            upgradedSalary[9] = _upgradedSalary[8];
            upgradedSalary[10] = _upgradedSalary[9];
            upgradedSalary[11] = _upgradedSalary[10];
            upgradedSalary[12] = _upgradedSalary[11];
            upgradedSalary[13] = _upgradedSalary[12];
            upgradedSalary[14] = _upgradedSalary[13];

            require(_withdrawalLoss > 1, "CryptoMonkeysGame: _withdrawalLoss must be > 1 (write in absolute, for 70%, write 70)");
            withdrawalTime = _withdrawalTime;
            withdrawalLoss = _withdrawalLoss; 
            
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
        
        // make sure the first withdrawal will only be made after the withsrawal period (initialliza
        // wallet in the lastWithdrawal mapping)
        if (lastWithdrawal[msg.sender] == 0) {
            lastWithdrawal[msg.sender] = block.timestamp;
        }
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
        
        //fetch monkey salary and transfer
        uint256 salary = baseSalary[uint256(monkeyType)];
        userBalance[msg.sender] += salary;
    
    }

    /**
     * @dev function to do basic game minin, that can be perfomerd by any charm
     * regardless of level, attributes, etc.
     *
     * @param _tokenId Id of the nft in the ERC721 contract
     */
    function level2Mining(uint256 _tokenId) public validateMiningConditions(_tokenId) {

        (uint8 monkeyType, uint8 charLevel, ) = nftContract.tokensAttributes(_tokenId);
        //require level 2 char
        require(charLevel == 2, "CryptoMonkeysGame: Char level needs to be 2 to call this function"); 
        
        //fetch monkey salary and transfer
        uint256 salary = upgradedSalary[uint256(monkeyType)];
        userBalance[msg.sender] += salary;
        // tokenContract.transferFrom(ERC20TokenSourceWallet, msg.sender, salary);
    
    }

    //User balance functions

    /**
     * @dev internal function to get balance that user can actually withdrawal
     * after discounting any fees for not waiting long enough
     */
    function _getUserWithdrawalTerms(address _address) internal view returns (uint256) {

        uint256 _userBalance = userBalance[_address];
        uint256 _timeElapsed = block.timestamp - lastWithdrawal[_address];

        uint256 _availableFunds;

        if (_timeElapsed < withdrawalTime) {
            //operations written in a way to avoid rounding to zero
            //more elegant mathematically pure way of writting would be:
            //_availableFunds = _userBalance * ( _timeElapsed / withdrawalTime) * (withdrawalLoss / 100);
            _availableFunds = ( _userBalance * _timeElapsed * withdrawalLoss ) / (withdrawalTime * 100);
        } else {
            _availableFunds = _userBalance;
        }
        return _availableFunds;

        // test getting the time elapsed to see if it is correct

    }

    /**
     * @dev function to withdrawal current user balance
     */
    function withdrawalUserBalance() public {
        uint256 _userAvailableBalance = _getUserWithdrawalTerms(msg.sender);
        userBalance[msg.sender] = 0;
        lastWithdrawal[msg.sender] = block.timestamp;
        tokenContract.transferFrom(ERC20TokenSourceWallet, msg.sender, _userAvailableBalance);
    }

    /**
     * @dev function to get user balance that is already available for withdrawing
     */
    function getAvailableBalance(address _address) public view returns (uint256) {
        return _getUserWithdrawalTerms(_address);
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

    function setSalaries(uint256[14] memory _baseSalary, uint256[14] memory _upgradedSalary) public onlyOwner {
        baseSalary[1] = _baseSalary[0];
        baseSalary[2] = _baseSalary[1];
        baseSalary[3] = _baseSalary[2];
        baseSalary[4] = _baseSalary[3];
        baseSalary[5] = _baseSalary[4];
        baseSalary[6] = _baseSalary[5];
        baseSalary[7] = _baseSalary[6];
        baseSalary[8] = _baseSalary[7];
        baseSalary[9] = _baseSalary[8];
        baseSalary[10] = _baseSalary[9];
        baseSalary[11] = _baseSalary[10];
        baseSalary[12] = _baseSalary[11];
        baseSalary[13] = _baseSalary[12];
        baseSalary[14] = _baseSalary[13];

        upgradedSalary[1] = _upgradedSalary[0];
        upgradedSalary[2] = _upgradedSalary[1];
        upgradedSalary[3] = _upgradedSalary[2];
        upgradedSalary[4] = _upgradedSalary[3];
        upgradedSalary[5] = _upgradedSalary[4];
        upgradedSalary[6] = _upgradedSalary[5];
        upgradedSalary[7] = _upgradedSalary[6];
        upgradedSalary[8] = _upgradedSalary[7];
        upgradedSalary[9] = _upgradedSalary[8];
        upgradedSalary[10] = _upgradedSalary[9];
        upgradedSalary[11] = _upgradedSalary[10];
        upgradedSalary[12] = _upgradedSalary[11];
        upgradedSalary[13] = _upgradedSalary[12];
        upgradedSalary[14] = _upgradedSalary[13];
    }

    function setWithdrawal(uint256 _withdrawalTime, uint256 _withdrawalLoss) public onlyOwner {
        require(_withdrawalLoss > 1, "CryptoMonkeysGame: _withdrawalLoss must be > 1 (write in absolute, for 70%, write 70)");
        withdrawalTime = _withdrawalTime;
        withdrawalLoss = _withdrawalLoss;
    }
}