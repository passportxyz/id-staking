import { Typography } from "antd";
import { ethers } from "ethers";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { Address } from "../components";
import { useContractReader } from "eth-hooks";

function Stakes({ readContracts, localProvider, mainnetProvider }) {
  const tokenSymbol = useContractReader(readContracts, "Token", "symbol");

  const stakeLogs = (useEventListener(readContracts, "IDStaking", "xStaked", localProvider) || []).reverse();

  return (
    <>
      <div
        style={{
          paddingTop: "20px",
          paddingBottom: "20px",
          maxWidth: "600px",
          margin: "60px auto 20px auto",
          border: "1px solid",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <Typography.Title level={4}>Stake Logs</Typography.Title>
        </div>
        <div>
          {stakeLogs.map(stake => (
            <Typography.Paragraph>
              Round {stake.args.roundId?.toString()}:{" "}
              <Address ensProvider={mainnetProvider} fontSize={14} address={stake.args.staker} />{" "}
              {stake.args.staked ? "staked" : "unstaked"} {ethers.utils.formatUnits(stake.args.amount)} {tokenSymbol} on{" "}
              <Address ensProvider={mainnetProvider} fontSize={14} address={stake.args.user} />{" "}
            </Typography.Paragraph>
          ))}
        </div>
      </div>
    </>
  );
}

export default Stakes;
