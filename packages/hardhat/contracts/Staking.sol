//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking is Ownable {
    IERC20 public token;
    uint256 public start;
    uint256 public duration;
    mapping(address => uint256) stakes;

    event tokenStaked(address staker, uint256 amount);
    event tokenUnstaked(address staker, uint256 amount);

    modifier canUnstake() {
        require(
            (start == 0 && duration == 0) ||
                (start > block.timestamp) ||
                (start < block.timestamp && block.timestamp > start + duration),
            "Can't unstake during an active round"
        );
        _;
    }

    constructor(IERC20 _token) payable {
        token = _token;
    }

    function updateMeta(uint256 _start, uint256 _duration) public onlyOwner {
        require(
            _start > 0 && _duration > 0,
            "start and duration has to be > 0"
        );
        require(
            start + duration < block.timestamp,
            "A round is currently active"
        );
        require(
            _start > block.timestamp,
            "start point should be in the future"
        );
        start = _start;
        duration = _duration;
    }

    function fetchMeta()
        public
        view
        returns (
            uint256 _start,
            uint256 _duration,
            bool isActiveRound
        )
    {
        return (
            start,
            duration,
            start < block.timestamp && block.timestamp < (start + duration)
        );
    }

    // stake
    function stake(uint256 amount) public {
        token.transferFrom(msg.sender, address(this), amount);

        stakes[msg.sender] += amount;

        emit tokenStaked(msg.sender, amount);
    }

    // unstake
    function unstake(uint256 amount) public canUnstake {
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
