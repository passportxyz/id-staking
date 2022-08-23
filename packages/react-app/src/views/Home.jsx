import React from "react";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { Button, Divider } from "antd";
import axios from "axios";
import { Rounds } from "../components";

const zero = ethers.BigNumber.from("0");

function Home({ tx, readContracts, address, writeContracts, targetNetwork, mainnetProvider }) {
  const tokenBalance = ethers.utils.formatUnits(
    useContractReader(readContracts, "Token", "balanceOf", [address]) || zero,
  );
  const tokenSymbol = useContractReader(readContracts, "Token", "symbol");
  const latestRound = (useContractReader(readContracts, "IDStaking", "latestRound", []) || zero).toNumber();

  const rounds = [...Array(latestRound).keys()].map(i => i + 1).reverse();

  const mintToken = async () => {
    tx(writeContracts.Token.mintAmount(ethers.utils.parseUnits("1000")));
  };

  const approve = async () => {
    tx(writeContracts.Token.approve(readContracts.IDStaking.address, ethers.utils.parseUnits("10000000")));
  };

  const stake = async (id, amount) => {
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

  const unstake = async (id, amount) => {
    tx(writeContracts.IDStaking.unstake(id + "", ethers.utils.parseUnits(amount)));
  };

  const unstakeUsers = async (id, users) => {
    tx(writeContracts.IDStaking.unstakeUsers(id + "", users));
  };

  const migrate = async id => {
    tx(writeContracts.IDStaking.migrateStake(id + ""));
  };

  return (
    <>
      <div
        style={{
          paddingBottom: "20px",
          maxWidth: "600px",
          margin: "60px auto 20px auto",
          // border: "1px solid",
        }}
      >
        <div style={{ marginTop: "30px" }}>
          <Divider>GTC Token</Divider>
          <div style={{ marginBottom: "10px" }}>
            Token Balance: {tokenBalance} {tokenSymbol}
          </div>

          <div style={{ width: "100%" }}>
            <Button style={{ marginRight: "10px" }} onClick={mintToken}>
              Mint 1000 {tokenSymbol}
            </Button>
            <Button style={{ marginRight: "10px" }} onClick={approve}>
              Approve Stake contract for GTC
            </Button>
          </div>
        </div>
      </div>

      {rounds.map(r => (
        <Rounds
          key={r}
          round={r}
          stake={stake}
          unstake={unstake}
          address={address}
          migrate={migrate}
          stakeUsers={stakeUsers}
          latestRound={latestRound}
          tokenSymbol={tokenSymbol}
          unstakeUsers={unstakeUsers}
          readContracts={readContracts}
          mainnetProvider={mainnetProvider}
        />
      ))}
    </>
  );
}

export default Home;
