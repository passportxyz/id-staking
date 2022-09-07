// ----- Ethers library
import { ethers } from "ethers";

// ERC20 ABI
export const ERC20ABI = [
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
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
      {
        name: "_spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export const getSelfStakeAmount = data => {
  if (!data || !data?.user) return 0;
  const stake = data?.user?.stakes[0]?.stake;
  if (!stake) {
    return 0;
  }
  const stakeAmountFormatted = parseFloat(ethers.utils.formatUnits(stake.toString(), 18));
  return stakeAmountFormatted.toFixed(2).toString();
};

export const getCommunityStakeAmount = data => {
  if (!data || !data?.user) return 0;
  const xstakes = data?.user?.xstakeTo;
  if (xstakes.length < 1) {
    return 0;
  }
  let total = 0.0;
  xstakes.forEach(element => {
    total += parseFloat(ethers.utils.formatUnits(element.amount.toString(), 18));
  });
  return total.toFixed(2).toString();
};

export const getAmountStakedOnMe = data => {
  if (!data || !data?.user) return 0;
  const stake = data?.user?.xstakeAggregates[0]?.total;
  if (!stake) {
    return 0;
  }
  const stakeAmountFormatted = parseFloat(ethers.utils.formatUnits(stake.toString(), 18));
  return stakeAmountFormatted.toFixed(2).toString();
};

export const formatAmountUnits = data => {
  const formattedAmount = parseFloat(ethers.utils.formatUnits(data.toString(), 18));
  return formattedAmount.toFixed(2).toString();
};
