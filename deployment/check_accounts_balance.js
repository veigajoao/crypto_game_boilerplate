import {deploy, web3, provider} from './_deploy_script.js';

const accounts = await web3.eth.getAccounts();

console.log(accounts[0], ":",  web3.utils.fromWei(await web3.eth.getBalance(accounts[0])));
console.log(accounts[1], ":",  web3.utils.fromWei(await web3.eth.getBalance(accounts[1])));
console.log(accounts[2], ":",  web3.utils.fromWei(await web3.eth.getBalance(accounts[2])));
console.log(accounts[3], ":",  web3.utils.fromWei(await web3.eth.getBalance(accounts[3])));
console.log(accounts[4], ":",  web3.utils.fromWei(await web3.eth.getBalance(accounts[4])));
console.log(accounts[5], ":",  web3.utils.fromWei(await web3.eth.getBalance(accounts[5])));
console.log(accounts[6], ":",  web3.utils.fromWei(await web3.eth.getBalance(accounts[6])));
console.log(accounts[7], ":",  web3.utils.fromWei(await web3.eth.getBalance(accounts[7])));
console.log(accounts[8], ":",  web3.utils.fromWei(await web3.eth.getBalance(accounts[8])));
console.log(accounts[9], ":",  web3.utils.fromWei(await web3.eth.getBalance(accounts[9])));
console.log(accounts[10], ":",  web3.utils.fromWei(await web3.eth.getBalance(accounts[10])));

provider.engine.stop();