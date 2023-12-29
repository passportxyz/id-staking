import { Skeleton, Typography, Card } from "antd";
import React from "react";
import Blockies from "react-blockies";
import { useResolveEnsAddress } from "eth-hooks/dapps";
const { Meta } = Card;

const { Text } = Typography;

const blockExplorerLink = (address, blockExplorer) =>
  `${blockExplorer || "https://etherscan.io/"}${"address/"}${address}`;

export default function Address(props) {
  const address = props.value || props.address;

  const ens = useResolveEnsAddress(props.ensProvider, address);

  if (!address) {
    return (
      <span>
        <Skeleton avatar paragraph={{ rows: 1 }} />
      </span>
    );
  }

  let displayAddress = address.substr(0, 6);

  const ensSplit = ens && ens.split(".");
  const validEnsCheck = ensSplit && ensSplit[ensSplit.length - 1] === "eth";

  if (validEnsCheck) {
    displayAddress = ens;
  } else if (props.size === "short") {
    displayAddress += "..." + address.substr(-4);
  } else if (props.size === "long") {
    displayAddress = address;
  }

  const etherscanLink = blockExplorerLink(address, props.blockExplorer);

  const text = (
    <Text>
      <a style={{ color: "black" }} target="_blank" href={etherscanLink} rel="noopener noreferrer">
        {displayAddress}
      </a>
    </Text>
  );

  return (
    <div style={{ padding: 2 }}>
      <Meta
        avatar={
          <Blockies
            className="rounded-full"
            seed={address.toLowerCase()}
            size={5}
            scale={props.fontSize ? props.fontSize / 7 : 4}
          />
        }
        title={text}
        description={props.extra}
        key="meta"
        style={{ display: "flex", alignItems: "center" }}
      />
    </div>
  );
}
