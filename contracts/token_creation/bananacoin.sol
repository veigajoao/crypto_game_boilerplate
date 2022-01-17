// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BananaCoin is ERC20("BananaCoin", "BANCOIN") {

    constructor() {
        _mint(msg.sender, 5.8 * 10**6);
    }

}