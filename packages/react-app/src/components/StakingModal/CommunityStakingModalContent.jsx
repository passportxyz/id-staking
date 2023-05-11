// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Button, Input, Row, Col, notification } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import AddressInput from "../AddressInput";
import DisplayAddressEns from "../DisplayAddressEns";
import { getCommunityStakeAmount } from "./utils";
import CommonStakingModalContent from "./CommonStakingModalContent";

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

// starting all loaded values
const initialLoadedValues = {
  0: "0",
  1: "0",
  2: "0",
  3: "0",
  4: "0",
  5: "0",
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
  mainnetProvider,
  handleStakingTransaction,
}) {
  const [numberOfCommunityStakes, setNumberOfCommunityStakes] = useState(1);
  const [allStakeAmounts, setAllStakeAmounts] = useState(initialStakeAmounts);
  const [allStakeAddresses, setAllStakeAddresses] = useState(initialStakeAddresses);
  // array of amounts loaded from existing stakes
  const [allLoadedAmounts, setAllLoadedAmounts] = useState(initialLoadedValues);

  /////////// UNCOMMENT TO HELP WITH DEBUGGING
  // useEffect(() => {
  //   console.log(
  //     `allStakeAddresses: ${Object.values(allStakeAddresses)} \n\nallStakeAmounts: ${Object.values(
  //       allStakeAmounts,
  //     )} \n\nallLoadedAmounts: ${Object.values(allLoadedAmounts)}`,
  //   );
  // }, [allStakeAddresses, allStakeAmounts, allLoadedAmounts]);

  // set starting amount on modal open
  useEffect(() => {
    const communityStakeAmount = getCommunityStakeAmount(roundData);
    if (isModalVisible && communityStakeAmount && parseFloat(communityStakeAmount) > 0) {
      const xstakes = roundData?.user?.xstakeTo;
      if (xstakes.length > 0) {
        setNumberOfCommunityStakes(xstakes.length);
        const tempAddresses = {};
        const tempAmounts = {};
        const tempLoadedAmounts = {};
        // populate modal with each loaded amount and address
        xstakes.forEach((element, i) => {
          const tempAmount = parseFloat(ethers.utils.formatUnits(element?.amount.toString(), 18));
          const tempAddress = element?.to?.address;
          if (tempAmount > 0.0 && tempAddress?.length > 0) {
            tempAmounts[i] = tempAmount.toFixed(2).toString();
            tempLoadedAmounts[i] = tempAmount.toFixed(2).toString();
            tempAddresses[i] = tempAddress;
          }
        });
        setAllStakeAddresses(tempAddresses);
        setAllStakeAmounts(tempAmounts);
        setAllLoadedAmounts(tempLoadedAmounts);
      }
    }
  }, [isModalVisible]);

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

  const stakeUsers = async (id, amounts, users) => {
    const stakeTx = tx(writeContracts.IDStaking.stakeUsers(id + "", users, amounts));
    handleStakingTransaction(stakeTx);
    await stakeTx;
  };

  // Allows the user to change stake amount
  const increaseStakeAmount = index => {
    const getCurrentAmount = allStakeAmounts[index] || "0.00";
    const newStakeAmount = parseFloat(getCurrentAmount) + 1.0;
    setAllStakeAmounts({
      ...allStakeAmounts,
      [index]: newStakeAmount.toFixed(2).toString(),
    });
  };

  const decreaseStakeAmount = index => {
    const newStakeAmount = parseFloat(allStakeAmounts[index]) - 1.0;
    const loadedAmount = parseFloat(allLoadedAmounts[index]);
    if ((loadedAmount && newStakeAmount >= loadedAmount) || (!loadedAmount && newStakeAmount >= 0)) {
      setAllStakeAmounts({
        ...allStakeAmounts,
        [index]: newStakeAmount.toFixed(2).toString(),
      });
    }
  };

  // used to remove either address or amount from an index
  /*
    objOfVal -> object of values to remove value from
    index -> index of value to remove
    nullVal -> a null value for array could be a string, undefined or null
    initial -> empty/initial state of objOfVal
  */
  const removeItemAtIndex = (objOfVal, index, nullVal, initial) => {
    const allValues = Object.values(objOfVal);
    let newVal = [];

    // create new array of numbers
    if (index === 0) {
      allValues.shift();
      newVal = allValues.concat(nullVal);
    } else if (index === objOfVal.length) {
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

  const resetAmounts = () => {
    setAllStakeAddresses(initialStakeAddresses);
    setAllStakeAmounts(initialStakeAmounts);
  };

  const onStake = async () => {
    // TODO This code does not work as intended for updating existing lines. refactor this
    const amounts = Object.values(allStakeAmounts);
    let copiedAddresses = allStakeAddresses;
    let canStake = true;

    // filter amounts for 0
    const filteredAmounts = amounts.filter((amount, i) => {
      const currentAmount = parseFloat(amount);
      const loadedAmount = parseFloat(allLoadedAmounts[i]) || 0.0;
      const valid = currentAmount > 0 && currentAmount > loadedAmount;
      // remove the address from list if it belongs to an existing stake that will not change
      if (!valid) {
        copiedAddresses = removeItemAtIndex(allStakeAddresses, i, undefined, initialStakeAddresses);
        //Remove from allLoadedAmounts
        const tempAllLoadedAmounts = removeItemAtIndex(allLoadedAmounts, i, "0", initialLoadedValues);
        setAllLoadedAmounts(tempAllLoadedAmounts);
      }
      return valid;
    });

    // filter addresses for undefined
    const addresses = Object.values(copiedAddresses);
    const filteredAddresses = addresses.filter(address => address !== undefined);

    //Parse units on amounts  and subtract loaded amounts
    const parsedAmounts = [];
    filteredAmounts.forEach((amount, i) => {
      let currentAmount = parseFloat(amount);
      const loadedAmount = parseFloat(allLoadedAmounts[i]) || 0.0;
      //Subtract loaded amount from current amount
      if (loadedAmount > 0) {
        currentAmount -= loadedAmount;
      }
      console.log("current amount ", currentAmount);
      parsedAmounts.push(ethers.utils.parseUnits(currentAmount.toFixed(2).toString()));
    });

    // Block user from community staking on self
    filteredAddresses.forEach(filteredAddress => {
      if (filteredAddress === address) {
        canStake = false;
        return notification.open({
          message: "User Address found in Community Stake",
          description: "Please remove your address as one of the staked address",
          icon: <WarningOutlined style={{ color: "#FFA500" }} />,
        });
      }
    });

    // Final check before allowing user to stake
    if (parsedAmounts.length === filteredAddresses.length && canStake) {
      await stakeUsers(round.toString(), parsedAmounts, filteredAddresses);
    }
  };

  return (
    <CommonStakingModalContent
      title={"Stake on other people"}
      getTotalAmountStaked={getTotalAmountStaked}
      getNewStakeAmount={
        getTotalAmountStaked /* This isn't exactly right, should be fixed along with refactor mentioned above */
      }
      isModalVisible={isModalVisible}
      setIsModalVisible={setIsModalVisible}
      tx={tx}
      address={address}
      writeContracts={writeContracts}
      readContracts={readContracts}
      resetAmounts={resetAmounts}
      onStake={onStake}
      renderStakeForm={disabled => (
        <div className="flex flex-col justify-center overflow--auto">
          <Row gutter={20} style={{ paddingBottom: "10px" }}>
            <Col span={12}>Address</Col>
            <Col span={12}>Amount(GTC)</Col>
          </Row>
          {[...Array(numberOfCommunityStakes)].map((_, i) => (
            <Row gutter={20} style={{ paddingTop: "10px", paddingBottom: "10px" }} key={i}>
              <Col className="gutter-row" span={12}>
                <AddressInput
                  disabled={disabled}
                  value={allStakeAddresses[i]}
                  onChange={e => {
                    const tempAllAddresses = allStakeAddresses;
                    tempAllAddresses[i] = e;
                    setAllStakeAddresses(tempAllAddresses);
                  }}
                  ensProvider={mainnetProvider}
                  placeholder="Address of user"
                />
              </Col>
              <Col className="gutter-row" span={10}>
                <Button disabled={disabled} onClick={e => decreaseStakeAmount(i)}>
                  -
                </Button>
                <Input
                  disabled={disabled}
                  style={{ width: "50%" }}
                  defaultValue={0}
                  value={allStakeAmounts[i]}
                  onChange={e => {
                    const newAmount = e.target.value;
                    setAllStakeAmounts({
                      ...allStakeAmounts,
                      [i]: newAmount,
                    });
                  }}
                />
                <Button disabled={disabled} onClick={e => increaseStakeAmount(i)}>
                  +
                </Button>
              </Col>
              <Col className="gutter-row" span={2}>
                <Button
                  disabled={disabled}
                  style={{ border: "0px" }}
                  onClick={() => {
                    //Remove from allStakeAddresses
                    const tempAllAddresses = removeItemAtIndex(allStakeAddresses, i, undefined, initialStakeAddresses);
                    setAllStakeAddresses(tempAllAddresses);

                    //Remove from allStakeAmounts
                    const tempAllAmounts = removeItemAtIndex(allStakeAmounts, i, "0", initialStakeAmounts);
                    setAllStakeAmounts(tempAllAmounts);

                    //Remove from allLoadedAmounts
                    const tempAllLoadedAmounts = removeItemAtIndex(allLoadedAmounts, i, "0", initialLoadedValues);
                    setAllLoadedAmounts(tempAllLoadedAmounts);

                    // Decrease number of stake inputs
                    setNumberOfCommunityStakes(numberOfCommunityStakes - 1);
                  }}
                >
                  X
                </Button>
              </Col>
            </Row>
          ))}
          <Row style={{ paddingTop: "10px" }}>
            <Col span={24}>
              <Button
                disabled={disabled}
                onClick={() => {
                  setNumberOfCommunityStakes(numberOfCommunityStakes + 1);
                }}
                block
              >
                + Add Address
              </Button>
            </Col>
          </Row>
        </div>
      )}
      renderStakeSummary={total => (
        <>
          <p className="mt-4">
            You’ll be staking a total of{" "}
            <span className="font-bold">
              {total}
              GTC
            </span>{" "}
            on {getTotalNumberOfStakees()} people.
          </p>
          <ul className="ml-4 list-disc">
            {[...Array(numberOfCommunityStakes)].map((_, i) => (
              <li key={i}>
                {`${allStakeAmounts[i]} GTC on `}
                <DisplayAddressEns address={allStakeAddresses[i]} ensProvider={mainnetProvider} />
              </li>
            ))}
          </ul>
        </>
      )}
    />
  );
}
