import {web3, accounts, nftCreation, bananaCoin, gameContract, mintCost1,
    mintCost2, mintCost3, upgradeCost, baseURI, baseSalary, 
    upgradedSalaryMultiplier, upgradedSalary} from './_contractSetup.test.js';

import assert from 'assert';

describe('CryptoMonkeysGame contract', () => {


    it('deploys a contract', () => {
        assert.ok(gameContract.options.address);
    });

    it('constructor() works correctly', async() => {
        const sourceWallet = await gameContract.methods.ERC20TokenSourceWallet().call();
        const tokenAddress = await gameContract.methods.tokenAddress().call();
        const nftAddress = await gameContract.methods.nftAddress().call();
        const waitPeriod = await gameContract.methods.waitPeriod().call();
        let baseSalaryMapping = [];
        let upgradedSalaryMapping = [];
        for (let i=1; i<=14; i++) {
            baseSalaryMapping.push( await gameContract.methods.baseSalary(i).call() );
            upgradedSalaryMapping.push( await gameContract.methods.upgradedSalary(i).call() );
        }

        assert.equal(sourceWallet, accounts[2]);
        assert.equal(tokenAddress, bananaCoin.options.address);
        assert.equal(nftAddress, nftCreation.options.address);
        assert.equal(waitPeriod, 60 * 60 * 8);
        assert.equal(baseSalaryMapping.length, baseSalary.length);
        assert( baseSalaryMapping.every((val, index) => val === baseSalary[index]) );
        assert.equal(upgradedSalaryMapping.length, upgradedSalary.length);
        assert( upgradedSalaryMapping.every((val, index) => val === upgradedSalary[index]) );

    }).timeout(10000);

    it('getLastMiningMapping() works correctly', async() => {

        //get lastMiningMapping
        const nftTokenId = await nftCreation.methods.tokenOfOwnerByIndex(accounts[0], 0).call();

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