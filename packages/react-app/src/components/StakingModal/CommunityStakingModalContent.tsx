import React, { useState, useEffect, useMemo } from "react";
import { Button, Input, Row, Col, notification } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import AddressInput from "../AddressInput";
import DisplayAddressEns from "../DisplayAddressEns";
import { getCommunityStakeAmount, parseGtc, formatGtc } from "./utils";
import CommonStakingModalContent from "./CommonStakingModalContent";
import { IndexedStakeData } from "../../types";

type StakeAmounts = { [key: number]: ethers.BigNumber };
type StakeAddresses = { [key: number]: string | undefined };
type NewStake = { address: string; amount: ethers.BigNumber };

// starting all stake amounts
const initialStakeAmounts: StakeAmounts = {
  0: ethers.BigNumber.from("0"),
  1: ethers.BigNumber.from("0"),
  2: ethers.BigNumber.from("0"),
  3: ethers.BigNumber.from("0"),
  4: ethers.BigNumber.from("0"),
  5: ethers.BigNumber.from("0"),
};

// starting all stake addresses
const initialStakeAddresses: StakeAddresses = {
  0: undefined,
  1: undefined,
  2: undefined,
  3: undefined,
  4: undefined,
  5: undefined,
};

// starting all loaded values
const initialLoadedValues: StakeAmounts = {
  0: ethers.BigNumber.from("0"),
  1: ethers.BigNumber.from("0"),
  2: ethers.BigNumber.from("0"),
  3: ethers.BigNumber.from("0"),
  4: ethers.BigNumber.from("0"),
  5: ethers.BigNumber.from("0"),
};

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
  mainnetProvider,
  handleStakingTransaction,
}: CommunityStakingModalContentProps) {
  const [numberOfCommunityStakes, setNumberOfCommunityStakes] = useState(1);
  const [allStakeAmounts, setAllStakeAmounts] = useState<StakeAmounts>(initialStakeAmounts);
  const [allStakeAddresses, setAllStakeAddresses] = useState<StakeAddresses>(initialStakeAddresses);
  // array of amounts loaded from existing stakes
  const [allLoadedAmounts, setAllLoadedAmounts] = useState<StakeAmounts>(initialLoadedValues);

  const [newStakes, setNewStakes] = useState<NewStake[]>([]);
  const [newStakesTotal, setNewStakesTotal] = useState<ethers.BigNumber>(ethers.BigNumber.from("0"));

  const totalAmountStaked = useMemo(() => {
    // Sums up all the stake amounts entered on screen
    const amounts = Object.values(allStakeAmounts);
    let total = ethers.BigNumber.from("0");
    amounts.forEach(amount => {
      total = total.add(amount);
    });
    return total;
  }, [allStakeAmounts]);

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
    if (isModalVisible && communityStakeAmount && communityStakeAmount.gt(0)) {
      const xstakes = roundData?.user?.xstakeTo;
      if (xstakes?.length) {
        setNumberOfCommunityStakes(xstakes.length);
        const tempAddresses: StakeAddresses = {};
        const tempAmounts: StakeAmounts = {};
        const tempLoadedAmounts: StakeAmounts = {};
        // populate modal with each loaded amount and address
        xstakes.forEach((element, i) => {
          const amount = ethers.BigNumber.from(element?.amount || "0");
          const address = element?.to?.address;
          if (amount?.gt(0) && address?.length > 0) {
            tempAmounts[i] = amount;
            tempLoadedAmounts[i] = amount;
            tempAddresses[i] = address;
          }
        });
        setAllStakeAddresses(tempAddresses);
        setAllStakeAmounts(tempAmounts);
        setAllLoadedAmounts(tempLoadedAmounts);
      }
    }
  }, [isModalVisible, roundData]);

  const stakeUsers = async (roundId: string, amounts: ethers.BigNumber[], users: string[]) => {
    console.log("stakeUsers", roundId, amounts, users);
    const stakeTx = tx(writeContracts.IDStaking.stakeUsers(roundId, users, amounts));
    handleStakingTransaction(stakeTx);
    await stakeTx;
  };

  // Allows the user to change stake amount
  const increaseStakeAmount = (index: keyof StakeAmounts) => {
    const currentAmount = allStakeAmounts[index] || ethers.BigNumber.from("0");
    const newStakeAmount = currentAmount.add(parseGtc("1"));
    setAllStakeAmounts({
      ...allStakeAmounts,
      [index]: newStakeAmount,
    });
  };

  const decreaseStakeAmount = (index: keyof StakeAmounts) => {
    const currentAmount = allStakeAmounts[index] || ethers.BigNumber.from("0");
    const newStakeAmount = currentAmount.sub(parseGtc("1"));
    setAllStakeAmounts({
      ...allStakeAmounts,
      [index]: newStakeAmount,
    });
  };

  // used to remove either address or amount from an index
  /*
    objOfVal -> object of values to remove value from
    index -> index of value to remove
    nullVal -> a null value for array could be a string, undefined or null
    initial -> empty/initial state of objOfVal
  */
  const removeItemAtIndex = <T,>(
    objOfVal: { [key: number]: T },
    index: number,
    nullVal: T,
    initial: { [key: number]: T },
  ) => {
    const allValues = Object.values(objOfVal);
    let newVal = [];

    // create new array of numbers
    if (index === 0) {
      allValues.shift();
      newVal = allValues.concat(nullVal);
    } else if (index === Object.keys(objOfVal).length) {
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

  useEffect(() => {
    (async () => {
      const newStakes: NewStake[] = Object.values(allStakeAmounts).reduce((newStakes, amount, index) => {
        const address = allStakeAddresses[index];
        const loadedAmount = allLoadedAmounts[index] || ethers.BigNumber.from("0");
        if (amount.gt(0) && amount.gt(loadedAmount) && address?.length) {
          const newAmount = amount.sub(loadedAmount);
          newStakes.push({ address, amount: newAmount });
        }
        return newStakes;
      }, Array<NewStake>());

      setNewStakes(newStakes);
      setNewStakesTotal(
        newStakes.reduce((total, stake) => {
          return total.add(stake.amount);
        }, ethers.BigNumber.from("0")) || ethers.BigNumber.from("0"),
      );
    })();
  }, [allStakeAmounts]);

  const onStake = async () => {
    let canStake = true;

    // Block user from community staking on self
    newStakes.forEach(stake => {
      if (stake.address === address) {
        canStake = false;
        return notification.open({
          message: "User Address found in Community Stake",
          description: "Please remove your address as one of the staked address",
          icon: <WarningOutlined style={{ color: "#FFA500" }} />,
        });
      }
    });

    // Final check before allowing user to stake
    if (newStakes.length && canStake) {
      const amountsToStake = newStakes.map(stake => stake.amount);
      const addressesToStakeOn = newStakes.map(stake => stake.address);
      await stakeUsers(round.toString(), amountsToStake, addressesToStakeOn);
    }
  };
  return (
    <CommonStakingModalContent
      title={"Stake on other people"}
      totalAmountStaked={totalAmountStaked}
      newStakeAmount={newStakesTotal}
      isModalVisible={isModalVisible}
      setIsModalVisible={setIsModalVisible}
      tx={tx}
      address={address}
      writeContracts={writeContracts}
      readContracts={readContracts}
      resetAmounts={resetAmounts}
      onStake={onStake}
      renderStakeForm={(disabled: boolean) => (
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
                  onChange={(address: string) => {
                    const tempAllAddresses = allStakeAddresses;
                    tempAllAddresses[i] = address;
                    setAllStakeAddresses(tempAllAddresses);
                  }}
                  ensProvider={mainnetProvider}
                  placeholder="Address of user"
                />
              </Col>
              <Col className="gutter-row" span={10}>
                <Button disabled={disabled} onClick={() => decreaseStakeAmount(i)}>
                  -
                </Button>
                <Input
                  disabled={disabled}
                  style={{ width: "50%" }}
                  defaultValue={0}
                  value={formatGtc(allStakeAmounts[i] || 0)}
                  onChange={e => {
                    const newAmount = parseGtc(e.target.value);
                    setAllStakeAmounts({
                      ...allStakeAmounts,
                      [i]: newAmount,
                    });
                  }}
                />
                <Button disabled={disabled} onClick={() => increaseStakeAmount(i)}>
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
                    const tempAllAmounts = removeItemAtIndex(
                      allStakeAmounts,
                      i,
                      ethers.BigNumber.from("0"),
                      initialStakeAmounts,
                    );
                    setAllStakeAmounts(tempAllAmounts);

                    //Remove from allLoadedAmounts
                    const tempAllLoadedAmounts = removeItemAtIndex(
                      allLoadedAmounts,
                      i,
                      ethers.BigNumber.from("0"),
                      initialLoadedValues,
                    );
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
      renderStakeSummary={() => (
        <>
          <p className="mt-4">
            You’ll be staking a total of <span className="font-bold">{formatGtc(newStakesTotal)} GTC</span> on{" "}
            {newStakes.length} people.
          </p>
          <ul className="ml-4 list-disc">
            {newStakes.map(({ address, amount }, i) => (
              <li key={i}>
                {`${formatGtc(amount)} GTC on `}
                <DisplayAddressEns address={address} ensProvider={mainnetProvider} />
              </li>
            ))}
          </ul>
        </>
      )}
    />
  );
}
