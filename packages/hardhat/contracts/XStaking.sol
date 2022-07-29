//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {Staking} from "./Staking.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract XStaking is Staking {
    mapping(uint256 => mapping(bytes32 => uint256)) public xStakes;

    // stake
    function _stakeUser(
        uint256 roundId,
        address user,
        uint256 amount
    ) internal {
        // TODO : Optimize to transfer tokens in IDStaking instead
        token.transferFrom(msg.sender, address(this), amount);

        xStakes[roundId][getStakeId(msg.sender, user)] += amount;
    }

    // unstake
    function _unstakeUser(
        uint256 roundId,
        address user,
        uint256 amount
    ) internal {
        xStakes[roundId][getStakeId(msg.sender, user)] -= amount;

        token.transfer(msg.sender, amount);
    }

    function _getUserXStakeForRound(
        uint256 roundId,
        address staker,
        address user
    ) internal view returns (uint256) {
        return xStakes[roundId][getStakeId(staker, user)];
    }

    function getStakeId(address staker, address user)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(staker, user));
    }
}
