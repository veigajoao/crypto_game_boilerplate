const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { abi, evm } = require('../compile');

let accounts;
let bananaCoin;

beforeEach(async() => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();
    bananaCoin = await new web3.eth.Contract(abi)
        .deploy({
            data: evm.bytecode.object,
        })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('bananaCoin contract', () => {

    it('deploys a contract', () => {
        assert.ok(bananaCoin.options.address);
    });

    it('constructor() works correctly', async() => {
        const managerBalance = await bananaCoin.methods.balanceOf(accounts[0]).call();
        console.log(managerBalance);
        assert.equal(managerBalance, 5.8 * 10**6);
    });

    it('name() is set correctly', async() => {
        const coinName = await bananaCoin.methods.name().call();
        const coinSymbol = await bananaCoin.methods.symbol().call();
        assert.equal(coinName, "BananaCoin");
        assert.equal(coinSymbol, "BANCOIN");
    });

});