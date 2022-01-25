import {web3, accounts, nftCreation, bananaCoin, gameContract, mintCost1,
    mintCost2, mintCost3, upgradeCost, baseURI} from './_contractSetup.test.js';
import BigNumber from 'bignumber.js';
import assert from 'assert';

describe('CryptoMonkeyChars contract', () => {

    it('deploys a contract', () => {
        assert.ok(nftCreation.options.address);
    });

    it('constructor() works correctly', async() => {
        const name = await nftCreation.methods.name().call();
        const symbol = await nftCreation.methods.symbol().call();

        const tokenAddress = await nftCreation.methods.tokenAddress().call();
        const _mintCost1 = await nftCreation.methods.mintCost(1).call();
        const _mintCost2 = await nftCreation.methods.mintCost(2).call();
        const _mintCost3 = await nftCreation.methods.mintCost(3).call();
        const levelUpCost = await nftCreation.methods.levelUpCost().call();
        const baseUriString = await nftCreation.methods.baseUriString().call();

        assert.equal(name, "CryptoMonkeys");
        assert.equal(symbol, "CMONKEYS");

        assert.equal(tokenAddress, bananaCoin.options.address);
        assert.equal(_mintCost1, mintCost1);
        assert.equal(_mintCost2, mintCost2);
        assert.equal(_mintCost3, mintCost3);
        assert.equal(levelUpCost, upgradeCost);
        assert.equal(baseUriString, baseURI);
    });

    it('mintNft() works correctly if user pays ERC20 tokens', async() => {
        
        //approve spending in ERC20 contract
        await bananaCoin.methods.approve(nftCreation.options.address, mintCost1).send({ from: accounts[0], gas: '1000000' });

        const balance0 = BigNumber(await bananaCoin.methods.balanceOf(accounts[0]).call());
        const balance0nft = BigNumber(await nftCreation.methods.balanceOf(accounts[0]).call());

        await nftCreation.methods.mintNft(accounts[0], '1').send({ from: accounts[0], gas: '1000000' });

        const balance1 = BigNumber(await bananaCoin.methods.balanceOf(accounts[0]).call());
        const balance1nft = BigNumber(await nftCreation.methods.balanceOf(accounts[0]).call());

        assert.equal(balance0.comparedTo(BigNumber.sum(balance1, mintCost1)), 0);
        assert.equal(balance0nft, balance1nft - 1);
        
    });

    it('mintNft() doesn`t work if user doesn`t pay ERC20 tokens', async() => {
        
        await bananaCoin.methods.approve(nftCreation.options.address, mintCost1).send({ from: accounts[1], gas: '1000000' });

        //should fail because accounts[1] doesn't have any ERC20 tokens
        const assertionFunc = async() => {
            await nftCreation.methods.mintNft(accounts[0], '1').send({ from: accounts[1] })
        };

        assert.rejects(assertionFunc);

    });

    it('mintNft() doesn`t work if user doesn`t input package type between 1 and 3', async() => {
        
        await bananaCoin.methods.approve(nftCreation.options.address, mintCost1).send({ from: accounts[0], gas: '1000000' });

        //should fail because second argument needs to be 1, 2 or 3
        const assertionFunc1 = async() => {
            await nftCreation.methods.mintNft(accounts[0], '0').send({ from: accounts[0] })
        };
        const assertionFunc2 = async() => {
            await nftCreation.methods.mintNft(accounts[0], '4').send({ from: accounts[0] })
        };
        const assertionFunc3 = async() => {
            await nftCreation.methods.mintNft(accounts[0], '1.5').send({ from: accounts[0] })
        };
        const assertionFunc4 = async() => {
            await nftCreation.methods.mintNft(accounts[0]).send({ from: accounts[0] })
        };

        assert.rejects(assertionFunc1);
        assert.rejects(assertionFunc2);
        assert.rejects(assertionFunc3);
        assert.rejects(assertionFunc4);

    });

    it('probability of generating each nft rarity is correct', async () => {

        //comment this assertion out for full test. This it test takes a lot of time and doesn't need to 
        // be run every single time, only before commits
        assert.equal(1, 2);

        //tooling to calculate z score of arrays
        const zScoreTolerance = 0.10;
        const sampleSize = 500;

        const stdDevFunc = (p) => {
            return  (p*(1-p))**0.5;
        }

        const zindexFunc = (p, x) => {
            return Math.abs((x - p)/stdDevFunc(p));
        }

        const solveArrayX = (arrayObj, monkeyTypeLowThresh, monkeyTypeUpThresh) => {
            let BoxSet = arrayObj.map((item) => {
                let num = parseInt(item.monkeyType);
                if  (num >= monkeyTypeLowThresh && num < monkeyTypeUpThresh) {
                    return 1
                } else {
                    return 0
                }
            });
            console.log(BoxSet.reduce((pv, cv) => pv + cv, 0));
            return BoxSet.reduce((pv, cv) => pv + cv, 0);
        }

        let commomProb;
        let rareProb;
        let epicProb;
        let legendaryProb;

        let currentToken;
        let lastToken;
        let createArray;
        let promisesArray;
        let resultArray;

        const commonThresh = 6;
        const rareThresh = 10;
        const epicThresh = 13;

        let zIndexCommon;
        let zIndexRare;
        let zIndexEpic;
        let zIndexLegendary;

        //test normal box
        commomProb = 0.68;
        rareProb = 0.22;
        epicProb = 0.08;
        legendaryProb = 0.02;

        //get current id of nft
        currentToken = parseInt(await nftCreation.methods._tokenIds().call());
        lastToken = currentToken + sampleSize;
        await bananaCoin.methods.approve(nftCreation.options.address, mintCost1 * sampleSize).send({ from: accounts[0], gas: '1000000' });

        createArray = [];
        for (let i = 0; i < sampleSize; i++) {
            createArray.push(nftCreation.methods.mintNft(accounts[0], '1').send({ from: accounts[0], gas: '1000000' }) );
        }
        await Promise.all(createArray);
        
        promisesArray = [];
        for (let c = currentToken + 1; c <= lastToken; c++) {
            promisesArray.push( nftCreation.methods.tokensAttributes(c).call() );
        } 
        resultArray = await Promise.all(promisesArray);

        zIndexCommon = zindexFunc(commomProb, solveArrayX(resultArray, 1, commonThresh)/sampleSize);
        zIndexRare = zindexFunc(rareProb, solveArrayX(resultArray, commonThresh, rareThresh)/sampleSize);
        zIndexEpic = zindexFunc(epicProb, solveArrayX(resultArray, rareThresh, epicThresh)/sampleSize);
        zIndexLegendary = zindexFunc(legendaryProb, solveArrayX(resultArray, epicThresh, 1000)/sampleSize);

        console.log(zIndexCommon);
        console.log(zIndexRare);
        console.log(zIndexEpic);
        console.log(zIndexLegendary);

        assert(zIndexCommon < zScoreTolerance);
        assert(zIndexRare < zScoreTolerance);
        assert(zIndexEpic < zScoreTolerance);
        assert(zIndexLegendary < zScoreTolerance);

        //test rare box
        commomProb = 0.30;
        rareProb = 0.40;
        epicProb = 0.20;
        legendaryProb = 0.10;

        //get current id of nft
        currentToken = parseInt(await nftCreation.methods._tokenIds().call());
        lastToken = currentToken + sampleSize;
        await bananaCoin.methods.approve(nftCreation.options.address, mintCost2 * sampleSize).send({ from: accounts[0], gas: '1000000' });

        createArray = [];
        for (let i = 0; i < sampleSize; i++) {
            createArray.push(nftCreation.methods.mintNft(accounts[0], '2').send({ from: accounts[0], gas: '1000000' }) );
        }
        await Promise.all(createArray);
        
        promisesArray = [];
        for (let c = currentToken + 1; c <= lastToken; c++) {
            promisesArray.push( nftCreation.methods.tokensAttributes(c).call() );
        } 
        resultArray = await Promise.all(promisesArray);

        zIndexCommon = zindexFunc(commomProb, solveArrayX(resultArray, 1, commonThresh)/sampleSize);
        zIndexRare = zindexFunc(rareProb, solveArrayX(resultArray, commonThresh, rareThresh)/sampleSize);
        zIndexEpic = zindexFunc(epicProb, solveArrayX(resultArray, rareThresh, epicThresh)/sampleSize);
        zIndexLegendary = zindexFunc(legendaryProb, solveArrayX(resultArray, epicThresh, 1000)/sampleSize);

        console.log(zIndexCommon);
        console.log(zIndexRare);
        console.log(zIndexEpic);
        console.log(zIndexLegendary);

        assert(zIndexCommon < zScoreTolerance);
        assert(zIndexRare < zScoreTolerance);
        assert(zIndexEpic < zScoreTolerance);
        assert(zIndexLegendary < zScoreTolerance);

        //test epic box
        commomProb = 0.0;
        rareProb = 0.40;
        epicProb = 0.40;
        legendaryProb = 0.20;

        //get current id of nft
        currentToken = parseInt(await nftCreation.methods._tokenIds().call());
        lastToken = currentToken + sampleSize;
        await bananaCoin.methods.approve(nftCreation.options.address, mintCost3 * sampleSize).send({ from: accounts[0], gas: '1000000' });

        createArray = [];
        for (let i = 0; i < sampleSize; i++) {
            createArray.push(nftCreation.methods.mintNft(accounts[0], '3').send({ from: accounts[0], gas: '1000000' }) );
        }
        await Promise.all(createArray);
        
        promisesArray = [];
        for (let c = currentToken + 1; c <= lastToken; c++) {
            promisesArray.push( nftCreation.methods.tokensAttributes(c).call() );
        } 
        resultArray = await Promise.all(promisesArray);

        zIndexCommon = zindexFunc(commomProb, solveArrayX(resultArray, 1, commonThresh)/sampleSize);
        zIndexRare = zindexFunc(rareProb, solveArrayX(resultArray, commonThresh, rareThresh)/sampleSize);
        zIndexEpic = zindexFunc(epicProb, solveArrayX(resultArray, rareThresh, epicThresh)/sampleSize);
        zIndexLegendary = zindexFunc(legendaryProb, solveArrayX(resultArray, epicThresh, 1000)/sampleSize);

        console.log(zIndexCommon);
        console.log(zIndexRare);
        console.log(zIndexEpic);
        console.log(zIndexLegendary);

        assert(zIndexCommon < zScoreTolerance);
        assert(zIndexRare < zScoreTolerance);
        assert(zIndexEpic < zScoreTolerance);
        assert(zIndexLegendary < zScoreTolerance);

    }).timeout(500000);

    it('upgradeNft() works correctly if user pays ERC20 tokens', async() => {
        
        //approve spending in ERC20 contract
        await bananaCoin.methods.approve(nftCreation.options.address, upgradeCost).send({ from: accounts[0], gas: '1000000' });

        //get id of one of accounts[0]'s nfts
        const tokenId = await nftCreation.methods.tokenOfOwnerByIndex(accounts[0], 0).call();

        const nftStruct0 = await nftCreation.methods.tokensAttributes(tokenId).call();
        const balance0 = BigNumber(await bananaCoin.methods.balanceOf(accounts[0]).call());

        await nftCreation.methods.upgradeNft(accounts[0], tokenId).send({ from: accounts[0], gas: '1000000' });

        const balance1 = BigNumber(await bananaCoin.methods.balanceOf(accounts[0]).call());
        const nftStruct1 = await nftCreation.methods.tokensAttributes(tokenId).call();

        
        assert.equal(balance0.comparedTo(BigNumber.sum(balance1, upgradeCost)), 0);
        assert.equal(nftStruct0.charLevel, "1");
        assert.equal(nftStruct1.charLevel, "2");

        //assert correct Uri
        const assetUri = await nftCreation.methods.tokenURI(tokenId).call();;
        assert.equal(assetUri, baseURI + "/" + nftStruct0.monkeyType + ".png");
        
        
        //check that upgrade can't be done a second time
        await bananaCoin.methods.approve(nftCreation.options.address, upgradeCost).send({ from: accounts[0], gas: '1000000' });
        const assertionFunc = async() => {
            await nftCreation.methods.upgradeNft(accounts[0], tokenId).send({ from: accounts[0], gas: '1000000' });
        };

        assert.rejects(assertionFunc);

    }).timeout(500000);

    it('upgradeNft() doesn`t work if user doesn`t pay ERC20 tokens', async() => {
        
        await bananaCoin.methods.approve(nftCreation.options.address, upgradeCost).send({ from: accounts[1], gas: '1000000' });
        
        //should fail because accounts[1] doesn't have any ERC20 tokens
        const assertionFunc = async() => {
            await nftCreation.methods.mintNft(accounts[0]).send({ from: accounts[1] })
        };

        assert.rejects(assertionFunc);

    });

    it('Ownable assigned to deployer', async() => {
        const owner = await nftCreation.methods.owner().call();
        assert.equal(owner, accounts[0])
    });

    it('Owner private functions work', async() => {
        await nftCreation.methods.setTokenAddress(accounts[8]).send({ from: accounts[0] });
        await nftCreation.methods.setMintCost("10", "25", "40").send({ from: accounts[0] });
        await nftCreation.methods.setLevelUpCost("20").send({ from: accounts[0] });
        await nftCreation.methods.setBaseUriString("ABDE").send({ from: accounts[0] });

        const tokenAddress = await nftCreation.methods.tokenAddress().call();
        const _mintCost1 = await nftCreation.methods.mintCost(1).call();
        const _mintCost2 = await nftCreation.methods.mintCost(2).call();
        const _mintCost3 = await nftCreation.methods.mintCost(3).call();
        const levelUpCost = await nftCreation.methods.levelUpCost().call();
        const baseUriString = await nftCreation.methods.baseUriString().call();

        assert.equal(tokenAddress, accounts[8]);
        assert.equal(_mintCost1, "10");
        assert.equal(_mintCost2, "25");
        assert.equal(_mintCost3, "40");
        assert.equal(levelUpCost, "20");
        assert.equal(baseUriString, "ABDE");

        //check that already minted nft's source url changed
        const tokenId = await nftCreation.methods.tokenOfOwnerByIndex(accounts[0], 0).call();
        const nftStruct = await nftCreation.methods.tokensAttributes(tokenId).call();
        const assetUri = await nftCreation.methods.tokenURI(tokenId).call();;
        assert.equal(assetUri, baseUriString + "/" + nftStruct.monkeyType + ".png");

    }).timeout(500000);

    it('Owner private functions don`t work if not called by owner', async() => {
        const assertionFunc0 = async() => {
            await nftCreation.methods.setTokenAddress(accounts[8]).send({ from: accounts[1] });
        };
        const assertionFunc1 = async() => {
            await nftCreation.methods.setMintCost("10").send({ from: accounts[1] });
        };
        const assertionFunc2 = async() => {
            await nftCreation.methods.setLevelUpCost("20").send({ from: accounts[1] });
        };
        const assertionFunc3 = async() => {
            await nftCreation.methods.setBaseUriString("ABDE").send({ from: accounts[1] });
        };

        assert.rejects(assertionFunc0);
        assert.rejects(assertionFunc1);
        assert.rejects(assertionFunc2);
        assert.rejects(assertionFunc3);
    });

});