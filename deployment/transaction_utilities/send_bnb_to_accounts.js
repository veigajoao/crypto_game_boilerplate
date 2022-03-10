import {deploy, web3, provider} from '../_deploy_script.js';

const accounts = await web3.eth.getAccounts();

web3.eth.sendTransaction({to:accounts[10], from:accounts[0], value:web3.utils.toWei("0.0001", "ether")})

provider.engine.stop();