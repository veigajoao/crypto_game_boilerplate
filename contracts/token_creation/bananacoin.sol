// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BananaCoin is ERC20Burnable {

    constructor() ERC20("BitBanana", "BNANA") {
        _mint(msg.sender, 100 * 10**6 * 10**18);
    }

}