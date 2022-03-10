import {web3, accounts, nftCreation, bananaCoin, gameContract, testContract, mintCost1,
    mintCost2, mintCost3, upgradeCost, baseURI, baseSalary, upgradedSalaryMultiplier, 
    upgradedSalary, withdrawalTime, withdrawalLoss, abiLock, bytecodeLock, timeTravelFull, 
    otherToken, whitelistContract} from './_contractSetup.test.js';

import BigNumber from 'bignumber.js';
import assert from 'assert';


describe('WhiteListedPresale contract', () => {

    it('constructor() works correctly', async() => {
        const ERC20tokenSource = await whitelistContract.methods.ERC20TokenSourceWallet().call();
        const saleTokenAddress = await whitelistContract.methods.saleTokenAddress().call();
        const priceTokenAddress = await whitelistContract.methods.priceTokenAddress().call();
        const tokenPrice = await whitelistContract.methods.tokenPrice().call();
        const tokenOffer1 = await whitelistContract.methods.tokenOffer1().call();
        const tokenOffer2 = await whitelistContract.methods.tokenOffer2().call();
        const tokenOffer3 = await whitelistContract.methods.tokenOffer3().call();
        const whitelistOnly = await whitelistContract.methods.whitelistOnly().call();
        
        const maxBuyMapping1 = await whitelistContract.methods.maxBuyMapping(accounts[8]).call();
        const maxBuyMapping2 = await whitelistContract.methods.maxBuyMapping(accounts[9]).call();
        const maxBuyMapping3 = await whitelistContract.methods.getCurrentAllowance(accounts[9]).call();

        assert.equal(ERC20tokenSource, accounts[0]);
        assert.equal(saleTokenAddress, bananaCoin.options.address);
        assert.equal(priceTokenAddress, otherToken.options.address);
        assert.equal(tokenPrice, web3.utils.toWei('0.065', 'ether'));
        assert.equal(tokenOffer1, web3.utils.toWei('50', 'ether'));
        assert.equal(tokenOffer2, web3.utils.toWei('100', 'ether'));
        assert.equal(tokenOffer3, web3.utils.toWei('200', 'ether'));
        assert.equal(whitelistOnly, true);
        assert.equal(maxBuyMapping1, web3.utils.toWei('100', 'ether'));
        assert.equal(maxBuyMapping2, web3.utils.toWei('50', 'ether'));
        assert.equal(maxBuyMapping2, maxBuyMapping3);
    });

    it('buyTokens doesn`t work if you`re not on whitelist', async() => {

        const assertionFunc = async() => {
            let x = await whitelistContract.methods.buyTokens(web3.utils.toWei('50', 'ether')).send({ gas: '1000000', from: accounts[3] });
        };

        assert.rejects(assertionFunc);
    });

    it('buyTokens works correctly for whitelisted users', async() => {

        let bnanaCost = await whitelistContract.methods.tokenPrice().call();
        let bnanaBuyQty = '50';
        let bnanaBuyQtyDecimals = web3.utils.toWei(bnanaBuyQty, 'ether');
        let otherPayQty = BigNumber(bnanaBuyQty).multipliedBy(BigNumber(bnanaCost));

        //approve token transfers from source wallet
        await bananaCoin.methods.approve(whitelistContract.options.address, bnanaBuyQtyDecimals).send({
            from: accounts[0]
        });

        //approve token transfers for buyer to pay price
        await otherToken.methods.approve(whitelistContract.options.address, otherPayQty).send({
            from: accounts[8]
        });

        let initialBnanaBalance = await bananaCoin.methods.balanceOf(accounts[8]).call();
        let initialOtherBalance = await otherToken.methods.balanceOf(accounts[8]).call();

        await whitelistContract.methods.buyTokens(bnanaBuyQtyDecimals).send({ gas: '1000000', from: accounts[8] });
        
        let finalBnanaBalance = await bananaCoin.methods.balanceOf(accounts[8]).call();
        let finalOtherBalance = await otherToken.methods.balanceOf(accounts[8]).call();

        assert.equal(BigNumber(finalBnanaBalance).comparedTo(BigNumber.sum(initialBnanaBalance, bnanaBuyQtyDecimals)), 0)
        assert.equal(BigNumber(finalOtherBalance).comparedTo(BigNumber(initialOtherBalance).minus(otherPayQty)), 0)
    }).timeout(10000);

    it('allowance gets zeroed after buying correctly', async() => {

        let newAllowance = await whitelistContract.methods.getCurrentAllowance(accounts[8]).call();
        assert.equal(newAllowance, "0");
    });

    it('user can`t buy more than allowance', async() => {

        let otherTokenQty = web3.utils.toWei('10000', 'ether');

        //send other token to accounts[9]
        await otherToken.methods.transfer(accounts[9], otherTokenQty).send({
            from: accounts[8]
        });

        //allow transfers
        let bnanaCost = await whitelistContract.methods.tokenPrice().call();
        let bnanaBuyQty = '100';
        let bnanaBuyQtyDecimals = web3.utils.toWei(bnanaBuyQty, 'ether');
        let otherPayQty = BigNumber(bnanaBuyQty).multipliedBy(BigNumber(bnanaCost));

        //approve token transfers from source wallet
        await bananaCoin.methods.approve(whitelistContract.options.address, bnanaBuyQtyDecimals).send({
            from: accounts[0]
        });

        //approve token transfers for buyer to pay price
        await otherToken.methods.approve(whitelistContract.options.address, otherPayQty).send({
            from: accounts[9]
        });

        const assertionFunc = async() => {
            let x = await whitelistContract.methods.buyTokens(web3.utils.toWei('50', 'ether')).send({ gas: '1000000', from: accounts[3] });
        };

        assert.rejects(assertionFunc);

    });

    it('not owner cannot switch to all buying', async() => {

        const assertionFunc = async() => {
            await whitelistContract.methods.changeWhitelistRequirement(false).send({ gas: '1000000', from: accounts[3] });
        };

        assert.rejects(assertionFunc);
        

    });

    it('owner can switch to all buying', async() => {

        await whitelistContract.methods.changeWhitelistRequirement(false).send({ gas: '1000000', from: accounts[0] });
        const whitelistOnly = await whitelistContract.methods.whitelistOnly().call();

        assert.equal(whitelistOnly, false);
    });

    it('anyone can buy after unlocking', async() => {

        let otherTokenQty = web3.utils.toWei('100000', 'ether');

        //send other token to accounts[9]
        await otherToken.methods.transfer(accounts[3], otherTokenQty).send({
            from: accounts[8]
        });

        //allow transfers
        let bnanaCost = await whitelistContract.methods.tokenPrice().call();
        let bnanaBuyQty = '5000';
        let bnanaBuyQtyDecimals = web3.utils.toWei(bnanaBuyQty, 'ether');
        let otherPayQty = BigNumber(bnanaBuyQty).multipliedBy(BigNumber(bnanaCost));

        //approve token transfers from source wallet
        await bananaCoin.methods.approve(whitelistContract.options.address, bnanaBuyQtyDecimals).send({
            from: accounts[0]
        });

        //approve token transfers for buyer to pay price
        await otherToken.methods.approve(whitelistContract.options.address, otherPayQty).send({
            from: accounts[3]
        });
        
        let initialBnanaBalance = await bananaCoin.methods.balanceOf(accounts[3]).call();
        let initialOtherBalance = await otherToken.methods.balanceOf(accounts[3]).call();

        await whitelistContract.methods.buyTokens(bnanaBuyQtyDecimals).send({ gas: '1000000', from: accounts[3] });
        
        let finalBnanaBalance = await bananaCoin.methods.balanceOf(accounts[3]).call();
        let finalOtherBalance = await otherToken.methods.balanceOf(accounts[3]).call();

        assert.equal(BigNumber(finalBnanaBalance).comparedTo(BigNumber.sum(initialBnanaBalance, bnanaBuyQtyDecimals)), 0)
        assert.equal(BigNumber(finalOtherBalance).comparedTo(BigNumber(initialOtherBalance).minus(otherPayQty)), 0)

    }).timeout(10000);
});