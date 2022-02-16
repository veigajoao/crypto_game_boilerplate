import {deploy, web3, provider} from './_deploy_script.js';

const accounts = await web3.eth.getAccounts();

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathERC20 = path.resolve(__dirname, '../bin/contracts/token_creation', 'BananaCoin.json');
const compiledERC20 = JSON.parse(fs.readFileSync(contractPathERC20, 'utf8'));

const contractInstance = new web3.eth.Contract(
    compiledERC20.abi,
    process.env.ERC20ADDRESS
);

//send funds to each account (or respective locked wallet)
await contractInstance.methods.transfer(accounts[1], web3.utils.toWei("3000000", "ether")).send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.transfer(accounts[2], web3.utils.toWei("8000000", "ether")).send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.transfer(process.env.LOCKADVISORSADDRESS, web3.utils.toWei("5000000", "ether")).send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.transfer(process.env.LOCKCORETEAMADDRESS, web3.utils.toWei("12000000", "ether")).send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.transfer(process.env.LOCKMARKETINGADDRESS, web3.utils.toWei("5000000", "ether")).send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.transfer(accounts[6], web3.utils.toWei("7000000", "ether")).send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.transfer(process.env.LOCKPLATFORMADDRESS, web3.utils.toWei("5000000", "ether")).send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.transfer(process.env.LOCKAIRDROPADDRESS, web3.utils.toWei("1000000", "ether")).send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.transfer(accounts[9], web3.utils.toWei("51000000", "ether")).send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.transfer(process.env.LOCKEARLYINVESTORS, web3.utils.toWei("3000000", "ether")).send({ gas: '1000000', from: accounts[0] });

provider.engine.stop();