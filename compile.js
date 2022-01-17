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

//require imported solidity code
function openzeppelinImport(folder, filename) {
    const pathFile = path.resolve(__dirname, `node_modules/@openzeppelin/contracts/${folder}`, `${filename}.sol`);
    return fs.readFileSync(pathFile, "utf8")
}

const ERC20 = openzeppelinImport("token/ERC20", "ERC20");
function findImports(path) {
    if (path === '@openzeppelin/contracts/token/ERC20/ERC20.sol')
        return {
            contents: ERC20
        };
    else return { error: 'File not found' };
}

console.log(
    JSON.parse(
        solc.compile(JSON.stringify(input), { import: findImports })
      )
);

module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts[
    'BananaCoin.sol'
].BananaCoin;