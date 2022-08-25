import React, { useState } from "react";
import { Alert, Button, Modal, Input } from "antd";
import { ethers } from "ethers";

export default function CommunityStakingModalContent({ writeContracts, readContracts, tx, address }) {
  const [hasStakeAmount, setHasStakeAmount] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("0");
  const stake = async (id, amount) => {
    tx(writeContracts.IDStaking.stake(id + "", ethers.utils.parseUnits(amount)));
  };

  return (
    <div>
      <Input
        onChange={e => setStakeAmount(e.target.value)}
        addonBefore={<button>+</button>}
        addonAfter={<button>-</button>}
      />
      {hasStakeAmount && (
        <div className="border-2 border-gray-200 px-4 py-6 rounded-lg bg-yellow-200">
          <h1>Important!</h1>
          <ul className="list-disc">
            <li>
              Your staked GTC will be locked when the grant round starts, and you will not be able to withdraw it until
              two weeks after the round ends
            </li>
            <li>
              The staking contract has been checked by our engineering team, but it has not been audited by a
              professional audit firm. Please proceed with your own risk.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
