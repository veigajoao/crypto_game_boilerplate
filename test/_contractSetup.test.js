import ganache from 'ganache-cli';
import Web3 from 'web3';

import BigNumber from 'bignumber.js';
BigNumber.config({ DECIMAL_PLACES: 3 })

const options = { gasLimit: 10000000 };
const web3 = new Web3(ganache.provider(options));

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const contractPathTesting = path.resolve(__dirname, '../bin/contracts/testing', 'Testing.json');
const testingCompile = JSON.parse(fs.readFileSync(contractPathTesting, 'utf8'));
const abiTesting = testingCompile.abi;
const bytecodeTeting = testingCompile.bytecode;

const contractPathLock = path.resolve(__dirname, '../bin/contracts/locked_wallets', 'TimeLockedWallet.json');
const lockCompile = JSON.parse(fs.readFileSync(contractPathLock, 'utf8'));
const abiLock = lockCompile.abi;
const bytecodeLock = lockCompile.bytecode;

//deploy contracts
let accounts;
let nftCreation;
let bananaCoin;
let gameContract;
let testContract;

let mintCost1 = web3.utils.toWei("100", 'ether');
let mintCost2 = web3.utils.toWei("250", 'ether');
let mintCost3 = web3.utils.toWei("400", 'ether');
let upgradeCost = web3.utils.toWei('450', 'ether');
let baseURI = 'https://gateway.pinata.cloud/ipfs/Qmb86L8mUphwJGzLPwXNTRiK1S4scBdj9cc2Sev3s8uLiB';

let baseSalary0 = ["3.84", "4.00", "4.16", "4.34", "4.76", "5.155", "5.55", "6.66", "9.2", "11.86", "14.28"];
let baseSalary1 = baseSalary0.map((item) => {
    return BigNumber(item).dividedBy("3");
});
let baseSalary = baseSalary1.map((item) => {
    return web3.utils.toWei(item.toString(), "ether");
});
let upgradedSalaryMultiplier = "2";
let upgradedSalary = baseSalary1.map((item) => {
    return web3.utils.toWei(item.multipliedBy(upgradedSalaryMultiplier).toString(), 'ether');
});
let withdrawalTime = 60 * 60 * 24 * 7;
let withdrawalLoss = 70

before(async function () {
    this.timeout(15000);
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    //deploy ERC20 token
    const deployCostEstBanana = await new web3.eth.Contract(abiBanana)
    .deploy({
        data: bytecodeBanana,
    }).estimateGas();

    console.log("ERC20 estimated gas need is: " + deployCostEstBanana);
    bananaCoin = await new web3.eth.Contract(abiBanana)
        .deploy({
            data: bytecodeBanana,
        })
        .send({ from: accounts[0], gas: '1000000' });
    
    //deploy ERC721 nft
    const deployCostNft = await new web3.eth.Contract(abi)
    .deploy({
        data: bytecode,
        arguments: [bananaCoin.options.address, mintCost1, mintCost2, mintCost3, upgradeCost, baseURI]
    }).estimateGas();

    console.log("ERC721 estimated gas need is: " + deployCostNft);

    nftCreation = await new web3.eth.Contract(abi)
        .deploy({
            data: bytecode,
            arguments: [bananaCoin.options.address, mintCost1, mintCost2, mintCost3, upgradeCost, baseURI]
        })
        .send({ from: accounts[0], gas: '10000000' });

    //deploy game contract
    const deployCostGame = await new web3.eth.Contract(abiGame)
    .deploy({
        data: bytecodeGame,
        arguments: [accounts[2], bananaCoin.options.address, nftCreation.options.address, 60 * 60 * 8,
                        baseSalary, upgradedSalary, withdrawalTime, withdrawalLoss]
    }).estimateGas();

    console.log("game contract estimated gas need is: " + deployCostGame);

    gameContract = await new web3.eth.Contract(abiGame)
        .deploy({
            data: bytecodeGame,
            arguments: [accounts[2], bananaCoin.options.address, nftCreation.options.address, 60 * 60 * 8,
                        baseSalary, upgradedSalary, withdrawalTime, withdrawalLoss]
        })
        .send({ from: accounts[0], gas: '5000000' });

    //deploy auxiliary testing contract
    testContract = await new web3.eth.Contract(abiTesting)
        .deploy({
            data: bytecodeTeting,
        })
        .send({ from: accounts[0], gas: '5000000' });
});

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

const timeTravelFull = async function(time) {
    await timeTravel(time);
    await mineBlock();
}

export {web3, accounts, nftCreation, bananaCoin, gameContract, testContract, mintCost1,
     mintCost2, mintCost3, upgradeCost, baseURI, baseSalary, upgradedSalaryMultiplier, 
     upgradedSalary, withdrawalTime, withdrawalLoss, abiLock, bytecodeLock, timeTravelFull}