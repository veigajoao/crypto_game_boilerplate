import {deploy, web3, provider} from '../_deploy_script.js';

const accounts = await web3.eth.getAccounts();

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathERC20 = path.resolve(__dirname, '../../bin/contracts/token_creation', 'BananaCoin.json');
const compiledERC20 = JSON.parse(fs.readFileSync(contractPathERC20, 'utf8'));

const contractInstance = new web3.eth.Contract(
    compiledERC20.abi,
    process.env.ERC20ADDRESS
);

import prompt from 'prompt-sync';
const investor_account = prompt()('investor wallet address: ');

await contractInstance.methods.transfer(investor_account, web3.utils.toWei("3080", "ether")).send({ gas: '1000000', from: accounts[10] });

provider.engine.stop();