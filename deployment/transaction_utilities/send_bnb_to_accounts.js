import {deploy, web3, provider} from '../_deploy_script.js';

const accounts = await web3.eth.getAccounts();

await web3.eth.sendTransaction({to:accounts[0], from:accounts[10], value:web3.utils.toWei("0.001", "ether")})

provider.engine.stop();