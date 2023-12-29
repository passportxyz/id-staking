import React from "react";

import { useWeb3Modal, useWeb3ModalAccount } from "@web3modal/ethers5/react";

export default function Account() {
  const { isConnected } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  return (
    <div>
      {!isConnected && (
        <div className="flex">
          <button className="rounded-sm bg-purple-connectPurple py-4 px-10 text-white text-base" onClick={open}>
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
}
