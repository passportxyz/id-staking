import React, { useState, useEffect } from "react";
import { Button, Input, notification } from "antd";
import { ethers } from "ethers";
import { getSelfStakeAmount } from "./utils";
import CommonStakingModalContent from "./CommonStakingModalContent";

export default function CommunityStakingModalContent({
  roundData,
  writeContracts,
  readContracts,
  tx,
  address,
  isModalVisible,
  setIsModalVisible,
  round,
  handleStakingTransaction,
}) {
  const [stakeAmount, setStakeAmount] = useState("0.00");
  // amount loaded from an existing stake
  const [loadedAmount, setLoadedAmount] = useState("0.00");

  // set starting amount on modal open
  useEffect(() => {
    const selfStakeAmount = getSelfStakeAmount(roundData);
    if (isModalVisible && selfStakeAmount && parseFloat(selfStakeAmount) > 0) {
      setStakeAmount(selfStakeAmount);
      setLoadedAmount(selfStakeAmount);
    }
  }, [isModalVisible]);

  // Modal button should be hidden if user already approved tokens

  // Allows the user to change stake amount
  const increaseStakeAmount = () => {
    const newStakeAmount = parseFloat(stakeAmount) + 1.0;
    setStakeAmount(newStakeAmount.toFixed(2).toString());
  };

  const decreaseStakeAmount = () => {
    const newStakeAmount = parseFloat(stakeAmount) - 1.0;
    if (newStakeAmount >= parseFloat(loadedAmount)) {
      setStakeAmount(newStakeAmount.toFixed(2).toString());
    }
  };

  const stake = async (id, amount) => {
    const stakeTx = tx(writeContracts.IDStaking.stake(id + "", ethers.utils.parseUnits(amount)));
    handleStakingTransaction(stakeTx);
    return stakeTx;
  };

  const getNewStakeAmount = () => {
    let tempAmount = parseFloat(stakeAmount);
    const loadedValue = parseFloat(loadedAmount);
    if (loadedValue > 0 && tempAmount > loadedValue) {
      tempAmount = tempAmount - loadedValue;
    }
    return tempAmount;
  };

  const onStake = async () => {
    try {
      await stake(round.toString(), getNewStakeAmount().toString());
    } catch (e) {
      notification.open({
        message: "Staking unsuccessful",
        description: `Error: ${e.message}`,
      });
      return null;
    }
  };

  const resetAmounts = () => {
    setStakeAmount("0.00");
    setLoadedAmount("0.00");
  };

  return (
    <CommonStakingModalContent
      title={"Stake on yourself"}
      getTotalAmountStaked={() => stakeAmount}
      getNewStakeAmount={getNewStakeAmount}
      isModalVisible={isModalVisible}
      setIsModalVisible={setIsModalVisible}
      tx={tx}
      address={address}
      writeContracts={writeContracts}
      readContracts={readContracts}
      resetAmounts={resetAmounts}
      onStake={onStake}
      renderStakeForm={disabled => (
        <div>
          <div className="flex flex-row justify-center">
            <Button disabled={disabled} onClick={() => decreaseStakeAmount()}>
              -
            </Button>
            <Input
              value={stakeAmount}
              onChange={e => setStakeAmount(e.target.value)}
              style={{ borderRight: "0px", borderLeft: "0px", maxWidth: "30%" }}
              disabled={disabled}
            />
            <Button disabled={disabled} onClick={() => increaseStakeAmount()}>
              +
            </Button>
          </div>
        </div>
      )}
      renderStakeSummary={() => (
        <p className="mt-4">
          You’ll be staking <span className="font-bold">{stakeAmount} GTC</span> on yourself.
        </p>
      )}
    />
  );
}
