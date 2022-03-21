import {deploy, web3, provider} from '../_deploy_script.js';

const accounts = await web3.eth.getAccounts();

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

//generate fake accounts
import HDWalletProvider from '@truffle/hdwallet-provider';
import Web3 from 'web3';

const fakeProvider = new HDWalletProvider(
    {
      mnemonic: {
        phrase: "actor worry fringe odor bulk exhibit exist echo fix asset inquiry harsh sketch tired stomach",
      },
      providerOrUrl: process.env.RPC_ENDPOINT,
      numberOfAddresses: 300,
    }
  );
const fakeWeb3 = new Web3(fakeProvider);
const fakeAccounts = await fakeWeb3.eth.getAccounts();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathERC20 = path.resolve(__dirname, '../../bin/contracts/token_creation', 'BananaCoin.json');
const compiledERC20 = JSON.parse(fs.readFileSync(contractPathERC20, 'utf8'));

const contractInstance = new web3.eth.Contract(
    compiledERC20.abi,
    process.env.ERC20ADDRESS
);


const bnana_ammount = "1500";
for (let investor_account of fakeAccounts) {
    await contractInstance.methods.transfer(investor_account, web3.utils.toWei(bnana_ammount, "ether")).send({ gas: '1000000', from: accounts[0] });
    console.log(investor_account);
}

provider.engine.stop();