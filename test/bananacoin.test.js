import {web3, accounts, nftCreation, bananaCoin, gameContract, testContract, mintCost1,
    mintCost2, mintCost3, upgradeCost, baseURI, baseSalary, upgradedSalaryMultiplier, 
    upgradedSalary, withdrawalTime, withdrawalLoss, abiLock, bytecodeLock, timeTravelFull} from './_contractSetup.test.js';

import assert from 'assert';

describe('BananaCoin contract', () => {

    it('deploys a contract', () => {
        assert.ok(bananaCoin.options.address);
    });

    it('constructor() works correctly', async() => {
        const managerBalance = await bananaCoin.methods.balanceOf(accounts[0]).call();
        const supplyAmount = 58 * 10**6
        assert.equal(managerBalance, web3.utils.toWei(supplyAmount.toString(), "ether"));
    });

    it('name() is set correctly', async() => {
        const coinName = await bananaCoin.methods.name().call();
        const coinSymbol = await bananaCoin.methods.symbol().call();
        assert.equal(coinName, "BitBanana");
        assert.equal(coinSymbol, "BNANA");
    });

    it('can transfer funds between accounts', async() => {

        const transferAmount = 10000;

        const balance0_0 = parseInt(await bananaCoin.methods.balanceOf(accounts[0]).call());
        const balance1_0 = parseInt(await bananaCoin.methods.balanceOf(accounts[1]).call());

        await bananaCoin.methods.transfer(accounts[1], transferAmount).send({
            from: accounts[0]
        });

        const balance0_1 = parseInt(await bananaCoin.methods.balanceOf(accounts[0]).call());
        const balance1_1 = parseInt(await bananaCoin.methods.balanceOf(accounts[1]).call());

        assert.equal(balance0_0 - transferAmount, balance0_1);
        assert.equal(balance1_0 + transferAmount, balance1_1);
        assert.equal(balance1_0 + balance0_0, balance1_1 + balance0_1);

    });

    it('can provide allowance to other apps', async() => {

        const transferAmount = 10000;

        const balance0_0 = parseInt(await bananaCoin.methods.balanceOf(accounts[0]).call());
        const balance1_0 = parseInt(await bananaCoin.methods.balanceOf(accounts[1]).call());

        await bananaCoin.methods.approve(accounts[1], transferAmount).send({
            from: accounts[0]
        });

        const allowanceValue = parseInt(await bananaCoin.methods.allowance(accounts[0], accounts[1]).call());

        await bananaCoin.methods.transferFrom(accounts[0], accounts[1], transferAmount).send({
            from: accounts[1]
        });

        const balance0_1 = parseInt(await bananaCoin.methods.balanceOf(accounts[0]).call());
        const balance1_1 = parseInt(await bananaCoin.methods.balanceOf(accounts[1]).call());

        const allowanceValue2 = parseInt(await bananaCoin.methods.allowance(accounts[0], accounts[1]).call());

        assert.equal(allowanceValue, transferAmount);
        assert.equal(balance0_0 - transferAmount, balance0_1);
        assert.equal(balance1_0 + transferAmount, balance1_1);
        assert.equal(balance1_0 + balance0_0, balance1_1 + balance0_1);

    });

});