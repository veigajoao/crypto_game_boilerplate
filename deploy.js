const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, evm } = require('./compile');

const provider = new HDWalletProvider(
    'neglect hospital farm response exhibit announce subway chunk chair situate stadium modify',
    'https://rinkeby.infura.io/v3/90a441c0f41a40ea8bc1c0c0462559b3'
);

const web3 = new Web3(provider);

const deploy = async _ => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy contract from account', accounts[0]);

    const result = await new web3.eth.Contract(abi)
    .deploy({
        data: evm.bytecode.object,
    })
    .send({ from: accounts[0], gas: '1000000' });

    console.log(JSON.stringify(abi));
    console.log('Contract deployed to', result.options.address);
    provider.engine.stop();
}

deploy();