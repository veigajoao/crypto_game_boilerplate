import {deploy, web3, provider} from './_deploy_script.js';



import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathERC20 = path.resolve(__dirname, '../bin/contracts/token_creation', 'BananaCoin.json');
const compiledERC20 = JSON.parse(fs.readFileSync(contractPathERC20, 'utf8'));


const accounts = await web3.eth.getAccounts();
const contractInstance = await deploy(compiledERC20, accounts[0], []);

//create locked wallets
const contractPathLock = path.resolve(__dirname, '../bin/contracts/locked_wallets', 'TimeLockedWallet.json');
const compiledLock = JSON.parse(fs.readFileSync(contractPathLock, 'utf8'));

//print contract locations
console.log(`ERC-20 at ${contractInstance.options.address}`);