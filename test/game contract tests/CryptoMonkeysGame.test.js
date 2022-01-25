const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const path = require('path');
const fs = require('fs');

const contractPath = path.resolve(__dirname, '../bin/contracts/nft_creation', 'CryptoMonkeyChars.json');
const nftCreationCompile = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const abi = nftCreationCompile.abi;
const bytecode = nftCreationCompile.bytecode;

const contractPathBanana = path.resolve(__dirname, '../bin/contracts/token_creation', 'BananaCoin.json');
const bananaCoinCompile = JSON.parse(fs.readFileSync(contractPathBanana, 'utf8'));
const abiBanana = bananaCoinCompile.abi;
const bytecodeBanana = bananaCoinCompile.bytecode;

const contractPathGame = path.resolve(__dirname, '../bin/contracts/game', 'CryptoMonkeysGame.json');
const gameCompile = JSON.parse(fs.readFileSync(contractPathGame, 'utf8'));
const abiGame = gameCompile.abi;
const bytecodeGame = gameCompile.bytecode;

let accounts;
let nftCreation;
let bananaCoin;
let gameContract;

let mintCost = '100';
let upgradeCost = '450';
let baseURI = 'https://gateway.pinata.cloud/ipfs/Qmb86L8mUphwJGzLPwXNTRiK1S4scBdj9cc2Sev3s8uLiB';

beforeEach(async() => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    //deploy ERC20 token
    bananaCoin = await new web3.eth.Contract(abiBanana)
        .deploy({
            data: bytecodeBanana,
        })
        .send({ from: accounts[0], gas: '1000000' });

    //deploy ERC721 nft
    nftCreation = await new web3.eth.Contract(abi)
        .deploy({
            data: bytecode,
            arguments: [bananaCoin.options.address, mintCost, upgradeCost, baseURI]
        })
        .send({ from: accounts[0], gas: '5000000' });

    //deploy game contract
    gameContract = await new web3.eth.Contract(abiGame)
        .deploy({
            data: bytecodeGame,
            arguments: [accounts[2], bananaCoin.options.address, nftCreation.options.address, 60 * 60 * 3]
        })
        .send({ from: accounts[0], gas: '5000000' });
});

