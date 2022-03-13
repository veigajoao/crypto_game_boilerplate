import {deploy, web3, provider} from './_deploy_script.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

let array = fs.readFileSync('whitelist.txt').toString().split("\n");
let array2 = []
let array3 = []
let i;
for(i in array) {
    let someText = array[i].replace(/(\r\n|\n|\r)/gm, "");
    if (web3.utils.isAddress(someText)) {
        array3.push(someText)
    }
}

for (i in array3) {
    array2.push(web3.utils.toWei("5000", "ether"));
}

console.log(array3);

const bnanaCoinAddress = "0x2b644584C714beAe9A2dc9f05Cc16202461D56CA";
const busdAddress = "0x59c7d11fB3B1ebE6B4c467279c851DFF225830D4";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathWhitelist = path.resolve(__dirname, '../../bin/contracts/presale', 'WhiteListedPresale.json');
const compiledWhitelist = JSON.parse(fs.readFileSync(contractPathWhitelist, 'utf8'));


const accounts = await web3.eth.getAccounts();
const contractInstance = await deploy(compiledWhitelist, accounts[0], [
    accounts[0], bnanaCoinAddress, busdAddress, web3.utils.toWei('0.065', 'ether'),
                        web3.utils.toWei('1500', 'ether'), web3.utils.toWei('2500', 'ether'), web3.utils.toWei('5000', 'ether'),
                         array3,
                         array2, 
                         true
]);

//print contract locations
console.log(`Whitelist at ${contractInstance.options.address}`);