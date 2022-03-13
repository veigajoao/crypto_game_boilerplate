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

const bnanaCoinAddress = "0xf9b27685bfaAF96AaedffD45DA69BF7F5d0ea07D";
const busdAddress = "0xe9e7cea3dedca5984780bafc599bd69add087d56";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathWhitelist = path.resolve(__dirname, '../bin/contracts/presale', 'WhiteListedPresale.json');
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