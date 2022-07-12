//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() payable ERC20("Gitcoin", "GTC") {}

    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }

    function mint() public {
        _mint(msg.sender, 100 ether);
    }
}
