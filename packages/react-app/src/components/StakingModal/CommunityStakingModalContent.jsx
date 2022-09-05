import React, { useState, useEffect } from "react";
import { Button, Modal, Input, Form, Row, Col, notification } from "antd";
import { ethers } from "ethers";
import axios from "axios";
import AddressInput from "../AddressInput";

import { ERC20ABI, appName, tokenAddress } from "./utils";

const token = "GTC";

// starting all stake amounts
const initialStakeAmounts = {
  0: "0",
  1: "0",
  2: "0",
  3: "0",
  4: "0",
  5: "0",
};

// starting all stake addresses
const initialStakeAddresses = {
  0: undefined,
  1: undefined,
  2: undefined,
  3: undefined,
  4: undefined,
  5: undefined,
};

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
  const [modalStatus, setModalStatus] = useState(1);
  const [numberOfCommunityStakes, setNumberOfCommunityStakes] = useState(1);
  const [allStakeAmounts, setAllStakeAmounts] = useState(initialStakeAmounts);
  const [allStakeAddresses, setAllStakeAddresses] = useState(initialStakeAddresses);

  /*
  Modal Status
  
  1) Not Approved
  2) Approving
  3) Ready To Stake
  4) Staking
  */

  // const refreshTokenDetails = async () => {
  //   const readUpdate = new ethers.Contract(tokenAddress, ERC20ABI, userSigner);
  //   const decimals = await readUpdate.decimals();
  //   const allowance = await readUpdate.allowance(address, writeContracts?.IDStaking?.address);
  //   const balance = await readUpdate.balanceOf(address);

  //   const adjustedAmount = ethers.utils.parseUnits(stakeAmount.toString() || "0", decimals);
  //   const hasEnoughAllowance = allowance.lt(adjustedAmount);

  //   setTokenInfo({ ...tokenInfo, [token]: { decimals, allowance, tokenAddress, balance } });

  //   if (balance.isZero()) {
  //     setModalStatus(5);
  //   } else {
  //     if (allowance.isZero() || hasEnoughAllowance) {
  //       setModalStatus(1);
  //     } else {
  //       setModalStatus(3);
  //     }
  //   }
  //   console.log("view modal status ", modalStatus);
  // };

  useEffect(() => {
    console.log("changein allStakeAddresses ", allStakeAddresses);
    console.log("changein allStakeAmounts ", allStakeAmounts);
  }, [allStakeAddresses, allStakeAmounts]);

  // Sums up all the stake amounts entered on screen
  const getTotalAmountStaked = () => {
    const amounts = Object.values(allStakeAmounts);
    let total = 0;
    amounts.forEach(amount => {
      total += parseFloat(amount);
    });
    return total;
  };

  const getTotalNumberOfStakees = () => {
    const stakees = Object.values(allStakeAddresses);
    let total = 0;
    stakees.forEach(stakee => {
      if (stakee !== undefined) total++;
    });
    return total;
  };

  const approveTokenAllowance = async () => {
    setModalStatus(2);
    await approve();
    setModalStatus(3);
  };

  const stakeUsers = async (id, amounts, users) => {
    let data = {};

    try {
      console.log("start ", address, targetNetwork.chainId);
      const res = await axios({
        method: "POST",
        url: "https://id-staking-passport-api.vercel.app/api/passport/reader",
        data: {
          address,
          domainChainId: targetNetwork.chainId,
        },
      });

      data = res.data;
      console.log("success ", data);
    } catch (e) {
      notification.open({
        message: "Staking unsuccessful",
        description: `Error: ${e.message}`,
      });
      return null;
    }

    tx(writeContracts.IDStaking.stakeUsers(data.signature, data.nonce, data.timestamp, id + "", users, amounts));
  };

  const increaseStakeAmount = index => {
    const newStakeAmount = parseFloat(allStakeAmounts[index]) + 1.0;
    setAllStakeAmounts({
      ...allStakeAmounts,
      [index]: newStakeAmount.toString(),
    });
  };

  const decreaseStakeAmount = index => {
    const newStakeAmount = parseFloat(allStakeAmounts[index]) - 1.0;
    if (newStakeAmount >= 0) {
      setAllStakeAmounts({
        ...allStakeAmounts,
        [index]: newStakeAmount.toString(),
      });
    }
  };

  const getStakeAddressAtIndex = index => {
    const addresslookup = allStakeAddresses[index];
    let displayAddress = addresslookup?.substr(0, 5) + "..." + addresslookup?.substr(-4);
    return displayAddress;
  };

  // Modal Visibility Functions
  const approve = async () => {
    await tx(writeContracts.Token.approve(readContracts.IDStaking.address, ethers.utils.parseUnits("10000000")));
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // used to remove either address or amount from an index
  const removeItemAtIndex = (arrayOfVal, index, nullVal, initial) => {
    const allValues = Object.values(arrayOfVal);
    let newVal = [];

    // create new array of numbers
    if (index === 0) {
      allValues.shift();
      newVal = allValues.concat(nullVal);
    } else if (index === arrayOfVal.length) {
      allValues.pop();
      newVal = allValues.concat(nullVal);
    } else {
      const start = allValues.slice(0, index);
      const end = allValues.slice(index + 1, allValues.length);
      newVal = start.concat(end, nullVal);
    }

    // copy initial object to update
    const newValues = initial;

    // create new array objects
    newVal.forEach((amount, i) => {
      newValues[i] = amount;
    });

    return newValues;
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
          loading={modalStatus === 4}
          onClick={async () => {
            const amounts = Object.values(allStakeAmounts);
            const addresses = Object.values(allStakeAddresses);

            // filter amounts for 0
            const filteredAmounts = amounts.filter(amount => parseFloat(amount) > 0);
            // filter addresses for undefined
            const filteredAddresses = addresses.filter(address => address !== undefined);

            console.log("all amounts ", amounts, "all addresses ", addresses, targetNetwork.chainId);
            if (filteredAmounts.length === filteredAddresses.length) {
              setModalStatus(4);
              await stakeUsers(round.toString(), filteredAmounts, filteredAddresses);
              setModalStatus(3);
              notification.open({
                message: "Staking Successful",
              });
              setIsModalVisible(false);
            }
          }}
          disabled={modalStatus === 1 || getTotalAmountStaked() <= 0}
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
              <Button onClick={e => decreaseStakeAmount(i)}>-</Button>
              <Input
                style={{ width: "50%" }}
                defaultValue={0}
                value={allStakeAmounts[i]}
                onChange={e => {
                  const newAmount = e.target.value;
                  setAllStakeAmounts({
                    ...allStakeAmounts,
                    [i]: newAmount,
                  });
                  console.log(`update-all amounts ${i}: ${e}, all: ${JSON.stringify(newAmount)}`);
                }}
              />
              <Button onClick={e => increaseStakeAmount(i)}>+</Button>
            </Col>
            <Col className="gutter-row" span={2}>
              <Button
                style={{ border: "0px" }}
                onClick={() => {
                  //Remove from allStakeAddresses
                  const tempAllAddresses = removeItemAtIndex(allStakeAddresses, i, undefined, initialStakeAddresses);
                  setAllStakeAddresses(tempAllAddresses);
                  //Remove from allStakeAmounts
                  const tempAllAmounts = removeItemAtIndex(allStakeAmounts, i, "0", initialStakeAmounts);
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

        {getTotalAmountStaked() > 0 && (modalStatus === 3 || modalStatus === 4) && (
          <>
            <p className="mt-4">
              You’ll be staking a total of <span className="font-bold">{getTotalAmountStaked()} GTC</span> on{" "}
              {getTotalNumberOfStakees()} people.
            </p>
            <ul className="ml-4 list-disc">
              {[...Array(numberOfCommunityStakes)].map((_, i) => (
                <li>{`${allStakeAmounts[i]} GTC to ${getStakeAddressAtIndex(i)}`}</li>
              ))}
            </ul>
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
          </>
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
