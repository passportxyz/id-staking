import React, { useEffect, useState, useContext } from "react";
import { Modal } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import { Navbar, Account, AccountHomePage } from "../components";
import { useNavigate } from "react-router-dom";

import { Web3Context } from "../helpers/Web3Context";

function Home({
  tx,
  readContracts,
  writeContracts,
  mainnetProvider,
  selectedNetwork,
  setSelectedNetwork,
  yourLocalBalance,
  USE_NETWORK_SELECTOR,
  localProvider,
  targetNetwork,
  logoutOfWeb3Modal,
  selectedChainId,
  localChainId,
  NETWORKCHECK,
  passport,
  userSigner,
  price,
  web3Modal,
  loadWeb3Modal,
  blockExplorer,
  networkOptions,
}) {
  const navigate = useNavigate();
  // Route user to dashboard when wallet is connected
  useEffect(() => {
    if (web3Modal?.cachedProvider) {
      navigate("/StakeDashboard");
    }
  }, [web3Modal?.cachedProvider]);

  useEffect(() => {
    if (!passport.expiryDate && !passport.issuanceDate && web3Modal?.cachedProvider) {
      showModal();
    }
  }, [passport]);

  const { address, setAddress } = useContext(Web3Context);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    window.location.replace("https://passport.gitcoin.co/");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="font-miriam-libre min-h-max min-h-default bg-landingPageBackground bg-cover bg-no-repeat text-gray-100 md:bg-center">
      <Modal
        title="Create a Passport to Get Started"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={`Create a Passport`}
        footer={[
          <button
            key="submit"
            className="rounded-sm rounded bg-purple-connectPurple py-2 px-10 text-white"
            onClick={handleOk}
          >
            <ExportOutlined />
            Create Passport
          </button>,
        ]}
      >
        <p>
          Looks like you don’t have a Passport yet! To get started on Identity Staking, create a passport on Gitcoin
          Passport
        </p>
      </Modal>
      <Navbar
        networkOptions={networkOptions}
        selectedNetwork={selectedNetwork}
        setSelectedNetwork={setSelectedNetwork}
        yourLocalBalance={yourLocalBalance}
        USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
        localProvider={localProvider}
        address={address}
        targetNetwork={targetNetwork}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
        selectedChainId={selectedChainId}
        localChainId={localChainId}
        NETWORKCHECK={NETWORKCHECK}
        passport={passport}
        userSigner={userSigner}
        mainnetProvider={mainnetProvider}
        price={price}
        web3Modal={web3Modal}
        loadWeb3Modal={loadWeb3Modal}
        blockExplorer={blockExplorer}
      />
      <div className="container mx-auto px-5 py-2">
        <div className="mx-auto flex flex-wrap">
          <div className="mt-0 md:ml-4 w-full pb-6 text-white sm:mt-40 sm:w-1/2 md:mt-40 md:w-1/2 md:pt-6">
            <div className="font-miriam-libre leading-relaxed">
              <p className="text-2xl sm:text-xl md:text-xl text-black text-left">Identity Staking</p>
              <p className="text-2xl sm:text-3xl md:text-3xl text-black text-left">
                Defend against sybil by staking on your identity
              </p>
            </div>
            <div className="text-left mt-0 text-lg text-gray-900 sm:text-xl md:mt-10 md:pr-20 md:text-xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat.
            </div>
            <div className="mt-4 w-full sm:mt-10 sm:w-1/2 md:mt-10 md:block md:w-1/2">
              <AccountHomePage
                passport={passport}
                address={address}
                localProvider={localProvider}
                userSigner={userSigner}
                mainnetProvider={mainnetProvider}
                price={price}
                web3Modal={web3Modal}
                loadWeb3Modal={loadWeb3Modal}
                logoutOfWeb3Modal={logoutOfWeb3Modal}
                blockExplorer={blockExplorer}
                minimized={undefined}
                isContract={undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
