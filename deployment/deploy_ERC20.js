import {deploy, web3} from './_deploy_script.js';

const accounts = await web3.eth.getAccounts();

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathERC20 = path.resolve(__dirname, '../bin/contracts/token_creation', 'BananaCoin.json');
const compiledERC20 = JSON.parse(fs.readFileSync(contractPathERC20, 'utf8'));

const contractInstance = await deploy(compiledERC20, accounts[0], []);

//create locked wallets
const contractPathLock = path.resolve(__dirname, '../bin/contracts/locked_wallets', 'TimeLockedWallet.json');
const compiledLock = JSON.parse(fs.readFileSync(contractPathLock, 'utf8'));

const lockedAdvisors = await deploy(compiledLock, accounts[0], [accounts[3], 6 * 30 * 24 * 60 * 60]);
const lockedCoreteam = await deploy(compiledLock, accounts[0], [accounts[4], 12 * 30 * 24 * 60 * 60]);
const lockedMarketing = await deploy(compiledLock, accounts[0], [accounts[5], 200 * 24 * 60 * 60]);
const lockedPlatform = await deploy(compiledLock, accounts[0], [accounts[7], 286 * 24 * 60 * 60]);
const lockedAirdrop = await deploy(compiledLock, accounts[0], [accounts[8], 6 * 30 * 24 * 60 * 60]);

//send funds to each account (or respective locked wallet)
contractInstance.methods.transfer(accounts[1], web3.utils.toWei("6000000", "ether")).send({ gas: '1000000', from: accounts[0] });
contractInstance.methods.transfer(accounts[2], web3.utils.toWei("8000000", "ether")).send({ gas: '1000000', from: accounts[0] });
contractInstance.methods.transfer(lockedAdvisors.options.address, web3.utils.toWei("5000000", "ether")).send({ gas: '1000000', from: accounts[0] });
contractInstance.methods.transfer(lockedCoreteam.options.address, web3.utils.toWei("12000000", "ether")).send({ gas: '1000000', from: accounts[0] });
contractInstance.methods.transfer(lockedMarketing.options.address, web3.utils.toWei("5000000", "ether")).send({ gas: '1000000', from: accounts[0] });
contractInstance.methods.transfer(accounts[6], web3.utils.toWei("7000000", "ether")).send({ gas: '1000000', from: accounts[0] });
contractInstance.methods.transfer(lockedPlatform.options.address, web3.utils.toWei("5000000", "ether")).send({ gas: '1000000', from: accounts[0] });
contractInstance.methods.transfer(lockedAirdrop.options.address, web3.utils.toWei("1000000", "ether")).send({ gas: '1000000', from: accounts[0] });
contractInstance.methods.transfer(accounts[9], web3.utils.toWei("51000000", "ether")).send({ gas: '1000000', from: accounts[0] });

//print contract locations
console.log(`ERC-20 at ${contractInstance.options.address}`);
console.log(`lockedAdvisors at ${lockedAdvisors.options.address}`);
console.log(`lockedCoreteam at ${lockedCoreteam.options.address}`);
console.log(`lockedMarketing at ${lockedMarketing.options.address}`);
console.log(`lockedPlatform at ${lockedPlatform.options.address}`);
console.log(`lockedAirdrop at ${lockedAirdrop.options.address}`);