describe('CryptoMonkeysGame contract', () => {

    it('deploys a contract', () => {
        assert.ok(gameContract.options.address);
    });

    it('constructor() works correctly', async() => {
        const sourceWallet = await gameContract.methods.ERC20TokenSourceWallet().call();
        const tokenAddress = await gameContract.methods.tokenAddress().call();
        const nftAddress = await gameContract.methods.nftAddress().call();
        const waitPeriod = await gameContract.methods.waitPeriod().call();

        assert.equal(sourceWallet, accounts[2]);
        assert.equal(tokenAddress, bananaCoin.options.address);
        assert.equal(nftAddress, nftCreation.options.address);
        assert.equal(waitPeriod, 60 * 60 * 3);
    });

    it('getLastMiningMapping() works correctly', async() => {

        //mint NFT
        await bananaCoin.methods.approve(nftCreation.options.address, mintCost).send({ from: accounts[0], gas: '1000000' });
        await nftCreation.methods.mintNft(accounts[0]).send({ from: accounts[0], gas: '1000000' });
        const nftTokenId = await nftCreation.methods.tokenOfOwnerByIndex(accounts[0], 0).call();

        //get lastMiningMapping
        const lastMiningMapping = await gameContract.methods.getLastMiningMapping(nftTokenId).call();

        assert.equal(lastMiningMapping, 0);
        
    });

    it('baseMining() works correctly', async() => {

        const startContractBalance = "10000000";
        const startUserBalance = await bananaCoin.methods.balanceOf(accounts[0]).call();

        //send funds to ERC20TokenSourceWallet
        await bananaCoin.methods.transfer(accounts[2], startContractBalance).send({ from: accounts[0]});
        await bananaCoin.methods.approve(gameContract.options.address, startContractBalance).send({ from: accounts[2]});

        //mint NFT
        await bananaCoin.methods.approve(nftCreation.options.address, mintCost).send({ from: accounts[0], gas: '1000000' });
        await nftCreation.methods.mintNft(accounts[0]).send({ from: accounts[0], gas: '1000000' });
        const nftTokenId = await nftCreation.methods.tokenOfOwnerByIndex(accounts[0], 0).call();
        const nftSalary = await nftCreation.methods.tokensAttributes(nftTokenId).call();

        //get lastMiningMapping and balances before mining
        const lastMiningMapping0 = await gameContract.methods.getLastMiningMapping(nftTokenId).call();
        const ERC20balanceUser0 = await bananaCoin.methods.balanceOf(accounts[0]).call();
        const ERC20balanceContract0 = await bananaCoin.methods.balanceOf(accounts[2]).call();

        //run game once
        await gameContract.methods.baseMining(nftTokenId).send({ from: accounts[0] });

        //get lastMiningMapping and balances after mining
        const lastMiningMapping1 = await gameContract.methods.getLastMiningMapping(nftTokenId).call();
        const ERC20balanceUser1 = await bananaCoin.methods.balanceOf(accounts[0]).call();
        const ERC20balanceContract1 = await bananaCoin.methods.balanceOf(accounts[2]).call();

        assert.equal(lastMiningMapping0, 0);
        assert.notEqual(lastMiningMapping0, lastMiningMapping1);

        assert.equal(parseFloat(ERC20balanceContract0), parseFloat(ERC20balanceContract1) + parseFloat(nftSalary.salary) );
        assert.equal(parseFloat(ERC20balanceUser0), parseFloat(ERC20balanceUser1) - parseFloat(nftSalary.salary) );
        
        //doesn't allow new minings until timeout
        const assertionFunc = async() => {
            await gameContract.methods.baseMining(nftTokenId).send({ from: accounts[0] });
        };
        assert.rejects(assertionFunc);

        
    }).timeout(5000);

    it('baseMining() doesn`t allow use of other people`s chars', async() => {

        const startContractBalance = "10000000";
        const startUserBalance = await bananaCoin.methods.balanceOf(accounts[0]).call();

        //send funds to ERC20TokenSourceWallet
        await bananaCoin.methods.transfer(accounts[2], startContractBalance).send({ from: accounts[0]});
        await bananaCoin.methods.approve(gameContract.options.address, startContractBalance).send({ from: accounts[2]});

        //mint NFT
        await bananaCoin.methods.approve(nftCreation.options.address, mintCost).send({ from: accounts[0], gas: '1000000' });
        await nftCreation.methods.mintNft(accounts[0]).send({ from: accounts[0], gas: '1000000' });
        const nftTokenId = await nftCreation.methods.tokenOfOwnerByIndex(accounts[0], 0).call();
        const nftSalary = await nftCreation.methods.tokensAttributes(nftTokenId).call();

        //run game once
        const assertionFunc = async() => {
            await gameContract.methods.baseMining(nftTokenId).send({ from: accounts[1] });
        };
        assert.rejects(assertionFunc);

    });

    it('Ownable assigned to deployer', async() => {
        const owner = await gameContract.methods.owner().call();
        assert.equal(owner, accounts[0])
    });

    it('Owner private functions work', async() => {
        await gameContract.methods.setERC20TokenSourceWallet(accounts[8]).send({ from: accounts[0] });
        await gameContract.methods.setWaitPeriod("10").send({ from: accounts[0] });
        await gameContract.methods.setTokenAddress(accounts[7]).send({ from: accounts[0] });
        await gameContract.methods.setNftAddress(accounts[6]).send({ from: accounts[0] });

        const sourceWallet = await gameContract.methods.ERC20TokenSourceWallet().call();
        const waitPeriod = await gameContract.methods.waitPeriod().call();
        const tokenAddress = await gameContract.methods.tokenAddress().call();
        const nftAddress = await gameContract.methods.nftAddress().call();
        
        assert.equal(sourceWallet, accounts[8]);
        assert.equal(waitPeriod,"10");
        assert.equal(tokenAddress, accounts[7]);
        assert.equal(nftAddress, accounts[6]);
        
    });

    it('Owner private functions don`t work if not called by owner', async() => {
        const assertionFunc0 = async() => {
            await gameContract.methods.setERC20TokenSourceWallet(accounts[8]).send({ from: accounts[1] });
        };
        const assertionFunc1 = async() => {
            await gameContract.methods.setWaitPeriod("10").send({ from: accounts[1] });
        };
        const assertionFunc2 = async() => {
            await gameContract.methods.setTokenAddress(accounts[7]).send({ from: accounts[1] });
        };
        const assertionFunc3 = async() => {
            await gameContract.methods.setNftAddress(accounts[6]).send({ from: accounts[1] });
        };

        assert.rejects(assertionFunc0);
        assert.rejects(assertionFunc1);
        assert.rejects(assertionFunc2);
        assert.rejects(assertionFunc3);
    });

});