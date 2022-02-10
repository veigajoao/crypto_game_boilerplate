import {deploy, web3, provider} from './_deploy_script.js';

const accounts = await web3.eth.getAccounts();

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//create locked wallets
const contractPathnft = path.resolve(__dirname, '../bin/contracts/nft_creation', 'CryptoMonkeyChars.json');
const compiledNft = JSON.parse(fs.readFileSync(contractPathnft, 'utf8'));

const contractInstance = await deploy(compiledNft, accounts[0], [process.env.ERC20ADDRESS, "100", "200", "300", "350", "https://cryptomonkeys.me"]);

console.log(`ERC-721 at ${contractInstance.options.address}`);