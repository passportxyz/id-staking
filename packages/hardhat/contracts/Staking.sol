pragma solidity >=0.8.0 <0.9.0;

//SPDX-License-Identifier: MIT

import {IStaking} from "./IStaking.sol";

// import "hardhat/console.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking is IStaking {
    IERC20 public token;
    uint256 public fee;

    constructor(
        IERC20 _token,
        uint256 _quorum,
        uint256 _fee
    ) payable {
        token = _token;
        fee = _fee;
        quorum = _quorum;
    }

    // stake
    function stake(uint256 amount) public virtual override {
        token.transferFrom(msg.sender, address(this), amount);

        stakes[msg.sender].balance += amount;

        emit tokenStaked(msg.sender, amount);
    }

    function unstake(uint256 amount) public virtual override {
        require(
            stakes[msg.sender].balance >= amount,
            "Not enough balance to withdraw"
        );
        require(!stakes[msg.sender].locked, "Your stakes are currently locked");

        stakes[msg.sender].balance -= amount;

        token.transferFrom(address(this), msg.sender, amount);

        emit tokenWithdrawn(msg.sender, amount);
    }

    function challenge(address a, address b)
        public
        virtual
        override
        returns (bytes32 id)
    {
        // enough stake balance for a & b | stakes not locked for challenger, a & b
        require(
            stakes[a].balance > 0 &&
                stakes[b].balance > 0 &&
                !stakes[msg.sender].locked &&
                !stakes[a].locked &&
                !stakes[b].locked,
            "Failed balance and lock checks"
        );

        // create challenge ID
        id = keccak256(abi.encodePacked(msg.sender, a, b, block.number));

        // pay challenge fee
        token.transferFrom(msg.sender, address(this), fee);

        // initiate challenge
        challenges[id].amount = fee;
        challenges[id].stakers.push(a);
        challenges[id].stakers.push(b);
        challenges[id].challenger = msg.sender;

        // lock tokens for a & b
        stakes[a].locked = true;
        stakes[b].locked = true;

        emit challenged(a, b, msg.sender, id);
    }

    function voteChallenge(bytes32 id)
        public
        virtual
        override
        onlyJuror
        challengeExists(id)
    {
        challenges[id].voted[msg.sender] = true;
        challenges[id].votes += 1;
        challenges[id].voters.push(msg.sender);

        emit challengeVoted(id, msg.sender);
    }

    function finalizeChallenge(bytes32 id)
        public
        virtual
        override
        challengeExists(id)
    {
        challenges[id].resolved = true;

        uint256 amount = challenges[id].amount;
        challenges[id].amount = 0;
        address[] memory challengedAddresses = challenges[id].stakers;

        // slashes & payout
        for (uint256 i = 0; i < challengedAddresses.length; i++) {
            amount += stakes[challengedAddresses[i]].balance;
            stakes[challengedAddresses[i]].balance = 0;
        }

        uint256 totalVoters = challenges[id].voters.length;

        // split token among voters and challenger
        uint256 share = ((amount * 80) / 100) / totalVoters;
        token.transferFrom(
            address(this),
            challenges[id].challenger,
            (amount * 20) / 100
        );

        for (uint256 i = 0; i < totalVoters; i++) {
            token.transferFrom(address(this), challenges[id].voters[i], share);
        }

        emit challengeFinalized(id);
    }
}
