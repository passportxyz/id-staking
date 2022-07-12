import React, { useState } from "react";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { Button, Divider, Typography } from "antd";
import { MultiAddressInput } from "../components";
// import { Link } from "react-router-dom";

// TODO : Stake, unstake, challenge

const zero = ethers.BigNumber.from("0");

function Home({ tx, readContracts, address, writeContracts, mainnetProvider }) {
  const [challengeAddresses, setChallengeAddresses] = useState([]);

  const tokenBalance = ethers.utils.formatUnits(
    useContractReader(readContracts, "Token", "balanceOf", [address]) || zero,
  );
  const tokenSymbol = useContractReader(readContracts, "Token", "symbol");
  const stakes = useContractReader(readContracts, "Staking", "getStakeFor", [address]) || {};
  const stakedBalance = ethers.utils.formatUnits(stakes.balance || zero);

  const mintToken = async () => {
    tx(writeContracts.Token.mintAmount(ethers.utils.parseUnits("100")));
  };

  const approve = async () => {
    tx(writeContracts.Token.approve(readContracts.Staking.address, ethers.utils.parseUnits("10000000")));
  };

  const stake = async amount => {
    amount = amount || tokenBalance;

    tx(writeContracts.Staking.stake(ethers.utils.parseUnits(amount)));
  };

  const unstake = async amount => {
    amount = amount || tokenBalance;

    tx(writeContracts.Staking.unstake(ethers.utils.parseUnits(amount)));
  };

  const challenge = async () => {
    console.log(writeContracts.Staking.challenge);
    tx(writeContracts.Staking.challenge(challengeAddresses));
  };

  return (
    <div
      style={{
        paddingTop: "20px",
        paddingBottom: "20px",
        maxWidth: "600px",
        margin: "20px auto",
        border: "1px solid",
      }}
    >
      <div>
        Token Balance: {tokenBalance} {tokenSymbol}
      </div>
      <div>
        Staked Balance: {stakedBalance} {tokenSymbol}
      </div>
      <div>
        Stake Locked:{" "}
        <Typography.Text type={stakes.locked ? "danger" : "success"}>{stakes.locked ? "Yes" : "No"}</Typography.Text>{" "}
      </div>

      <div style={{ marginTop: "20px" }}>
        <Divider>Stake</Divider>
        <div style={{ width: "100%" }}>
          <Button style={{ marginRight: "10px" }} onClick={mintToken}>
            Mint
          </Button>
          <Button style={{ marginRight: "10px" }} onClick={approve}>
            Approve GTC
          </Button>
          <Button style={{ marginRight: "10px" }} onClick={() => stake("20")}>
            Stake 20 {tokenSymbol}
          </Button>
          <Button style={{ marginRight: "10px" }} onClick={() => stake()}>
            Stake All
          </Button>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Divider>Unstake</Divider>
        <div style={{ width: "100%" }}>
          <Button style={{ marginRight: "10px" }} disabled={stakes.locked} onClick={() => unstake("20")}>
            Unstake 20 {tokenSymbol}
          </Button>
          <Button style={{ marginRight: "10px" }} disabled={stakes.locked} onClick={() => unstake()}>
            Unstake All
          </Button>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Divider>Challenge</Divider>
        <div style={{ width: "100%", paddingLeft: "10px", paddingRight: "10px" }}>
          <MultiAddressInput
            ensProvider={mainnetProvider}
            placeholder="Enter addresses for the challenge"
            onChange={adds => setChallengeAddresses(adds)}
          />

          <Button style={{ marginTop: "10px" }} onClick={challenge} disabled={challengeAddresses.length === 0}>
            Submit challenges
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Home;
