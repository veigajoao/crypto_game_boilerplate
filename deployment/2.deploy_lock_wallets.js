import {deploy, web3, provider} from './_deploy_script.js';

const accounts = await web3.eth.getAccounts();

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//create locked wallets
const contractPathLock = path.resolve(__dirname, '../bin/contracts/locked_wallets', 'TimeLockedWallet.json');
const compiledLock = JSON.parse(fs.readFileSync(contractPathLock, 'utf8'));

// const lockedAdvisors = await deploy(compiledLock, accounts[0], [accounts[3], 6 * 30 * 24 * 60 * 60]);
// const lockedCoreteam = await deploy(compiledLock, accounts[0], [accounts[4], 12 * 30 * 24 * 60 * 60]);
// const lockedMarketing = await deploy(compiledLock, accounts[0], [accounts[5], 200 * 24 * 60 * 60]);
// const lockedPlatform = await deploy(compiledLock, accounts[0], [accounts[7], 286 * 24 * 60 * 60]);
// const lockedAirdrop = await deploy(compiledLock, accounts[0], [accounts[8], 6 * 30 * 24 * 60 * 60]);

const lockedAdvisors = await deploy(compiledLock, accounts[0], [accounts[3], 200]);
const lockedCoreteam = await deploy(compiledLock, accounts[0], [accounts[4], 200]);
const lockedMarketing = await deploy(compiledLock, accounts[0], [accounts[5], 200]);
const lockedPlatform = await deploy(compiledLock, accounts[0], [accounts[7], 200]);
const lockedAirdrop = await deploy(compiledLock, accounts[0], [accounts[8], 200]);

console.log(`lockedAdvisors at ${lockedAdvisors.options.address}`);
console.log(`lockedCoreteam at ${lockedCoreteam.options.address}`);
console.log(`lockedMarketing at ${lockedMarketing.options.address}`);
console.log(`lockedPlatform at ${lockedPlatform.options.address}`);
console.log(`lockedAirdrop at ${lockedAirdrop.options.address}`);