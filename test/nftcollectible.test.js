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

let accounts;
let nftCreation;

beforeEach(async() => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();
    nftCreation = await new web3.eth.Contract(abi)
        .deploy({
            data: bytecode,
        })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('CryptoMonkeyChars contract', () => {

    it('deploys a contract', () => {
        assert.ok(nftCreation.options.address);
    });

    it('constructor() works correctly', async() => {
        const managerBalance = await nftCreation.methods.balanceOf(accounts[0]).call();
        assert.equal(managerBalance, 5.8 * 10**6);
    });

    it('name() is set correctly', async() => {
        const coinName = await nftCreation.methods.name().call();
        const coinSymbol = await nftCreation.methods.symbol().call();
        assert.equal(coinName, "BananaCoin");
        assert.equal(coinSymbol, "BANCOIN");
    });

    it('can transfer funds between accounts', async() => {

        const transferAmount = 10000;

        const balance0_0 = parseInt(await nftCreation.methods.balanceOf(accounts[0]).call());
        const balance1_0 = parseInt(await nftCreation.methods.balanceOf(accounts[1]).call());

        await nftCreation.methods.transfer(accounts[1], transferAmount).send({
            from: accounts[0]
        });

        const balance0_1 = parseInt(await nftCreation.methods.balanceOf(accounts[0]).call());
        const balance1_1 = parseInt(await nftCreation.methods.balanceOf(accounts[1]).call());

        assert.equal(balance0_0 - transferAmount, balance0_1);
        assert.equal(balance1_0 + transferAmount, balance1_1);
        assert.equal(balance1_0 + balance0_0, balance1_1 + balance0_1);

    });

    it('can provide allowance to other apps', async() => {

        const transferAmount = 10000;

        const balance0_0 = parseInt(await nftCreation.methods.balanceOf(accounts[0]).call());
        const balance1_0 = parseInt(await nftCreation.methods.balanceOf(accounts[1]).call());

        await nftCreation.methods.approve(accounts[1], transferAmount).send({
            from: accounts[0]
        });

        const allowanceValue = parseInt(await nftCreation.methods.allowance(accounts[0], accounts[1]).call());

        await nftCreation.methods.transferFrom(accounts[0], accounts[1], transferAmount).send({
            from: accounts[1]
        });

        const balance0_1 = parseInt(await nftCreation.methods.balanceOf(accounts[0]).call());
        const balance1_1 = parseInt(await nftCreation.methods.balanceOf(accounts[1]).call());

        const allowanceValue2 = parseInt(await nftCreation.methods.allowance(accounts[0], accounts[1]).call());

        assert.equal(allowanceValue, transferAmount);
        assert.equal(balance0_0 - transferAmount, balance0_1);
        assert.equal(balance1_0 + transferAmount, balance1_1);
        assert.equal(balance1_0 + balance0_0, balance1_1 + balance0_1);

    });

});