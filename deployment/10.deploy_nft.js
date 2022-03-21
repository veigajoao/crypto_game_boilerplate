import {deploy, web3, provider} from './_deploy_script.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathERC721 = path.resolve(__dirname, '../bin/contracts/nft_creation', 'CryptoMonkeyChars.json');
const compiledERC721 = JSON.parse(fs.readFileSync(contractPathERC721, 'utf8'));

const accounts = await web3.eth.getAccounts();

const contractInstance = await deploy(compiledERC721, accounts[0], 
    [process.env.ERC20ADDRESS, "1", "1", "1", web3.utils.toWei("3000", "ether"), "https://cryptomonkeys.me/"]
);

//print contract locations
console.log(`ERC-721 at ${contractInstance.options.address}`);