const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts/token_creation', 'BananaCoin.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'BananaCoin.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

console.log(JSON.parse(solc.compile(JSON.stringify(input))))

module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
    'BananaCoin.sol'
].BananaCoin;