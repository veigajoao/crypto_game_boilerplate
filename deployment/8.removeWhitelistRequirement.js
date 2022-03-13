import {deploy, web3, provider} from './_deploy_script.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathWhitelist = path.resolve(__dirname, '../bin/contracts/presale', 'WhiteListedPresale.json');
const compiledWhitelist = JSON.parse(fs.readFileSync(contractPathWhitelist, 'utf8'));

const contract = new web3.eth.Contract(
    compiledWhitelist.abi,
    "0x8E0ED58bAf27CA6f8FE61317C7cf53BB37e5b00f"
  )

const accounts = await web3.eth.getAccounts();

await contract.methods.changeWhitelistRequirement(false).send({ gas: '1000000', from: accounts[0] });

//print contract locations
console.log(`Done`);

provider.engine.stop();