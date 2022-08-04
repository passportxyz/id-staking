//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {XStaking} from "./XStaking.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract IDStaking is XStaking, Ownable {
    uint256 public latestRound;
    struct Round {
        string meta;
        uint256 tvl;
        uint256 start;
        uint256 duration;
    }

    mapping(uint256 => Round) rounds;

    event roundCreated(uint256 id);
    event selfStake(
        uint256 roundId,
        address staker,
        uint256 amount,
        bool staked
    );
    event xStake(
        uint256 roundId,
        address staker,
        address user,
        uint256 amount,
        bool staked
    );
    event tokenMigrated(
        address staker,
        uint256 amount,
        uint256 fromRound,
        uint256 toRound
    );

    modifier roundExists(uint256 roundId) {
        require(roundId > 0 && roundId <= latestRound, "Round does not exist");
        _;
    }

    modifier canStakeRound(uint256 roundId) {
        require(roundId > 0 && roundId <= latestRound, "Round does not exist");
        require(
            rounds[roundId].start + rounds[roundId].duration < block.timestamp,
            "Can't stake on this round"
        );
        _;
    }

    modifier canUnstakeRound(uint256 roundId) {
        require(roundId > 0 && roundId <= latestRound, "Round does not exist");
        require(
            rounds[roundId].start + rounds[roundId].duration > block.timestamp,
            "Can't unstake an active round"
        );
        _;
    }

    constructor(IERC20 _token) payable {
        token = _token;
    }

    function createRound(
        uint256 start,
        uint256 duration,
        string memory meta
    ) public onlyOwner {
        if (latestRound > 0) {
            require(
                start >
                    rounds[latestRound].start + rounds[latestRound].duration,
                "new rounds have to start after old rounds"
            );
        }

        require(start > block.timestamp, "new rounds should be in the future");

        latestRound++;

        rounds[latestRound].start = start;
        rounds[latestRound].duration = duration;
        rounds[latestRound].meta = meta;

        emit roundCreated(latestRound);
    }

    // stake
    function stake(uint256 roundId, uint256 amount)
        public
        canStakeRound(roundId)
    {
        _stake(roundId, amount);

        rounds[roundId].tvl += amount;

        emit selfStake(roundId, msg.sender, amount, true);
    }

    // stakeUser
    function stakeUsers(
        uint256 roundId,
        address[] memory users,
        uint256[] memory amounts
    ) public canStakeRound(roundId) {
        require(users.length == amounts.length, "Unequal users and amount");

        for (uint256 i = 0; i < users.length; i++) {
            require(address(0) != users[i], "can't stake the zero address");
            require(
                users[i] != msg.sender,
                "You can't stake on your address here"
            );
            _stakeUser(roundId, users[i], amounts[i]);

            rounds[roundId].tvl += amounts[i];

            emit xStake(roundId, msg.sender, users[i], amounts[i], true);
        }
    }

    // unstake
    function unstake(uint256 roundId, uint256 amount)
        public
        canUnstakeRound(roundId)
    {
        require(
            stakes[roundId][msg.sender] >= amount,
            "Not enough balance to withdraw"
        );

        rounds[roundId].tvl -= amount;

        _unstake(roundId, amount);

        emit selfStake(roundId, msg.sender, amount, false);
    }

    // unstakeUser
    function unstakeUsers(uint256 roundId, address[] memory users)
        public
        canUnstakeRound(roundId)
    {
        for (uint256 i = 0; i < users.length; i++) {
            require(address(0) != users[i], "can't stake the zero address");
            require(
                users[i] != msg.sender,
                "You can't stake on your address here"
            );

            bytes32 stakeId = getStakeId(msg.sender, users[i]);
            uint256 unstakeBalance = xStakes[roundId][stakeId];

            if (unstakeBalance > 0) {
                rounds[roundId].tvl -= unstakeBalance;

                _unstakeUser(roundId, users[i], unstakeBalance);

                emit xStake(
                    roundId,
                    msg.sender,
                    users[i],
                    unstakeBalance,
                    false
                );
            }
        }
    }

    // migrateStake
    function migrateStake(uint256 fromRound) public canUnstakeRound(fromRound) {
        require(fromRound < latestRound, "Can't migrate from an active round");

        uint256 balance = stakes[fromRound][msg.sender];

        require(balance > 0, "Not enough balance to migrate");

        rounds[fromRound].tvl -= balance;
        stakes[fromRound][msg.sender] = 0;
        rounds[latestRound].tvl += balance;
        stakes[latestRound][msg.sender] = balance;

        emit selfStake(fromRound, msg.sender, balance, false);
        emit selfStake(latestRound, msg.sender, balance, true);
        emit tokenMigrated(msg.sender, balance, fromRound, latestRound);
    }

    // VIEW
    function fetchRoundMeta(uint256 roundId)
        public
        view
        roundExists(roundId)
        returns (
            uint256 start,
            uint256 duration,
            uint256 tvl,
            string memory meta
        )
    {
        return (
            rounds[roundId].start,
            rounds[roundId].duration,
            rounds[roundId].tvl,
            rounds[roundId].meta
        );
    }

    function isActiveRound(uint256 roundId)
        public
        view
        returns (bool isActive)
    {
        (uint256 start, uint256 duration, , ) = fetchRoundMeta(roundId);
        isActive =
            start < block.timestamp &&
            start + duration > block.timestamp;
    }

    function getUserStakeForRound(uint256 roundId, address user)
        public
        view
        roundExists(roundId)
        returns (uint256)
    {
        return _getUserStakeForRound(roundId, user);
    }
}
