import { Button } from "antd";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import moment from "moment";

const zero = ethers.BigNumber.from("0");

const Rounds = ({ tokenSymbol, address, readContracts, stake, unstake, migrate, round, latestRound }) => {
  const stakedBalance = ethers.utils.formatUnits(
    useContractReader(readContracts, "Staking", "getUserStakeForRound", [round, address]) || zero,
  );

  const [start, duration, tvl] = useContractReader(readContracts, "Staking", "fetchRoundMeta", [round]) || [];

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
        <div style={{ width: "100%" }}>
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
      </div>
    </div>
  );
};

export default Rounds;
