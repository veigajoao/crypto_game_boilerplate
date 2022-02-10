import {web3, accounts, nftCreation, bananaCoin, gameContract, testContract, mintCost1,
    mintCost2, mintCost3, upgradeCost, baseURI, baseSalary, upgradedSalaryMultiplier, 
    upgradedSalary, withdrawalTime, withdrawalLoss, abiLock, bytecodeLock, timeTravelFull} from './_contractSetup.test.js';

import BigNumber from 'bignumber.js';
import assert from 'assert';

let timeLocked;
let lockPeriod = 60 * 60 * 24 * 30;
let transferAmmount = "1000000";

describe('TimeLockedWallet contract', () => {

    it('deploys a contract', async() => {
       
        timeLocked = await new web3.eth.Contract(abiLock)
            .deploy({
                data: bytecodeLock,
                arguments: [accounts[0], lockPeriod]
            })
            .send({ from: accounts[0], gas: '1000000' });
        
        assert.ok(timeLocked.options.address)

    });

    it('constructor() works correctly', async() => {
        const beneficiary = await timeLocked.methods.beneficiary().call();
        const startTime = await timeLocked.methods.start().call();
        const lockPeriodDeployed = await timeLocked.methods.duration().call();

        assert.equal(beneficiary, accounts[0]);
        assert.equal(lockPeriodDeployed, lockPeriod);

    });

    it('can transfer funds to the contract', async() => {

        const initial_EOA = await bananaCoin.methods.balanceOf(accounts[0]).call();
        const initial_contract = await bananaCoin.methods.balanceOf(timeLocked.options.address).call();

        await bananaCoin.methods.transfer(timeLocked.options.address, web3.utils.toWei(transferAmmount, "ether")).send({ gas: '1000000', from: accounts[0] });
        
        const end_EOA = await bananaCoin.methods.balanceOf(accounts[0]).call();
        const end_contract = await bananaCoin.methods.balanceOf(timeLocked.options.address).call();

        assert.equal( BigNumber(initial_EOA).comparedTo(BigNumber.sum(end_EOA, web3.utils.toWei(transferAmmount, "ether"))), 0);
        assert.equal( BigNumber(end_contract).comparedTo(BigNumber.sum(initial_contract, web3.utils.toWei(transferAmmount, "ether"))), 0);

        let testTime = await testContract.methods.getCurrentTime().call();
        const vested_0 = await timeLocked.methods.vestedAmount(bananaCoin.options.address, testTime).call();
        
        assert(parseFloat(vested_0) > 0);

    });

    it('vesting formula works correctly', async() => {

        let initialTime = await testContract.methods.getCurrentTime().call();

        const vested_0 = await timeLocked.methods.vestedAmount(bananaCoin.options.address, initialTime).call();

        //pass 1/2 timeLock - sending meaningless transaction after to mine block
        timeTravelFull(lockPeriod / 2);
        await bananaCoin.methods.transfer(accounts[1], "1").send({ gas: '1000000', from: accounts[0] });

        const middleTime = await testContract.methods.getCurrentTime().call();
        const vested_1 = await timeLocked.methods.vestedAmount(bananaCoin.options.address, middleTime).call();

        //pass rest of time - sending meaningless transaction after to mine block
        timeTravelFull(lockPeriod);
        await bananaCoin.methods.transfer(accounts[1], "1").send({ gas: '1000000', from: accounts[0] });

        const endTime = await testContract.methods.getCurrentTime().call();
        const vested_2 = await timeLocked.methods.vestedAmount(bananaCoin.options.address, endTime).call();

        assert.equal( BigNumber(vested_1).comparedTo( BigNumber(web3.utils.toWei(transferAmmount, "ether")).div("2") ), 1);
        assert.equal( BigNumber(vested_2).comparedTo( BigNumber(web3.utils.toWei(transferAmmount, "ether")) ), 0);
        


    });

    it('can withdrawal from contract', async() => {

        const initial_EOA = await bananaCoin.methods.balanceOf(accounts[0]).call();
        const initial_contract = await bananaCoin.methods.balanceOf(timeLocked.options.address).call();

        await timeLocked.methods.release(bananaCoin.options.address).send({ gas: '1000000', from: accounts[0] });
        
        const end_EOA = await bananaCoin.methods.balanceOf(accounts[0]).call();
        const end_contract = await bananaCoin.methods.balanceOf(timeLocked.options.address).call();

        assert.equal( BigNumber(end_EOA).comparedTo(BigNumber.sum(initial_EOA, web3.utils.toWei(transferAmmount, "ether"))), 0);
        assert.equal( BigNumber(initial_contract).comparedTo(BigNumber.sum(end_contract, web3.utils.toWei(transferAmmount, "ether"))), 0);

    });

});