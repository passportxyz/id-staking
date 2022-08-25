import React, { useEffect, useState } from "react";
import { Alert, Button, Modal, Input } from "antd";
import { ethers } from "ethers";
import SelfStakingModalContent from "./SelfStakingModalContent";
import CommunityStakingModalContent from "./CommunityStakingModalContent";

export default function SelfModal({
  isModalVisible,
  setIsModalVisible,
  stakingType,
  writeContracts,
  readContracts,
  tx,
  address,
}) {
  const [approvedGtc, setApprovedGtc] = useState(false);

  useEffect(() => {
    const checkApproved = localStorage.getItem(`${address}+approvedGtcTransactions`);
    if (checkApproved) {
      setApprovedGtc(true);
    }
  }, []);

  const approve = async () => {
    tx(writeContracts.Token.approve(readContracts.IDStaking.address, ethers.utils.parseUnits("10000000")));
  };

  // Modal Visibility Functions
  const handleOk = () => {
    setIsModalVisible(false);
    approve().then(result => localStorage.setItem(`${address}+approvedGtcTransactions`, "true"));
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Modal
      title={stakingType === "self" ? "Stake on yourself" : "Stake on other people"}
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={`Create a Passport`}
      footer={[
        <button
          onClick={() => setIsModalVisible(false)}
          hidden={!approvedGtc}
          key="Approve GTC"
          className="rounded-sm rounded bg-purple-connectPurple py-2 px-10 text-white"
        >
          Approve GTC
        </button>,
        <button
          onClick={() => setIsModalVisible(false)}
          disabled={!approvedGtc}
          key="Stake"
          className="rounded-sm rounded bg-purple-connectPurple py-2 px-10 text-white"
        >
          Stake
        </button>,
      ]}
    >
      <p>Your stake amount (in GTC)</p>
      {stakingType === "self" && (
        <SelfStakingModalContent
          writeContracts={writeContracts}
          readContracts={readContracts}
          tx={tx}
          address={address}
        />
      )}
      {/* {stakingType === "community" && (
        <CommunityStakingModalContent
          writeContracts={writeContracts}
          readContracts={readContracts}
          tx={tx}
          address={address}
        />
      )} */}
      {!approvedGtc && (
        <div className="border-2 border-gray-200 px-4 py-6 rounded-lg bg-purple-200">
          To get started, you first need to approve GTC for Identity Staking.
        </div>
      )}
    </Modal>
  );
}
