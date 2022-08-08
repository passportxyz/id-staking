import { Button, Form, InputNumber, Menu, Typography } from "antd";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import moment from "moment";
import { useState } from "react";
import AddressInput from "./AddressInput";

const zero = ethers.BigNumber.from("0");

const Rounds = ({
  tokenSymbol,
  address,
  readContracts,
  stake,
  unstake,
  migrate,
  round,
  latestRound,
  mainnetProvider,
  stakeUsers,
  unstakeUsers,
}) => {
  const [form] = Form.useForm();
  const [openView, setOpenView] = useState("self");

  const stakedBalance = ethers.utils.formatUnits(
    useContractReader(readContracts, "IDStaking", "getUserStakeForRound", [round, address]) || zero,
  );

  const [start, duration, tvl] = useContractReader(readContracts, "IDStaking", "fetchRoundMeta", [round]) || [];

  const handleStakeUsers = async v => {
    console.log(v);
    await stakeUsers(round, [v.address], [ethers.utils.parseUnits(`${v.amount}`)]);
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
        Round: {round} of {latestRound}
      </div>
      <div>
        stake of TVL: {stakedBalance} {tokenSymbol} staked of {ethers.utils.formatEther(tvl || zero)} {tokenSymbol}
      </div>
      <div>Start Timestamp: {moment.unix((start || zero).toString()).format("dddd, MMMM Do YYYY, h:mm:ss a")}</div>
      <div>
        End Timestamp:{" "}
        {moment.unix((start || zero).add(duration || zero).toString()).format("dddd, MMMM Do YYYY, h:mm:ss a")}
      </div>

      <Menu
        mode="horizontal"
        defaultSelectedKeys={["self"]}
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
        onSelect={({ key }) => setOpenView(key)}
      >
        <Menu.Item key="self">Self Staking</Menu.Item>
        <Menu.Item key="community">Community Staking</Menu.Item>
      </Menu>

      <div style={{ padding: "5px", marginTop: "10px" }}>
        {openView === "self" && (
          <div style={{ width: "100%", marginTop: "5px" }}>
            <Button style={{ marginRight: "10px" }} onClick={() => stake(round, "100")}>
              Stake 100 {tokenSymbol}
            </Button>
            <Button style={{ marginRight: "10px" }} onClick={() => unstake(round, "100")}>
              Unstake 100 {tokenSymbol}
            </Button>
            {round !== latestRound && stakedBalance !== "0.0" && (
              <Button style={{ marginRight: "10px" }} onClick={() => migrate(round)}>
                Migrate Stake {tokenSymbol}
              </Button>
            )}
          </div>
        )}

        {openView === "community" && (
          <div style={{ width: "100%", marginTop: "5px" }}>
            <Typography.Title level={5} style={{ marginBottom: "10px" }}>
              Stake on other user
            </Typography.Title>
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
              <Form.Item>
                <Button style={{ marginRight: "10px" }} htmlType="submit">
                  Stake on User
                </Button>
              </Form.Item>
            </Form>

            <div style={{ marginTop: "20px" }}>All my stakes on others</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rounds;
