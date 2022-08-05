import React from "react";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { Button, Divider, Form, InputNumber } from "antd";
import moment, { duration } from "moment";

// TODO : Stake, unstake, challenge

const zero = ethers.BigNumber.from("0");

function Home({ tx, readContracts, address, writeContracts, mainnetProvider }) {
  const [form] = Form.useForm();

  const tokenBalance = ethers.utils.formatUnits(
    useContractReader(readContracts, "Token", "balanceOf", [address]) || zero,
  );
  const tokenSymbol = useContractReader(readContracts, "Token", "symbol");
  const stakedBalance = ethers.utils.formatUnits(
    useContractReader(readContracts, "Staking", "getStakeFor", [address]) || zero,
  );
  const [start, duration, isActiveRound] = useContractReader(readContracts, "Staking", "fetchMeta", []) || [];

  console.log({ isActiveRound });

  const initialize = async v => {
    const durationInSeconds = 86400 * parseInt(v.duration);
    // const startInSeconds = Math.floor(Date.now() / 1000) + 120;
    const startInSeconds = Math.floor(Date.now() / 1000) + 60;

    tx(writeContracts.Staking.updateMeta(startInSeconds, durationInSeconds));
  };

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
    amount = amount || stakedBalance;

    tx(writeContracts.Staking.unstake(ethers.utils.parseUnits(amount)));
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
      {start && start.gt(zero) && (
        <div>Start: {moment.unix(start.toString()).format("dddd, MMMM Do YYYY, h:mm:ss a")}</div>
      )}
      {duration && duration.gt(zero) && (
        <div>End: {moment.unix(start.add(duration)).format("dddd, MMMM Do YYYY, h:mm:ss a")}</div>
      )}
      <div>Is active round: {isActiveRound ? "Yes" : "No"}</div>

      <div style={{ marginTop: "20px" }}>
        <Divider>Start New Staking Round</Divider>
        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <Form
            form={form}
            style={{ margin: "0px auto" }}
            initialValues={{ duration: "14" }}
            name="initialize"
            layout="inline"
            onFinish={initialize}
          >
            <Form.Item
              name="duration"
              rules={[
                {
                  required: true,
                  message: "Duration has to be a number > 0",
                },
              ]}
              label="Duration (in days)"
            >
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item>
              <Button style={{ marginRight: "10px" }} htmlType="submit">
                Start
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Divider>Get GTC Tokens</Divider>
        <div style={{ width: "100%" }}>
          <Button style={{ marginRight: "10px" }} onClick={mintToken}>
            Mint
          </Button>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Divider>Approve Token For Stake</Divider>
        <div style={{ width: "100%" }}>
          <Button style={{ marginRight: "10px" }} onClick={approve}>
            Approve GTC
          </Button>
        </div>
      </div>

      <div style={{ marginTop: "20px", padding: "5px" }}>
        <Divider>Stake</Divider>
        <div style={{ width: "100%" }}>
          <Button style={{ marginRight: "10px" }} onClick={() => stake("20")}>
            Stake 20 {tokenSymbol}
          </Button>
          <Button style={{ marginRight: "10px" }} onClick={() => stake()}>
            Stake All
          </Button>
        </div>
      </div>

      <div style={{ marginTop: "20px", padding: "5px" }}>
        <Divider>Unstake</Divider>
        <div style={{ width: "100%" }}>
          <Button style={{ marginRight: "10px" }} onClick={() => unstake("20")}>
            Unstake 20 {tokenSymbol}
          </Button>
          <Button style={{ marginRight: "10px" }} onClick={() => unstake()}>
            Unstake All
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Home;
