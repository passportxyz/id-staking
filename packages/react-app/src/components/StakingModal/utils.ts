// ----- Ethers library
import { ethers } from "ethers";
import type { IndexedStakeData } from "../../types";

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

export const getSelfStakeAmount = (data: IndexedStakeData): ethers.BigNumber => {
  return ethers.BigNumber.from(data?.user?.stakes?.[0]?.stake || "0");
};

export const getCommunityStakeAmount = (data: IndexedStakeData): ethers.BigNumber => {
  let total = ethers.BigNumber.from(0);
  data?.user?.xstakeTo?.forEach(element => {
    total = total.add(ethers.BigNumber.from(element.amount));
  });
  return total;
};

export const getAmountStakedOnMe = (data: IndexedStakeData): ethers.BigNumber => {
  return ethers.BigNumber.from(data?.user?.xstakeAggregates?.[0]?.total || "0");
};

// Given e.g. 1e18, return "1.00"
export const formatGtc = (amount: ethers.BigNumber) => {
  return parseFloat(ethers.utils.formatUnits(amount.toString(), 18)).toFixed(2).toString();
};

// Given e.g. 1 GTC, return 1e18
export const parseGtc = (amount: string): ethers.BigNumber => ethers.utils.parseUnits(amount, 18);
