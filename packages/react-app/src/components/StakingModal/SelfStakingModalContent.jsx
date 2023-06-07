import React, { useState, useEffect } from "react";
import { Button, Input, notification } from "antd";
import { getSelfStakeAmount, parseGtc, formatGtc } from "./utils";
import { ethers } from "ethers";
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
  const [stakeAmount, setStakeAmount] = useState(ethers.BigNumber.from("0"));
  // amount loaded from an existing stake
  const [loadedAmount, setLoadedAmount] = useState(ethers.BigNumber.from("0"));

  const newStakeAmount = stakeAmount.sub(loadedAmount);
  console.log("loadedAmount", loadedAmount);
  console.log("stakeAmount", stakeAmount);
  console.log("formatted", formatGtc(stakeAmount));
  console.log("newStakeAmount", newStakeAmount);

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
  const increaseStakeAmount = () => setStakeAmount(stakeAmount => stakeAmount.add(parseGtc("1")));

  const decreaseStakeAmount = () => setStakeAmount(stakeAmount => stakeAmount.sub(parseGtc("1")));

  const onStake = async () => {
    try {
      const stakeTx = tx(writeContracts.IDStaking.stake(round.toString(), newStakeAmount));
      handleStakingTransaction(stakeTx);
      await stakeTx;
    } catch (e) {
      notification.open({
        message: "Staking unsuccessful",
        description: `Error: ${e.message}`,
      });
      return null;
    }
  };

  const resetAmounts = () => {
    setStakeAmount(ethers.BigNumber.from("0"));
    setLoadedAmount(ethers.BigNumber.from("0"));
  };

  return (
    <CommonStakingModalContent
      title={"Stake on yourself"}
      totalAmountStaked={stakeAmount}
      newStakeAmount={newStakeAmount}
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
            <Button disabled={disabled} onClick={decreaseStakeAmount}>
              -
            </Button>
            <Input
              value={formatGtc(stakeAmount)}
              onChange={e => setStakeAmount(parseGtc(e.target.value))}
              style={{ borderRight: "0px", borderLeft: "0px", maxWidth: "30%" }}
              disabled={disabled}
            />
            <Button disabled={disabled} onClick={increaseStakeAmount}>
              +
            </Button>
          </div>
        </div>
      )}
      renderStakeSummary={() => (
        <p className="mt-4">
          You’ll be staking <span className="font-bold">{formatGtc(newStakeAmount)} GTC</span> on yourself.
        </p>
      )}
    />
  );
}
