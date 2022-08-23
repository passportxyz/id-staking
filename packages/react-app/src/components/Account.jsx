import React from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";

import Address from "./Address";
import Balance from "./Balance";
import Wallet from "./Wallet";

/** 
  ~ What it does? ~

  Displays an Address, Balance, and Wallet as one Account component,
  also allows users to log in to existing accounts and log out

  ~ How can I use? ~

  <Account
    address={address}
    localProvider={localProvider}
    userProvider={userProvider}
    mainnetProvider={mainnetProvider}
    price={price}
    web3Modal={web3Modal}
    loadWeb3Modal={loadWeb3Modal}
    logoutOfWeb3Modal={logoutOfWeb3Modal}
    blockExplorer={blockExplorer}
    isContract={boolean}
  />

  ~ Features ~

  - Provide address={address} and get balance corresponding to the given address
  - Provide localProvider={localProvider} to access balance on local network
  - Provide userProvider={userProvider} to display a wallet
  - Provide mainnetProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth")
  - Provide price={price} of ether and get your balance converted to dollars
  - Provide web3Modal={web3Modal}, loadWeb3Modal={loadWeb3Modal}, logoutOfWeb3Modal={logoutOfWeb3Modal}
              to be able to log in/log out to/from existing accounts
  - Provide blockExplorer={blockExplorer}, click on address and get the link
              (ex. by default "https://etherscan.io/" or for xdai "https://blockscout.com/poa/xdai/")
**/

export default function Account({
  passport,
  address,
  userSigner,
  localProvider,
  mainnetProvider,
  price,
  minimized,
  web3Modal,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  blockExplorer,
  isContract,
}) {
  const { currentTheme } = useThemeSwitcher();

  let accountButtonInfo;
  if (web3Modal?.cachedProvider && passport.expiryDate && passport.issuanceDate) {
    accountButtonInfo = { name: "Logout", action: logoutOfWeb3Modal };
  } else {
    accountButtonInfo = { name: "Connect Wallet", action: loadWeb3Modal };
  }

  const display = !minimized && (
    <span>
      {passport.expiryDate && passport.issuanceDate && web3Modal?.cachedProvider && (
        <span className="mr-6">
          {address && (
            <Address address={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} fontSize={20} />
          )}
          {<Balance address={address} provider={localProvider} price={price} size={20} />}
          {!isContract && (
            <Wallet
              address={address}
              provider={localProvider}
              signer={userSigner}
              ensProvider={mainnetProvider}
              price={price}
              color={currentTheme === "light" ? "#1890ff" : "#2caad9"}
              size={22}
              padding={"0px"}
            />
          )}
        </span>
      )}
    </span>
  );

  return (
    <div className="flex">
      {display}
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
