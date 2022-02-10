// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/finance/VestingWallet.sol";

contract TimeLockedWallet is VestingWallet {

    constructor (
        address beneficiaryAddress,
        uint64 durationSeconds
    ) VestingWallet(beneficiaryAddress, uint64(block.timestamp), durationSeconds) {}

}