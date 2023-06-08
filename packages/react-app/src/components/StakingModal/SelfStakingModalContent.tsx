import React, { useState, useEffect } from "react";
import { Button, Input, notification } from "antd";
import { getSelfStakeAmount, parseGtc, formatGtc } from "./utils";
import { ethers } from "ethers";
import CommonStakingModalContent from "./CommonStakingModalContent";
import type { IndexedStakeData } from "../../types";

type CommunityStakingModalContentProps = {
  roundData: IndexedStakeData;
  writeContracts: any;
  readContracts: any;
  tx: any;
  address: string;
  isModalVisible: boolean;
  setIsModalVisible: (value: boolean) => void;
  round: number;
  mainnetProvider: ethers.providers.Web3Provider;
  handleStakingTransaction: (tx: any) => void;
};

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
}: CommunityStakingModalContentProps) {
  const [stakeAmount, setStakeAmount] = useState(ethers.BigNumber.from("0"));
  // amount loaded from an existing stake
  const [loadedAmount, setLoadedAmount] = useState(ethers.BigNumber.from("0"));

  const newStakeAmount = stakeAmount.gt(loadedAmount) ? stakeAmount.sub(loadedAmount) : ethers.BigNumber.from("0");

  // set starting amount on modal open
  useEffect(() => {
    const selfStakeAmount = getSelfStakeAmount(roundData);
    if (isModalVisible && selfStakeAmount && selfStakeAmount.gt(0)) {
      setStakeAmount(selfStakeAmount);
      setLoadedAmount(selfStakeAmount);
    }
  }, [isModalVisible]);

  // Allows the user to change stake amount
  const increaseStakeAmount = () => setStakeAmount(stakeAmount => stakeAmount.add(parseGtc("1")));

  const decreaseStakeAmount = () => setStakeAmount(stakeAmount => stakeAmount.sub(parseGtc("1")));

  const onStake = async () => {
    try {
      if (!newStakeAmount.gt(0)) return;
      const stakeTx = tx(writeContracts.IDStaking.stake(round.toString(), newStakeAmount));
      handleStakingTransaction(stakeTx);
      await stakeTx;
    } catch (e: any) {
      notification.open({
        message: "Staking unsuccessful",
        description: `Error: ${e?.message}`,
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
      renderStakeForm={(disabled: boolean) => (
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
