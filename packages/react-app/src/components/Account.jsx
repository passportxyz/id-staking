import React, { useContext, useState } from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Menu, Dropdown, Space, Drawer } from "antd";
import { DownOutlined, LogoutOutlined } from "@ant-design/icons";

import Address from "./Address";
import AddressDropDown from "./AddressDropDown";
import Balance from "./Balance";
import Wallet from "./Wallet";
import TokenBalance from "./TokenBalance";
import NetworkDisplay from "./NetworkDisplay";

import { Web3Context } from "../helpers/Web3Context";

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
  readContracts,
  networkDisplay,
  NETWORKCHECK,
  localChainId,
  selectedChainId,
  targetNetwork,
  USE_NETWORK_SELECTOR,
  selectedNetwork,
  setSelectedNetwork,
  networkOptions,
}) {
  const { currentNetwork } = useContext(Web3Context);
  const { currentTheme } = useThemeSwitcher();
  const [openNavDrawer, setOpenNavDrawer] = useState(false);
  let accountButtonInfo;
  if (web3Modal?.cachedProvider && passport.expiryDate && passport.issuanceDate) {
    accountButtonInfo = { name: "Logout", action: logoutOfWeb3Modal };
  } else {
    accountButtonInfo = { name: "Connect Wallet", action: loadWeb3Modal };
  }

  const display = !minimized && (
    <span>
      {passport.expiryDate && passport.issuanceDate && (
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

  const menu = (
    <Menu>
      <Menu.ItemGroup key="2">
        <a key="logoutbutton" size={"medium"} onClick={logoutOfWeb3Modal}>
          <LogoutOutlined />
          {` Logout`}
        </a>
      </Menu.ItemGroup>
    </Menu>
  );

  const addressComponent = (
    <Space>
      <AddressDropDown address={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} blockieSize={10} />
      <div className="inline-flex">
        <DownOutlined className="inline-flex" />
      </div>
    </Space>
  );

  return (
    <div className="flex">
      {!web3Modal?.cachedProvider && (
        <button
          className="rounded-sm bg-purple-connectPurple py-4 px-10 text-white text-base"
          onClick={accountButtonInfo.action}
        >
          {accountButtonInfo.name}
        </button>
      )}
      {web3Modal?.cachedProvider && (
        <>
          <div className="flex items-center text-base justify-center">
            <>
              <span className="mr-5 hover:text-gray-900">
                <TokenBalance
                  contracts={readContracts}
                  img={"./gtcTokenLogo.svg"}
                  name={"Token"}
                  address={address}
                  dollarMultiplier={null}
                />
              </span>
              <div>
                {
                  <NetworkDisplay
                    NETWORKCHECK={NETWORKCHECK}
                    localChainId={localChainId}
                    selectedChainId={selectedChainId}
                    targetNetwork={targetNetwork}
                    USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
                  />
                }
              </div>
            </>
            <div className="md:hidden inline-flex">
              <div
                onClick={e => {
                  e.preventDefault();

                  console.log("Open sidebar");

                  setOpenNavDrawer(true);
                }}
              >
                {addressComponent}
              </div>
              <Drawer
                title={null}
                placement="right"
                width="70%"
                closable={false}
                onClose={() => setOpenNavDrawer(false)}
                visible={openNavDrawer}
              >
                <div className="flex flex-1 flex-col items-center mt-8 justify-center">
                  <div className="mb-10">
                    <AddressDropDown
                      address={address}
                      ensProvider={mainnetProvider}
                      blockExplorer={blockExplorer}
                      blockieSize={10}
                    />
                  </div>
                  <div className="mb-10">
                    <a
                      className="hover:text-gray-900 flex flex-row"
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://passport.gitcoin.co/"
                    >
                      <img src={"./passportLogo.svg"} alt={"Passport Navbar Badge"} className="mr-2 h-6" /> Gitcoin
                      Passport{" "}
                      <img
                        src={passport?.expiryDate && passport?.issuanceDate ? "./greenEllipse.svg" : "./redEllipse.svg"}
                        alt="passport status dot"
                        className="ml-2"
                      />
                    </a>
                  </div>
                  <div className="mt-4">
                    <a
                      href="/"
                      onClick={e => {
                        e.preventDefault();

                        logoutOfWeb3Modal();
                      }}
                      className="text-signout"
                    >
                      Sign Out
                    </a>
                  </div>
                </div>
              </Drawer>
            </div>
            <div className="hidden md:inline-flex">
              <Dropdown overlay={menu} icon={<DownOutlined />} trigger={["click"]}>
                {addressComponent}
              </Dropdown>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
