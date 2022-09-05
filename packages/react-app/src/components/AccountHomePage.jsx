import React from "react";

export default function Account({ web3Modal, loadWeb3Modal }) {
  return (
    <div>
      {web3Modal?.cachedProvider ? (
        <></>
      ) : (
        <div className="flex">
          {web3Modal && (
            <button
              className="rounded-sm bg-purple-connectPurple py-4 px-10 text-white text-base"
              onClick={loadWeb3Modal}
            >
              Connect Wallet
            </button>
          )}
        </div>
      )}
    </div>
  );
}
