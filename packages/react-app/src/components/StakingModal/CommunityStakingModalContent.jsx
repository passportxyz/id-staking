import React, { useState, useContext } from "react";
import { Alert, Button, Modal, Input, Form, InputNumber } from "antd";
import { ethers } from "ethers";
import { NETWORKS } from "../../constants";
import AddressInput from "../../components/AddressInput";
import axios from "axios";

import { Web3Context } from "../../helpers/Web3Context";

export default function SelfStakingModalContent({
  isModalVisible,
  setIsModalVisible,
  writeContracts,
  readContracts,
  tx,
  address,
  mainnetProvider,
}) {
  const { currentNetwork, roundInView } = useContext(Web3Context);
  const [form] = Form.useForm();

  const [hasStakeAmount, setHasStakeAmount] = useState(false);
  const approve = async () => {
    tx(writeContracts.Token.approve(readContracts.IDStaking.address, ethers.utils.parseUnits("10000000")));
  };

  const handleStakeUsers = async v => {
    console.log(v);
    await stakeUsers(roundInView, [v.address], [ethers.utils.parseUnits(`${v.amount}`)]);
  };

  const stakeUsers = async (id, users, amounts) => {
    let data = {};

    try {
      const res = await axios({
        method: "POST",
        url: "https://id-staking-passport-api.vercel.app/api/passport/reader",
        data: {
          address,
          domainChainId: NETWORKS[currentNetwork].chainId,
        },
      });

      data = res.data;
    } catch (error) {
      // TODO : Throw notification error
      return null;
    }

    tx(writeContracts.IDStaking.stakeUsers(data.signature, data.nonce, data.timestamp, id + "", users, amounts));
  };

  const handleOk = () => {
    setIsModalVisible(false);
    approve().then(result => localStorage.setItem(`${address}+approvedGtcTransactions`, "true"));
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  return (
    <div>
      <Form
        form={form}
        style={{
          margin: "0px auto",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "0px 10px",
        }}
        initialValues={{ amount: "10" }}
        name="stakeUsers"
        layout="inline"
        onFinish={handleStakeUsers}
      >
        <Form.Item name="address" required>
          <AddressInput ensProvider={mainnetProvider} placeholder="Address of user" />
        </Form.Item>
        <Form.Item name="amount" required>
          <InputNumber min={1} />
        </Form.Item>
      </Form>
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
