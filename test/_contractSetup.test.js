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

//deploy contracts
let accounts;
let nftCreation;
let bananaCoin;
let gameContract;

let mintCost1 = web3.utils.toWei("100", 'ether');
let mintCost2 = web3.utils.toWei("250", 'ether');
let mintCost3 = web3.utils.toWei("400", 'ether');
let upgradeCost = web3.utils.toWei('450', 'ether');
let baseURI = 'https://gateway.pinata.cloud/ipfs/Qmb86L8mUphwJGzLPwXNTRiK1S4scBdj9cc2Sev3s8uLiB';

let baseSalary0 = ["3.84", "3.965", "4.09", "4.215", "4.34", "4.76", "5.023", "5.286", "5.55", "6.66", "8.33", "10", "12.14", "14.28"];
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
                        baseSalary, upgradedSalary]
    }).estimateGas();

    console.log("game contract estimated gas need is: " + deployCostGame);

    gameContract = await new web3.eth.Contract(abiGame)
        .deploy({
            data: bytecodeGame,
            arguments: [accounts[2], bananaCoin.options.address, nftCreation.options.address, 60 * 60 * 8,
                        baseSalary, upgradedSalary]
        })
        .send({ from: accounts[0], gas: '5000000' });
});


export {web3, accounts, nftCreation, bananaCoin, gameContract, mintCost1,
     mintCost2, mintCost3, upgradeCost, baseURI, baseSalary, upgradedSalaryMultiplier, upgradedSalary}