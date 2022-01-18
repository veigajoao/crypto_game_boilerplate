// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BananaCoin is ERC20Burnable {

    constructor() ERC20("BananaCoin", "BANCOIN") {
        _mint(msg.sender, 5.8 * 10**6);
    }

}