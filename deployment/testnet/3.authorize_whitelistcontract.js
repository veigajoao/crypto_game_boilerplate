import {deploy, web3, provider} from './_deploy_script.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathERC20 = path.resolve(__dirname, '../../bin/contracts/token_creation', 'BananaCoin.json');
const compiledERC20 = JSON.parse(fs.readFileSync(contractPathERC20, 'utf8'));

const contract = new web3.eth.Contract(
    compiledERC20.abi,
    "0x2b644584C714beAe9A2dc9f05Cc16202461D56CA"
  )

const accounts = await web3.eth.getAccounts();

await contract.methods.approve("0x4Dd4835fceD7679792D5191C4446726Db1Ff1900", web3.utils.toWei("3000000", "ether")).send({
    from: accounts[0]
});

//print contract locations
console.log(`Done`);