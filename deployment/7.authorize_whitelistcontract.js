import {deploy, web3, provider} from './_deploy_script.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathERC20 = path.resolve(__dirname, '../bin/contracts/token_creation', 'BananaCoin.json');
const compiledERC20 = JSON.parse(fs.readFileSync(contractPathERC20, 'utf8'));

const bnanaCoinAddress = "0xf9b27685bfaAF96AaedffD45DA69BF7F5d0ea07D";
const whitelistAddress = "0x8E0ED58bAf27CA6f8FE61317C7cf53BB37e5b00f";
const contract = new web3.eth.Contract(
    compiledERC20.abi,
    bnanaCoinAddress
  )

const accounts = await web3.eth.getAccounts();

console.log(await contract.methods.approve(whitelistAddress, web3.utils.toWei("3000000", "ether")).send({
    from: accounts[0]
}));

//print contract locations
console.log(`Done`);
provider.engine.stop();