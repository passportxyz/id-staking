import React from "react";
import { Form } from "antd";
import { ethers } from "ethers";
import { useState } from "react";
import StakeItem from "./StakeItem";
import StakingModal from "./StakingModal/StakingModal";
import { UsergroupAddOutlined, UserOutlined } from "@ant-design/icons";

import { getSelfStakeAmount, getCommunityStakeAmount } from "./StakingModal/utils";

const zero = ethers.BigNumber.from("0");

export const STARTING_GRANTS_ROUND = 14;

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
          icon={<UserOutlined style={{ fontSize: "25px" }} />}
          title="Self Staking"
          description="Stake GTC on yourself"
          amount={getSelfStakeAmount(roundData)}
          buttonText={getSelfStakeAmount(roundData) ? "Modify Stake" : "Stake"}
          buttonHandler={() => {
            setStakingType("self");
            setIsModalVisible(true);
          }}
        />

        <StakeItem
          icon={<UsergroupAddOutlined style={{ fontSize: "25px" }} />}
          title="Community Staking"
          description="Stake GTC on other people"
          amount={getCommunityStakeAmount(roundData)}
          buttonText={getSelfStakeAmount(roundData) ? "Modify Stake" : "Stake"}
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
