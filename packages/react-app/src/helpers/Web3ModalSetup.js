import { WALLETCONNECT_PROJECT_ID } from "../constants";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";

// 1. Get projectId
const projectId = WALLETCONNECT_PROJECT_ID;

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};

// 3. Create modal
const metadata = {
  name: "GTC Staking",
  description: "Stake GTC on your identity",
  url: "https://staking.passport.gitcoin.co",
  icons: ["/gitcoinLogoDark.svg"],
};

const Web3ModalSetup = () =>
  createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [mainnet],
    projectId,
  });

export default Web3ModalSetup;
