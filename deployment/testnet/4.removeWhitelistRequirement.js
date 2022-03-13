import {deploy, web3, provider} from './_deploy_script.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathWhitelist = path.resolve(__dirname, '../../bin/contracts/presale', 'WhiteListedPresale.json');
const compiledWhitelist = JSON.parse(fs.readFileSync(contractPathWhitelist, 'utf8'));

const contract = new web3.eth.Contract(
    compiledWhitelist.abi,
    "0x4Dd4835fceD7679792D5191C4446726Db1Ff1900"
  )

const accounts = await web3.eth.getAccounts();

await contract.methods.changeWhitelistRequirement(false).send({ gas: '1000000', from: accounts[0] });

//print contract locations
console.log(`Done`);

provider.engine.stop();