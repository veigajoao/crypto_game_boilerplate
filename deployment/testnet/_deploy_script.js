import dotenv from 'dotenv';
import prompt from 'prompt-sync';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: path.resolve(__dirname, '../prod_env') })
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import HDWalletProvider from '@truffle/hdwallet-provider';
import Web3 from 'web3';

// const password = prompt()('password: ');

const provider = new HDWalletProvider(
  {
    mnemonic: {
      phrase: process.env.MNEMONIC,
      // password: password,
    },
    providerOrUrl: process.env.RPC_ENDPOINT,
    numberOfAddresses: 100,
  }
);
const web3 = new Web3(provider);

const deploy = async (compiledData, accountInUse, constructorArguments) => {
  
  try {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accountInUse);

    const result = await new web3.eth.Contract(
      compiledData.abi
    )
      .deploy({ 
        data: compiledData.bytecode,
        arguments: constructorArguments
      })
      .send({ gas: '10000000', from: accountInUse });

    console.log('Contract deployed to', result.options.address);
    provider.engine.stop();

    const contractInstance = new web3.eth.Contract(
      compiledData.abi,
      result.options.address
    );

    return contractInstance
  } catch (error) {
    console.log(error);
  }
  
};

export {deploy, web3, provider};