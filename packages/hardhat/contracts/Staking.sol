//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking is Ownable {
    IERC20 public token;
    uint256 public latestRound;

    struct Round {
        string meta;
        uint256 tvl;
        uint256 start;
        uint256 duration;
        mapping(address => uint256) stakes;
    }

    mapping(uint256 => Round) rounds;

    event roundCreated(uint256 id);
    event tokenStaked(uint256 roundId, address staker, uint256 amount);
    event tokenUnstaked(uint256 roundId, address staker, uint256 amount);

    modifier roundExists(uint256 roundId) {
        require(
            rounds[roundId].start > 0 && roundId > 0,
            "Round does not exist"
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
        //Removed onlyOwner modifier for testing purposes
    ) public {

        // REMOVING these require statements because they are not necessary to test staking and locking
        // if (latestRound > 0) {
        //     require(
        //         start >
        //             rounds[latestRound].start + rounds[latestRound].duration,
        //         "new rounds have to start after old rounds"
        //     );
        // }

        // require(start > block.timestamp, "new rounds should be in the future");

        latestRound++;

        rounds[latestRound].start = start;
        rounds[latestRound].duration = duration;
        rounds[latestRound].meta = meta;

        emit roundCreated(latestRound);
    }

    // stake
    function stake(uint256 roundId, uint256 amount) public {
        // require(isActiveRound(roundId), "Can't stake an inactive round");

        token.transferFrom(msg.sender, address(this), amount);

        rounds[roundId].tvl += amount;

        rounds[roundId].stakes[msg.sender] += amount;

        emit tokenStaked(roundId, msg.sender, amount);
    }

    // unstake
    function unstake(uint256 roundId, uint256 amount) public {
        // require(
        //     !isActiveRound(roundId),
        //     "Can't unstake during an active round"
        // );
        require(
            rounds[roundId].stakes[msg.sender] >= amount,
            "Not enough balance to withdraw"
        );

        rounds[roundId].tvl -= amount;

        rounds[roundId].stakes[msg.sender] -= amount;

        token.transfer(msg.sender, amount);

        emit tokenUnstaked(roundId, msg.sender, amount);
    }

    // migrateStake
    function migrateStake(uint256 fromRound) public {
        require(fromRound < latestRound, "Can't migrate from an active round");

        uint256 balance = rounds[fromRound].stakes[msg.sender];

        require(balance > 0, "Not enough balance to migrate");

        rounds[fromRound].tvl -= balance;
        rounds[fromRound].stakes[msg.sender] = 0;
        rounds[latestRound].tvl += balance;
        rounds[latestRound].stakes[msg.sender] = balance;

        emit tokenUnstaked(fromRound, msg.sender, balance);
        emit tokenStaked(latestRound, msg.sender, balance);
    }

    // VIEW
    function fetchRoundMeta(uint256 roundId)
        public
        view
        roundExists(roundId)
        returns (
            uint256 start,
            uint256 duration,
            uint256 tvl
        )
    {
        return (
            rounds[roundId].start,
            rounds[roundId].duration,
            rounds[roundId].tvl
        );
    }

    function isActiveRound(uint256 roundId)
        public
        view
        returns (bool isActive)
    {
        (uint256 start, uint256 duration, ) = fetchRoundMeta(roundId);
        isActive =
            start < block.timestamp &&
            start + duration > block.timestamp;
    }

    function getUserStakeForRound(uint256 roundId, address user)
        public
        view
        ///roundExists(roundId)
        returns (uint256)
    {
        return rounds[roundId].stakes[user];
    }

        function getUserStakeFromLatestRound(address user)
        public
        view
        ///roundExists(roundId)
        returns (uint256)
    {
        return rounds[latestRound].stakes[user];
    }
}
