// ----- Ethers library
import { ethers } from "ethers";

export const appName = "Staking App";
export const tokenAddress = "0x64a46c4d96119f3848ed11071e09a2e27edbd3ec";
// GTC MAINNET ADDRESS = "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f";

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
  const stakeAmountFormatted = ethers.utils.formatUnits(stake.toString(), 18);
  return stakeAmountFormatted;
};

export const getCommunityStakeAmount = data => {
  if (!data || !data?.user) return 0;
  const xstakes = data?.user?.xstakeTo;
  if (xstakes.length < 1) {
    return 0;
  }
  let total = 0;
  xstakes.forEach(element => {
    total += element.amount;
  });
  const stakeAmountFormatted = ethers.utils.formatUnits(total.toString(), 18);
  return stakeAmountFormatted;
};

export const getAmountStakedOnMe = data => {
  if (!data || !data?.user) return 0;
  const stake = data?.user?.xstakeAggregates[0]?.total;
  if (!stake) {
    return 0;
  }
  const stakeAmountFormatted = ethers.utils.formatUnits(stake.toString(), 18);
  return stakeAmountFormatted;
};
