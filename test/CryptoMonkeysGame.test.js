import {web3, accounts, nftCreation, bananaCoin, gameContract, testContract, mintCost1,
    mintCost2, mintCost3, upgradeCost, baseURI, baseSalary, upgradedSalaryMultiplier, 
    upgradedSalary, withdrawalTime, withdrawalLoss} from './_contractSetup.test.js';

import BigNumber from 'bignumber.js';
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
 
        const nftTokenId = await nftCreation.methods.tokenOfOwnerByIndex(accounts[0], 0).call();
        const nftAttr = await nftCreation.methods.tokensAttributes(nftTokenId).call();
        const nftType = nftAttr.monkeyType;
        const nftSalary = await gameContract.methods.baseSalary(nftType).call();
        
        //get lastMiningMapping and balances before mining
        const lastMiningMapping0 = await gameContract.methods.getLastMiningMapping(nftTokenId).call();
        const userBalance = await gameContract.methods.userBalance(accounts[0]).call();

        //run game once
        await gameContract.methods.baseMining(nftTokenId).send({ from: accounts[0], gas: "5000000" });

        //get lastMiningMapping and balances after mining
        const lastMiningMapping1 = await gameContract.methods.getLastMiningMapping(nftTokenId).call();
        const userBalance1 = await gameContract.methods.userBalance(accounts[0]).call();

        assert.equal(lastMiningMapping0, 0);
        assert.notEqual(lastMiningMapping0, lastMiningMapping1);
        assert.equal(parseFloat(userBalance1), parseFloat(userBalance) + parseFloat(nftSalary) );
        
        //doesn't allow new minings until timeout
        const assertionFunc = async() => {
            await gameContract.methods.baseMining(nftTokenId).send({ from: accounts[0], gas: "5000000" });
        };
        assert.rejects(assertionFunc);

        //rerun with new nft
        const nftTokenId1 = await nftCreation.methods.tokenOfOwnerByIndex(accounts[0], 1).call();
        const nftAttr1 = await nftCreation.methods.tokensAttributes(nftTokenId1).call();
        const nftType1 = nftAttr1.monkeyType;
        const nftSalary1 = await gameContract.methods.baseSalary(nftType1).call();
        
        //get lastMiningMapping and balances before mining
        const lastMiningMapping10 = await gameContract.methods.getLastMiningMapping(nftTokenId1).call();
        const userBalance10 = await gameContract.methods.userBalance(accounts[0]).call();

        //run game once
        await gameContract.methods.baseMining(nftTokenId1).send({ from: accounts[0], gas: "5000000" });

        //get lastMiningMapping and balances after mining
        const lastMiningMapping11 = await gameContract.methods.getLastMiningMapping(nftTokenId1).call();
        const userBalance11 = await gameContract.methods.userBalance(accounts[0]).call();

        assert.equal(lastMiningMapping10, 0);
        assert.notEqual(lastMiningMapping10, lastMiningMapping11);
        assert.equal(parseFloat(userBalance11), parseFloat(userBalance10) + parseFloat(nftSalary1) );

        
    }).timeout(5000);

    it('baseMining() doesn`t allow use of other people`s chars', async() => {

        const nftTokenId = await nftCreation.methods.tokenOfOwnerByIndex(accounts[0], 0).call();

        //run game once
        const assertionFunc = async() => {
            await gameContract.methods.baseMining(nftTokenId).send({ from: accounts[1], gas: "5000000" });
        };
        assert.rejects(assertionFunc);

    });

    it('level2Mining() works correctly', async() => {
 
        const nftTokenId = await nftCreation.methods.tokenOfOwnerByIndex(accounts[0], 2).call();
        const nftAttr = await nftCreation.methods.tokensAttributes(nftTokenId).call();
        const nftType = nftAttr.monkeyType;
        const nftSalary = await gameContract.methods.upgradedSalary(nftType).call();
        
        //get lastMiningMapping and balances before mining
        const lastMiningMapping0 = await gameContract.methods.getLastMiningMapping(nftTokenId).call();
        const userBalance = await gameContract.methods.userBalance(accounts[0]).call();

        //run game once
        await gameContract.methods.level2Mining(nftTokenId).send({ from: accounts[0], gas: "5000000" });

        //get lastMiningMapping and balances after mining
        const lastMiningMapping1 = await gameContract.methods.getLastMiningMapping(nftTokenId).call();
        const userBalance1 = await gameContract.methods.userBalance(accounts[0]).call();

        assert.equal(lastMiningMapping0, 0);
        assert.notEqual(lastMiningMapping0, lastMiningMapping1);
        assert.equal(parseFloat(userBalance1), parseFloat(userBalance) + parseFloat(nftSalary) );
        
        //doesn't allow new minings until timeout
        const assertionFunc = async() => {
            await gameContract.methods.baseMining(nftTokenId).send({ from: accounts[0], gas: "5000000" });
        };
        assert.rejects(assertionFunc);
        
    }).timeout(5000);

    it('level2Mining() doesn`t allow use of other people`s chars', async() => {

        const nftTokenId = await nftCreation.methods.tokenOfOwnerByIndex(accounts[0], 0).call();

        //run game once
        const assertionFunc = async() => {
            await gameContract.methods.level2Mining(nftTokenId).send({ from: accounts[1], gas: "5000000" });
        };
        assert.rejects(assertionFunc);

    });

    it('getAvailableBalance() works correctly', async () => {
        const userBalance = await gameContract.methods.userBalance(accounts[0]).call();
        const userAvailableBalance = await gameContract.methods.getAvailableBalance(accounts[0]).call();

        assert.notEqual(userBalance, userAvailableBalance);

    });

    it('_getUserWithdrawalTerms() and getAvailableBalance() work correctly', async () => {

        //functions to time machine test blockchain
        const timeTravel = function (time) {
            return new Promise((resolve, reject) => {
              web3.currentProvider.sendAsync({
                jsonrpc: "2.0",
                method: "evm_increaseTime",
                params: [time], // 86400 is num seconds in day
                id: new Date().getTime()
              }, (err, result) => {
                if(err){
                    console.log(err);
                    return reject(err) 
                }
                return resolve(result)
              });
            })
        }
        
        const mineBlock = function () {
            return new Promise((resolve, reject) => {
                web3.currentProvider.sendAsync({
                jsonrpc: "2.0",
                method: "evm_mine",
                params: [],
                id: new Date().getTime()
                }, (err, result) => {
                if(err){
                    console.log(err);
                    return reject(err) 
                }
                return resolve(result)
                });
            })
        }

        const userAvailableBalance0 = await gameContract.methods.getAvailableBalance(accounts[0]).call();
        const userFullBalance0 = await gameContract.methods.userBalance(accounts[0]).call();
        const balanceRatio0 = userAvailableBalance0/userFullBalance0;

        //pass time

        const elapsedTime1 = withdrawalTime * 0.5;
        await timeTravel(elapsedTime1);
        await mineBlock();

        //check new available balance
        const userAvailableBalance1 = await gameContract.methods.getAvailableBalance(accounts[0]).call();
        const userFullBalance1 = await gameContract.methods.userBalance(accounts[0]).call();
        const balanceRatio1 = userAvailableBalance1/userFullBalance1;

        //pass time 2

        const elapsedTime2 = withdrawalTime * 0.5;
        await timeTravel(elapsedTime2);
        await mineBlock();

        //check new available balance
        const userAvailableBalance2 = await gameContract.methods.getAvailableBalance(accounts[0]).call();
        const userFullBalance2 = await gameContract.methods.userBalance(accounts[0]).call();
        const balanceRatio2 = userAvailableBalance2/userFullBalance2;

        //asert that at time zero, user can withdrawal only 30%
        assert(balanceRatio0 > (100 - withdrawalLoss)/100 );
        assert(balanceRatio0 < (100 - withdrawalLoss + 1)/100 );

        //asert that at time 1, user can withdrawal only 30% + elapsed time
        assert(balanceRatio1 > (100 - withdrawalLoss)/100 + (withdrawalLoss/100) * (elapsedTime1/withdrawalTime) );
        assert(balanceRatio1 < (100 - withdrawalLoss + 1)/100 + (withdrawalLoss/100) * (elapsedTime1/withdrawalTime) );

        //asert that at time 2, user can withdrawal full balance
        assert.equal(balanceRatio2, 1);

    }).timeout(10000);

    it('withdrawalUserBalance() works correctly', async () => {

        //authorize contract to send funds from accounts[2]
        const transferAmount = web3.utils.toWei("51000000", 'ether');
        await bananaCoin.methods.transfer(accounts[2], transferAmount).send({
            from: accounts[0]
        });
        await bananaCoin.methods.approve(gameContract.options.address, transferAmount).send({
            from: accounts[2]
        });

        //check available balance
        const contractWalletBalance0 = await bananaCoin.methods.balanceOf(accounts[2]).call();
        const userWalletBalance0 = await bananaCoin.methods.balanceOf(accounts[0]).call();

        //send over to wallet
        await gameContract.methods.withdrawalUserBalance().send({
            from: accounts[0], gas: "1000000"
        });

        //check wallet = accountBalance + balance0
        const contractWalletBalance1 = await bananaCoin.methods.balanceOf(accounts[2]).call();
        const userWalletBalance1 = await bananaCoin.methods.balanceOf(accounts[0]).call();
        
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
        await gameContract.methods.setSalaries(
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ).send({ from: accounts[0], gas: "5000000" });
        await gameContract.methods.setWithdrawal('100', '20').send({ from: accounts[0] });


        const sourceWallet = await gameContract.methods.ERC20TokenSourceWallet().call();
        const waitPeriod = await gameContract.methods.waitPeriod().call();
        const tokenAddress = await gameContract.methods.tokenAddress().call();
        const nftAddress = await gameContract.methods.nftAddress().call();
        const baseSalary = await gameContract.methods.baseSalary(1).call();
        const upgradedSalary = await gameContract.methods.upgradedSalary(1).call();
        const withdrawalTime = await gameContract.methods.withdrawalTime().call();
        const withdrawalLoss = await gameContract.methods.withdrawalLoss().call();
        
        assert.equal(sourceWallet, accounts[8]);
        assert.equal(waitPeriod,"10");
        assert.equal(tokenAddress, accounts[7]);
        assert.equal(nftAddress, accounts[6]);
        assert.equal(baseSalary, "0");
        assert.equal(upgradedSalary, "0");
        assert.equal(withdrawalTime, "100");
        assert.equal(withdrawalLoss, "20");
        
    }).timeout(10000);

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
        const assertionFunc4 = async() => {
            await gameContract.methods.setSalaries(
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ).send({ from: accounts[1], gas: "5000000" });
        };
        const assertionFunc5 = async() => {
            await gameContract.methods.setWithdrawal('100', '20').send({ from: accounts[1] });
        };

        assert.rejects(assertionFunc0);
        assert.rejects(assertionFunc1);
        assert.rejects(assertionFunc2);
        assert.rejects(assertionFunc3);
        assert.rejects(assertionFunc4);
        assert.rejects(assertionFunc5);
    });

});