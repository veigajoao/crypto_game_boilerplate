import {deploy, web3, provider} from '../_deploy_script.js';

const accounts = await web3.eth.getAccounts();

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//create locked wallets
const contractPathLock = path.resolve(__dirname, '../bin/contracts/locked_wallets', 'TimeLockedWallet.json');
const compiledLock = JSON.parse(fs.readFileSync(contractPathLock, 'utf8'));

const contractAdvisors = new web3.eth.Contract(
    compiledLock.abi,
    process.env.LOCKADVISORSADDRESS
);

const contractTeam = new web3.eth.Contract(
    compiledLock.abi,
    process.env.LOCKCORETEAMADDRESS
);

const contractMkt = new web3.eth.Contract(
    compiledLock.abi,
    process.env.LOCKMARKETINGADDRESS
);

const contractPlatform = new web3.eth.Contract(
    compiledLock.abi,
    process.env.LOCKPLATFORMADDRESS
);

const contractAirdrop = new web3.eth.Contract(
    compiledLock.abi,
    process.env.LOCKAIRDROPADDRESS
);

await contractAdvisors.methods.release(process.env.ERC20ADDRESS).send({ gas: '1000000', from: accounts[0] });
await contractTeam.methods.release(process.env.ERC20ADDRESS).send({ gas: '1000000', from: accounts[0] });
await contractMkt.methods.release(process.env.ERC20ADDRESS).send({ gas: '1000000', from: accounts[0] });
await contractPlatform.methods.release(process.env.ERC20ADDRESS).send({ gas: '1000000', from: accounts[0] });
await contractAirdrop.methods.release(process.env.ERC20ADDRESS).send({ gas: '1000000', from: accounts[0] });

provider.engine.stop();