import React, { useContext, useMemo, useState, useCallback } from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Menu, Dropdown, Space, Drawer } from "antd";
import { DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { useWeb3Modal, useWeb3ModalAccount, useDisconnect } from "@web3modal/ethers5/react";

import Address from "./Address";
import AddressDropDown from "./AddressDropDown";
import Balance from "./Balance";
import Wallet from "./Wallet";
import NetworkDisplay from "./NetworkDisplay";

import { Web3Context } from "../helpers/Web3Context";

export default function Account({
  passport,
  address,
  userSigner,
  localProvider,
  mainnetProvider,
  minimized,
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
  const { isConnected } = useWeb3ModalAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { currentNetwork } = useContext(Web3Context);
  const [openNavDrawer, setOpenNavDrawer] = useState(false);

  const logout = useCallback(() => {
    disconnect();
    window.location.reload();
  }, [disconnect]);

  const accountButtonInfo = useMemo(() => {
    if (isConnected) {
      return {
        name: "Logout",
        action: logout,
      };
    } else {
      return {
        name: "Connect Wallet",
        action: open,
      };
    }
  }, [isConnected, logout, open]);

  const menu = (
    <Menu>
      <Menu.ItemGroup key="2">
        <a key="logoutbutton" size="medium" style={{ color: "red" }} onClick={logout}>
          <LogoutOutlined style={{ color: "red" }} />
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
      {!isConnected && (
        <button className="rounded-sm bg-purple-connectPurple py-4 px-10 text-white" onClick={accountButtonInfo.action}>
          {accountButtonInfo.name}
        </button>
      )}
      {isConnected && (
        <>
          <div className="flex items-center text-base justify-center">
            <>
              <div className="hidden md:inline-flex">
                <a
                  className="mr-5 hover:text-gray-900 flex flex-row"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://passport.gitcoin.co/"
                >
                  <img src={"./passportLogo.svg"} alt={"Passport Navbar Badge"} className="mr-2 h-6" /> Gitcoin Passport{" "}
                  <img
                    src={passport ? "./greenEllipse.svg" : "./redEllipse.svg"}
                    alt="passport status dot"
                    className="ml-2"
                  />
                </a>
                <span className="mr-5 hover:text-gray-900 capitalize flex flex-row">
                  {" "}
                  <img className="mr-2 h-5" src={"./ethDiamondBlackIcon.svg"} alt="eth icon" />{" "}
                  <span className="text-black">{currentNetwork?.name}</span>
                </span>
              </div>
              <div>
                <NetworkDisplay
                  NETWORKCHECK={NETWORKCHECK}
                  localChainId={localChainId}
                  selectedChainId={selectedChainId}
                  targetNetwork={targetNetwork}
                  USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
                />
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
                        src={passport ? "./greenEllipse.svg" : "./redEllipse.svg"}
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
                        logout();
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
