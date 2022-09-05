import React from "react";
import { Form } from "antd";
import { ethers } from "ethers";
import { useState } from "react";
import StakeItem from "./StakeItem";
import StakingModal from "./StakingModal/StakingModal";

import { getSelfStakeAmount, getCommunityStakeAmount } from "./StakingModal/utils";

const zero = ethers.BigNumber.from("0");

export const STARTING_GRANTS_ROUND = 11;

const Rounds = ({
  tx,
  tokenSymbol,
  address,
  readContracts,
  writeContracts,
  unstake,
  migrate,
  round,
  latestRound,
  mainnetProvider,
  unstakeUsers,
  userSigner,
  targetNetwork,
  roundData,
}) => {
  const [form] = Form.useForm();
  // Set to visibility of Staking Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [stakingType, setStakingType] = useState("self");

  // console.log("view new data ", data, error);

  return (
    <>
      <div className="text-gray-600 body-font">
        <StakeItem
          icon={
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="w-4 h-4"
              viewBox="0 0 24 24"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          }
          title="Stake on yourself"
          description="Some explanation on what this means"
          amount={getSelfStakeAmount(roundData)}
          buttonText="Stake"
          buttonHandler={() => {
            setStakingType("self");
            setIsModalVisible(true);
          }}
        />

        <StakeItem
          icon={
            <svg
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              className="w-4 h-4"
              viewBox="0 0 24 24"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          }
          title="Stake on other people"
          description="Some explanation on what this means"
          amount={getCommunityStakeAmount(roundData)}
          buttonText="Stake"
          buttonHandler={() => {
            setStakingType("community");
            setIsModalVisible(true);
          }}
        />
      </div>

      <StakingModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        stakingType={stakingType}
        readContracts={readContracts}
        writeContracts={writeContracts}
        tx={tx}
        address={address}
        userSigner={userSigner}
        round={round}
        targetNetwork={targetNetwork}
        mainnetProvider={mainnetProvider}
      />
    </>
  );
};

export default Rounds;
