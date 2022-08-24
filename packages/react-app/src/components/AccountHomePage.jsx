import React from "react";

export default function Account({ passport, web3Modal, loadWeb3Modal, logoutOfWeb3Modal }) {
  let accountButtonInfo;
  if (web3Modal?.cachedProvider && passport.expiryDate && passport.issuanceDate) {
    accountButtonInfo = { name: "Logout", action: logoutOfWeb3Modal };
  } else {
    accountButtonInfo = { name: "Connect Wallet", action: loadWeb3Modal };
  }

  return (
    <div className="flex">
      {web3Modal && (
        <button
          className="rounded-sm bg-purple-connectPurple py-4 px-10 text-white text-base"
          onClick={accountButtonInfo.action}
        >
          {accountButtonInfo.name}
        </button>
      )}
    </div>
  );
}
