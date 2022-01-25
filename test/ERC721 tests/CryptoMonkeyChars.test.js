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

let accounts;
let nftCreation;
let bananaCoin;

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
});

describe('CryptoMonkeyChars contract', () => {

    it('deploys a contract', () => {
        assert.ok(nftCreation.options.address);
    });

    it('constructor() works correctly', async() => {
        const name = await nftCreation.methods.name().call();
        const symbol = await nftCreation.methods.symbol().call();

        const tokenAddress = await nftCreation.methods.tokenAddress().call();
        const mintCost = await nftCreation.methods.mintCost().call();
        const levelUpCost = await nftCreation.methods.levelUpCost().call();
        const baseUriString = await nftCreation.methods.baseUriString().call();

        assert.equal(name, "CryptoMonkeys");
        assert.equal(symbol, "CMONKEYS");

        assert.equal(tokenAddress, bananaCoin.options.address);
        assert.equal(mintCost, mintCost);
        assert.equal(levelUpCost, upgradeCost);
        assert.equal(baseUriString, baseURI);
    });

    it('mintNft() works correctly if user pays ERC20 tokens', async() => {
        
        //approve spending in ERC20 contract
        await bananaCoin.methods.approve(nftCreation.options.address, mintCost).send({ from: accounts[0], gas: '1000000' });

        const balance0 = parseInt(await bananaCoin.methods.balanceOf(accounts[0]).call());
        const balance0nft = parseInt(await nftCreation.methods.balanceOf(accounts[0]).call());

        await nftCreation.methods.mintNft(accounts[0]).send({ from: accounts[0], gas: '1000000' });

        const balance1 = parseInt(await bananaCoin.methods.balanceOf(accounts[0]).call());
        const balance1nft = parseInt(await nftCreation.methods.balanceOf(accounts[0]).call());

        assert.equal(balance0, balance1 + parseInt(mintCost));
        assert.equal(balance0nft, balance1nft - 1);
        
    });

    it('mintNft() doesn`t work if user doesn`t pay ERC20 tokens', async() => {
        
        await bananaCoin.methods.approve(nftCreation.options.address, mintCost).send({ from: accounts[1], gas: '1000000' });

        //should fail because accounts[1] doesn't have any ERC20 tokens
        const assertionFunc = async() => {
            await nftCreation.methods.mintNft(accounts[0]).send({ from: accounts[1] })
        };

        assert.rejects(assertionFunc);

    });

    it('upgradeNft() works correctly if user pays ERC20 tokens', async() => {
        
        //mint nft
        await bananaCoin.methods.approve(nftCreation.options.address, mintCost).send({ from: accounts[0], gas: '1000000' });
        await nftCreation.methods.mintNft(accounts[0]).send({ from: accounts[0], gas: '1000000' });

        //approve spending in ERC20 contract
        await bananaCoin.methods.approve(nftCreation.options.address, upgradeCost).send({ from: accounts[0], gas: '1000000' });

        //get id of one of accounts[0]'s nfts
        const tokenId = await nftCreation.methods.tokenOfOwnerByIndex(accounts[0], 0).call();

        const nftStruct0 = await nftCreation.methods.tokensAttributes(tokenId).call();
        const balance0 = parseInt(await bananaCoin.methods.balanceOf(accounts[0]).call());

        await nftCreation.methods.upgradeNft(accounts[0], tokenId).send({ from: accounts[0], gas: '1000000' });

        const balance1 = parseInt(await bananaCoin.methods.balanceOf(accounts[0]).call());
        const nftStruct1 = await nftCreation.methods.tokensAttributes(tokenId).call();

        assert.equal(balance0, balance1 + parseInt(upgradeCost));
        assert.equal(nftStruct0.charLevel, "1");
        assert.equal(nftStruct1.charLevel, "2");

        //assert correct Uri
        const assetUri = await nftCreation.methods.tokenURI(tokenId).call();;
        assert.equal(assetUri, baseURI + "/1.png");
        
        
        //check that upgrade can't be done a second time
        await bananaCoin.methods.approve(nftCreation.options.address, upgradeCost).send({ from: accounts[0], gas: '1000000' });
        const assertionFunc = async() => {
            await nftCreation.methods.upgradeNft(accounts[0], tokenId).send({ from: accounts[0], gas: '1000000' });
        };

        assert.rejects(assertionFunc);

    }).timeout(5000);

    it('upgradeNft() doesn`t work if user doesn`t pay ERC20 tokens', async() => {
        
        await bananaCoin.methods.approve(nftCreation.options.address, upgradeCost).send({ from: accounts[1], gas: '1000000' });
        
        //should fail because accounts[1] doesn't have any ERC20 tokens
        const assertionFunc = async() => {
            await nftCreation.methods.mintNft(accounts[0]).send({ from: accounts[1] })
        };

        assert.rejects(assertionFunc);

    });

    it('Ownable assigned to deployer', async() => {
        const owner = await nftCreation.methods.owner().call();
        assert.equal(owner, accounts[0])
    });

    it('Owner private functions work', async() => {
        await nftCreation.methods.setTokenAddress(accounts[8]).send({ from: accounts[0] });
        await nftCreation.methods.setMintCost("10").send({ from: accounts[0] });
        await nftCreation.methods.setLevelUpCost("20").send({ from: accounts[0] });
        await nftCreation.methods.setBaseUriString("ABDE").send({ from: accounts[0] });

        const tokenAddress = await nftCreation.methods.tokenAddress().call();
        const mintCost = await nftCreation.methods.mintCost().call();
        const levelUpCost = await nftCreation.methods.levelUpCost().call();
        const baseUriString = await nftCreation.methods.baseUriString().call();

        assert.equal(tokenAddress, accounts[8]);
        assert.equal(mintCost, "10");
        assert.equal(levelUpCost, "20");
        assert.equal(baseUriString, "ABDE");
    });

    it('Owner private functions don`t work if not called by owner', async() => {
        const assertionFunc0 = async() => {
            await nftCreation.methods.setTokenAddress(accounts[8]).send({ from: accounts[1] });
        };
        const assertionFunc1 = async() => {
            await nftCreation.methods.setMintCost("10").send({ from: accounts[1] });
        };
        const assertionFunc2 = async() => {
            await nftCreation.methods.setLevelUpCost("20").send({ from: accounts[1] });
        };
        const assertionFunc3 = async() => {
            await nftCreation.methods.setBaseUriString("ABDE").send({ from: accounts[1] });
        };

        assert.rejects(assertionFunc0);
        assert.rejects(assertionFunc1);
        assert.rejects(assertionFunc2);
        assert.rejects(assertionFunc3);
    });

});