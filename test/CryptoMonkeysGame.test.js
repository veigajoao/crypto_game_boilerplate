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

describe('CryptoMonkeyChars contract', () => {

    it('deploys a contract', () => {
        assert.ok(gameContract.options.address);
    });

    

});