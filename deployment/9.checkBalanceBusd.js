import {deploy, web3, provider} from './_deploy_script.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const accounts = await web3.eth.getAccounts();

// await contract.methods.changeWhitelistRequirement(false).send({ from: accounts[0] });

const contractPathERC20 = path.resolve(__dirname, '../bin/contracts/token_creation', 'BananaCoin.json');
const compiledERC20 = JSON.parse(fs.readFileSync(contractPathERC20, 'utf8'));

const bnanaCoinAddress = "0xf9b27685bfaAF96AaedffD45DA69BF7F5d0ea07D";
const busdCoinAddress = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
const whitelistAddress = "0x8E0ED58bAf27CA6f8FE61317C7cf53BB37e5b00f";
const contract2 = new web3.eth.Contract(
    compiledERC20.abi,
    busdCoinAddress
)

console.log(accounts[0]);

console.log(web3.utils.fromWei(await contract2.methods.balanceOf(accounts[0]).call(), "ether"));


provider.engine.stop();