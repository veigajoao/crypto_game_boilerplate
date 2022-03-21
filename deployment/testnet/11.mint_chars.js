import {deploy, web3, provider} from './_deploy_script.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractPathERC721 = path.resolve(__dirname, '../../bin/contracts/nft_creation', 'CryptoMonkeyChars.json');
const compiledERC721 = JSON.parse(fs.readFileSync(contractPathERC721, 'utf8'));

const accounts = await web3.eth.getAccounts();

const contractInstance = new web3.eth.Contract(
    compiledERC721.abi,
    process.env.ERC721ADDRESS
);

const contractPathERC20 = path.resolve(__dirname, '../../bin/contracts/token_creation', 'BananaCoin.json');
const compiledERC20 = JSON.parse(fs.readFileSync(contractPathERC20, 'utf8'));

const contract = new web3.eth.Contract(
    compiledERC20.abi,
    process.env.ERC20ADDRESS
);
await contract.methods.approve(contractInstance.options.address, web3.utils.toWei("3000000", "ether")).send({
    from: accounts[0]
});


await contractInstance.methods.mintNft("0x939A426CA763C301C1D7C20141944D7A3C0b5f97", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x939A426CA763C301C1D7C20141944D7A3C0b5f97", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xCd8E38167ed5fDEafC2d7293578b0C383981058d", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x1389Fcdf1A19517734171832DEBb7aF5991B53fd", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x1389Fcdf1A19517734171832DEBb7aF5991B53fd", "3").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xeeaEaAC1766c05F676bE667BfeD71473725F900A", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xeeaEaAC1766c05F676bE667BfeD71473725F900A", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xDd87261c355dBDc93cab9A893A4242b3239faA4e", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xDd87261c355dBDc93cab9A893A4242b3239faA4e", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x9B5DECf170fF1EDE00F947A635aCaaa493a6844E", "2").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xCfD4E3f3A3471d0c770a4EC2A2486b6F365F02a0", "2").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xa17FdE3DcdB1832d6C5ac3831eCf86aB117E3E9D", "2").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xa17FdE3DcdB1832d6C5ac3831eCf86aB117E3E9D", "2").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xCAA1A8bbE745A87F75A44469b6C435ba68aC9Ba1", "3").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xCAA1A8bbE745A87F75A44469b6C435ba68aC9Ba1", "3").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xCAA1A8bbE745A87F75A44469b6C435ba68aC9Ba1", "2").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xCAA1A8bbE745A87F75A44469b6C435ba68aC9Ba1", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xf26a71BF6e9c65E42371A47574929f4101C18cD7", "3").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xf26a71BF6e9c65E42371A47574929f4101C18cD7", "3").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xf26a71BF6e9c65E42371A47574929f4101C18cD7", "3").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x53bc8FF54Af6e17A773B72d676d604327e34E769", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x9Cb6710cf0fF87486b237338C11CCCA370293d85", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x72c6177569d33c02857EF59D9E2162a71b52a81e", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xcAf491c82626EC2E56FCdef51588e612b4D5a4fA", "3").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xcAf491c82626EC2E56FCdef51588e612b4D5a4fA", "2").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xcAf491c82626EC2E56FCdef51588e612b4D5a4fA", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x83B229E578dCca30FA9F8633a05861cF0334d7C4", "3").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x83B229E578dCca30FA9F8633a05861cF0334d7C4", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xbEfE22f881B9E3ff41F64980C3E578A8C85F0581", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xbEfE22f881B9E3ff41F64980C3E578A8C85F0581", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xbEfE22f881B9E3ff41F64980C3E578A8C85F0581", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xbEfE22f881B9E3ff41F64980C3E578A8C85F0581", "2").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x14599a1DB9A0C26E5d1ACB93D670A8E112107e47", "3").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x14599a1DB9A0C26E5d1ACB93D670A8E112107e47", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xBAd16E952E47f707Fabc8937fC12406FFeeA0168", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xBAd16E952E47f707Fabc8937fC12406FFeeA0168", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xBAd16E952E47f707Fabc8937fC12406FFeeA0168", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x62Ad7070d5B0dd80fF0831Db67f859e47053a00A", "3").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x62Ad7070d5B0dd80fF0831Db67f859e47053a00A", "2").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x62Ad7070d5B0dd80fF0831Db67f859e47053a00A", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x62Ad7070d5B0dd80fF0831Db67f859e47053a00A", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x62Ad7070d5B0dd80fF0831Db67f859e47053a00A", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x62Ad7070d5B0dd80fF0831Db67f859e47053a00A", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x750C82880487f6A2281E81dA92dD8B388189FC47", "2").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x750C82880487f6A2281E81dA92dD8B388189FC47", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x750C82880487f6A2281E81dA92dD8B388189FC47", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x750C82880487f6A2281E81dA92dD8B388189FC47", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xCd8E38167ed5fDEafC2d7293578b0C383981058d", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xCd8E38167ed5fDEafC2d7293578b0C383981058d", "2").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xAEb495d8DFD59bB773F057ae1fD289A47712eCeA", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xAEb495d8DFD59bB773F057ae1fD289A47712eCeA", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x5e4cb298C7ED72796D4e5e76aE7B33f3C158E809", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x5e4cb298C7ED72796D4e5e76aE7B33f3C158E809", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xB8983B35dE2eFb2D9AfEC05Db64E4d086BEC0D09", "3").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xB8983B35dE2eFb2D9AfEC05Db64E4d086BEC0D09", "3").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xB8983B35dE2eFb2D9AfEC05Db64E4d086BEC0D09", "2").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xB8983B35dE2eFb2D9AfEC05Db64E4d086BEC0D09", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xcB873238Eb6fd2B857c1379ADcB107082cffBc4F", "3").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xcB873238Eb6fd2B857c1379ADcB107082cffBc4F", "2").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xcB873238Eb6fd2B857c1379ADcB107082cffBc4F", "2").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xcB873238Eb6fd2B857c1379ADcB107082cffBc4F", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x9AD843323763BC0283d067D965b77F97a44f4F53", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x9AD843323763BC0283d067D965b77F97a44f4F53", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x643dD22b794a9e99688e880733BF73812B4fE422", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xbEC0037a35E4B1cE2B8a4D5629dc19F3399C65df", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x4C74280b5Ff168996C1818B7D5A9b9293e8D5042", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x7Cbe665D3EF0391D95e68313782513eDA7e0d19e", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x9d1e10d2AA7eDB5b24647c07BdE5777d587f75dB", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x9d1e10d2AA7eDB5b24647c07BdE5777d587f75dB", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x9d1e10d2AA7eDB5b24647c07BdE5777d587f75dB", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0xcC4BECb7d3C3b362a7f1A61B77D4f1D88D0a9d0f", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0xcC4BECb7d3C3b362a7f1A61B77D4f1D88D0a9d0f", "1").send({ gas: '1000000', from: accounts[0] });

await contractInstance.methods.mintNft("0x7c690C36eA0c79C89Bd3c14Aa9ae6cAEeE09c184", "1").send({ gas: '1000000', from: accounts[0] });
await contractInstance.methods.mintNft("0x7c690C36eA0c79C89Bd3c14Aa9ae6cAEeE09c184", "1").send({ gas: '1000000', from: accounts[0] });

//print contract locations
provider.engine.stop();