//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking is Ownable {
    IERC20 public token;
    mapping(address => uint256) stakes;

    event tokenStaked(address staker, uint256 amount);
    event tokenUnstaked(address staker, uint256 amount);

    constructor(IERC20 _token) payable {
        token = _token;
    }

    // stake
    function stake(uint256 amount) public {
        token.transferFrom(msg.sender, address(this), amount);

        stakes[msg.sender] += amount;

        emit tokenStaked(msg.sender, amount);
    }

    // unstake
    function unstake(uint256 amount) public {
        require(stakes[msg.sender] >= amount, "Not enough balance to withdraw");

        stakes[msg.sender] -= amount;

        token.transfer(msg.sender, amount);

        emit tokenUnstaked(msg.sender, amount);
    }

    // view for stake amount
    function getStakeFor(address user) public view returns (uint256) {
        return stakes[user];
    }
}
