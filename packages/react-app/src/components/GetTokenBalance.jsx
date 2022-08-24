import { useTokenBalance } from "eth-hooks/erc/erc-20/useTokenBalance";
import React, { useState } from "react";

import { utils } from "ethers";

// ----- Ethers library
import { Contract } from "ethers";
import { formatUnits } from "@ethersproject/units";

// ERC20 ABI
const ERC20_ABI = [
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export async function tokenBalance(address, tokenContractAddress, decimalNumber, provider) {
  // load Token contract
  const readContract = new Contract(tokenContractAddress, ERC20_ABI, provider);
  const tokenBalance = await readContract?.balanceOf(address);
  const balanceFormatted = formatUnits(tokenBalance, decimalNumber);
  return parseFloat(balanceFormatted);
}

export default function GetTokenBalance({ mainnetProvider, userAddress }) {
  return (
    <span
      style={{
        verticalAlign: "middle",
        fontSize: 24,
        padding: 8,
        cursor: "pointer",
      }}
      onClick={() => {
        setDollarMode(!dollarMode);
      }}
    >
      {props.img} {displayBalance}
    </span>
  );
}
