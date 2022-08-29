import React, { useState, useEffect } from "react";
import { Button, Modal, InputNumber, Form, Row, Col } from "antd";
import { ethers } from "ethers";
import axios from "axios";
import AddressInput from "../AddressInput";

import { ERC20ABI, appName, tokenAddress } from "./utils";

const token = "GTC";

export default function CommunityStakingModalContent({
  writeContracts,
  readContracts,
  tx,
  address,
  isModalVisible,
  setIsModalVisible,
  userSigner,
  round,
  mainnetProvider,
  targetNetwork,
}) {
  const [stakeAmount, setStakeAmount] = useState(0);
  const [modalStatus, setModalStatus] = useState(1);
  const [numberOfCommunityStakes, setNumberOfCommunityStakes] = useState(1);
  const [allStakeAmounts, setAllStakeAmounts] = useState({});
  const [allStakeAddresses, setAllStakeAddresses] = useState({});

  /*
  Modal Status
  
  1) Not Approved
  2) Approving
  3) Ready To Stake
  4) Staking
  */

  const [tokenInfo, setTokenInfo] = useState({});

  const refreshTokenDetails = async () => {
    const readUpdate = new ethers.Contract(tokenAddress, ERC20ABI, userSigner);
    const decimals = await readUpdate.decimals();
    const allowance = await readUpdate.allowance(address, writeContracts?.IDStaking?.address);
    const balance = await readUpdate.balanceOf(address);

    const adjustedAmount = ethers.utils.parseUnits(stakeAmount.toString() || "0", decimals);
    const hasEnoughAllowance = allowance.lt(adjustedAmount);

    setTokenInfo({ ...tokenInfo, [token]: { decimals, allowance, tokenAddress, balance } });

    if (balance.isZero()) {
      setModalStatus(5);
    } else {
      if (allowance.isZero() || hasEnoughAllowance) {
        setModalStatus(1);
      } else {
        setModalStatus(3);
      }
    }
    console.log("view modal status ", modalStatus);
  };

  useEffect(() => {
    console.log("stake amount ", stakeAmount);
  }, [stakeAmount]);

  const approveTokenAllowance = async () => {
    setModalStatus(2);
    await approve();
    await refreshTokenDetails();
  };

  const stake = async (id, amount) => {
    console.log("stake starting ", id, typeof amount);
    tx(writeContracts.IDStaking.stake(id + "", ethers.utils.parseUnits(amount)));
  };

  const stakeUsers = async (id, users, amounts) => {
    let data = {};

    try {
      const res = await axios({
        method: "POST",
        url: "https://id-staking-passport-api.vercel.app/api/passport/reader",
        data: {
          address,
          domainChainId: targetNetwork.chainId,
        },
      });

      data = res.data;
    } catch (error) {
      // TODO : Throw notification error
      return null;
    }

    tx(writeContracts.IDStaking.stakeUsers(data.signature, data.nonce, data.timestamp, id + "", users, amounts));
  };

  const increaseStakeAmount = () => {
    const newStakeAmount = parseFloat(stakeAmount.toString()) + 1.0;
    setStakeAmount(parseFloat(newStakeAmount.toString()));
  };

  const decreaseStakeAmount = () => {
    const newStakeAmount = parseFloat(stakeAmount.toString()) - 1.0;
    setStakeAmount(parseFloat(newStakeAmount.toString()));
  };

  // Modal Visibility Functions
  const approve = async () => {
    await tx(writeContracts.Token.approve(readContracts.IDStaking.address, ethers.utils.parseUnits("10000000")));
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Modal
      title={<span className="font-libre-franklin">Stake on other people</span>}
      visible={isModalVisible}
      onCancel={handleCancel}
      okText={`Create a Passport`}
      footer={[
        <Button
          onClick={async () => await approveTokenAllowance()}
          hidden={modalStatus === 3}
          key="Approve GTC"
          loading={modalStatus === 2}
          className="rounded-sm rounded bg-purple-connectPurple py-2 px-10 text-white"
          style={{ backgroundColor: "#6F3FF5", color: "white" }}
        >
          Approve GTC
        </Button>,
        <Button
          onClick={async () => {
            const amounts = Object.values(allStakeAmounts);
            const addresses = Object.values(allStakeAddresses);
            console.log("all amounts ", amounts, "all addresses ", addresses);
            if (amounts.length === address.length) {
              // await stakeUsers(round.toString(), amounts, addresses);
            }
          }}
          disabled={modalStatus === 1 || !(stakeAmount > 0)}
          key="Stake"
          style={{ backgroundColor: "#6F3FF5", color: "white" }}
        >
          Stake
        </Button>,
      ]}
    >
      <p>Your stake amount (in GTC)</p>

      <div className="flex flex-col justify-center overflow--auto">
        <Row gutter={20} style={{ paddingBottom: "20px" }}>
          <Col span={12}>Address</Col>
          <Col span={12}>Amount(GTC)</Col>
        </Row>
        {[...Array(numberOfCommunityStakes)].map((_, i) => (
          <Row gutter={20} style={{ paddingTop: "10px", paddingBottom: "10px" }}>
            <Col className="gutter-row" span={12}>
              <AddressInput
                onChange={e => {
                  const tempAllAddresses = allStakeAddresses;
                  tempAllAddresses[i] = e;
                  setAllStakeAddresses(tempAllAddresses);
                  console.log(`update-all address ${i}: ${e}, all: ${JSON.stringify(tempAllAddresses)}`);
                }}
                ensProvider={mainnetProvider}
                placeholder="Address of user"
              />
            </Col>
            <Col className="gutter-row" span={10}>
              <Button onClick={increaseStakeAmount}>+</Button>
              <InputNumber
                min={0}
                onChange={e => {
                  const tempAllAmounts = allStakeAmounts;
                  tempAllAmounts[i] = e;
                  setAllStakeAmounts(tempAllAmounts);
                  console.log(`update-all amounts ${i}: ${e}, all: ${JSON.stringify(tempAllAmounts)}`);
                  setStakeAmount(e);
                }}
              />
              <Button onClick={decreaseStakeAmount}>-</Button>
            </Col>
            <Col className="gutter-row" span={2}>
              <Button
                style={{ border: "0px" }}
                onClick={() => {
                  //Remove from allStakeAddresses
                  const tempAllAddresses = allStakeAddresses;
                  tempAllAddresses[i] = undefined;
                  setAllStakeAddresses(tempAllAddresses);
                  //Remove from allStakeAmounts
                  const tempAllAmounts = allStakeAmounts;
                  tempAllAmounts[i] = undefined;
                  setAllStakeAmounts(tempAllAmounts);
                  // Decrease number of stake inputs
                  setNumberOfCommunityStakes(numberOfCommunityStakes - 1);
                }}
              >
                X
              </Button>
            </Col>
          </Row>
        ))}
        <Row>
          <Col span={24}>
            <Button
              onClick={() => {
                if (numberOfCommunityStakes < 6) {
                  setNumberOfCommunityStakes(numberOfCommunityStakes + 1);
                }
              }}
              block
            >
              + Add Address
            </Button>
          </Col>
        </Row>

        {stakeAmount > 0 && (
          <div className="border-2 border-gray-200 px-4 py-6 rounded-lg bg-yellow-200 mt-4">
            <h1>Important!</h1>
            <ul className="list-disc ml-4">
              <li>
                Your staked GTC will be locked when the grant round starts, and you will not be able to withdraw it
                until two weeks after the round ends
              </li>
              <li>
                The staking contract has been checked by our engineering team, but it has not been audited by a
                professional audit firm. Please proceed with your own risk.
              </li>
            </ul>
          </div>
        )}
      </div>

      {modalStatus === 1 && (
        <div className="mt-4 border-2 border-blue-alertBorder px-4 py-6 rounded-md bg-blue-alertBg font-libre-franklin">
          To get started, you first need to approve GTC for Identity Staking.
        </div>
      )}
    </Modal>
  );
}
