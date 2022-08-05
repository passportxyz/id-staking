import { Button, Divider, Form, InputNumber } from "antd";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import moment from "moment";
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

      <div style={{ padding: "5px", marginTop: "5px" }}>
        <Divider>Your Stakings</Divider>
        <div style={{ width: "100%", marginTop: "5px" }}>
          <Button style={{ marginRight: "10px" }} onClick={() => stake(round, "50")}>
            Stake 50 {tokenSymbol}
          </Button>
          <Button style={{ marginRight: "10px" }} onClick={() => unstake(round, "50")}>
            Unstake 50 {tokenSymbol}
          </Button>
          {round !== latestRound && stakedBalance !== "0.0" && (
            <Button style={{ marginRight: "10px" }} onClick={() => migrate(round)}>
              Migrate Stake {tokenSymbol}
            </Button>
          )}
        </div>

        <Divider>Cross Stakings</Divider>
        <div style={{ width: "100%", marginTop: "5px" }}>
          <Form
            form={form}
            style={{ margin: "0px auto", width: "100%", padding: "0px 10px" }}
            initialValues={{ amount: "10" }}
            name="stakeUsers"
            layout="vertical"
            onFinish={handleStakeUsers}
          >
            <Form.Item name="address" required label="User Address">
              <AddressInput ensProvider={mainnetProvider} placeholder="Address of trusted staker" />
            </Form.Item>
            <Form.Item name="amount" required label="GTC stake amount">
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item>
              <Button style={{ marginRight: "10px" }} htmlType="submit">
                Stake on User
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Rounds;
