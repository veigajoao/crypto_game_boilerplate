# crypto_game_boilerplate

This boilerplate contract code will serve the purpose of developing and testing different implementations pf crypto games in ethereum/binance smart chain applications.

# game project

The game project involves:

1. Creation of ERC20 token (game token) - Done
2. Creation of ERC721 NFTs as game chars - Done
3. Game contract - Done
 
 The contract will have public functions that take a nft, evaluate some require() needs - such as 
 minimum wait time between games, char attributes, etc. and output new tokens for the player

4. Marketplace contract - pending will not be prioritised
5. locked wallets contracts - Done

6. ICO contracts - pending (2 contracts - 1 buying early boxes - 2 buying early tokens)

# Code organization

The code has been divided into 3 main folders:

1. Contracts - holds source code for smart contracts
2. test - holds unit testing and functional testing code for the smart contracts in a Ganache Ethereum Network
3. deployment - holds scripts for actually deploying the contracts to live nets (test or main)

The JSON-RPC endpoint for the deployment network, private keys and current live contracts addresses are to be loaded as environment variables when running the scripts

# Mainnet contracts

Contracts will be deployed to Binance Smart Chain Mainnet

ERC20: 0xf9b27685bfaAF96AaedffD45DA69BF7F5d0ea07D  
ERC721:  
Game contract:  
Marketplace contract:  
Staking contract:  

Locked wallet advisors: 0x8996DFd510535E103EA470e6a9BaA314B9a7f3d2  
Locked wallet Core Team: 0x5448A56f629Fba0Ad11e3e5ad9a878Db61A9a797  
Locked wallet Marketing: 0x743126FCfeCfea541F65C0f464e9B146a44B8210  
Locked wallet Platform development: 0x6042e4B7f4C9D3696f1CfD3946a70CD8dBdbA9Eb  
Locked wallet Airdrop: 0x82690b21Fa598531EC46a493e46C0daBdFa3D435  

Presale contract:  
Public sale contract:  