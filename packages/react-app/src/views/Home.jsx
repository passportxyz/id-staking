import React, { useEffect, useState, useContext } from "react";
import { Modal } from "antd";
import { ExportOutlined } from "@ant-design/icons";
import { Navbar, Account, AccountHomePage } from "../components";
import { useNavigate } from "react-router-dom";
import { useWeb3ModalAccount } from "@web3modal/ethers5/react";

// --- sdk import
import { PassportReader } from "@gitcoinco/passport-sdk-reader";

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
  selectedChainId,
  localChainId,
  NETWORKCHECK,
  passport,
  userSigner,
  blockExplorer,
  networkOptions,
}) {
  const { isConnected } = useWeb3ModalAccount();
  const navigate = useNavigate();
  const { address, loggedIn, setLoggedIn } = useContext(Web3Context);

  // Route user to dashboard when wallet is connected
  useEffect(() => {
    async function getPassport() {
      if (userSigner) {
        if (process.env.REACT_APP_REQUIRE_USER_HAS_PASSPORT === "true") {
          // Update Passport on address change
          const reader = new PassportReader();

          const newAddress = await userSigner.getAddress();
          let newPassport;
          try {
            newPassport = await reader.getPassport(newAddress);
          } catch {}
          if (isConnected && newPassport) {
            navigate("/StakeDashboard");
            setLoggedIn(true);
          } else if (!loggedIn) {
            showModal();
          }
        } else {
          navigate("/StakeDashboard");
        }
      }
    }
    getPassport();
  }, [userSigner, isConnected, loggedIn]);

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
    <div className="min-h-max min-h-default bg-landingPageBackground bg-cover bg-no-repeat text-gray-100 md:bg-center">
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
          Passport. If you do already have a passport, you may need to repair it in the main Gitcoin Passport app.
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
        selectedChainId={selectedChainId}
        localChainId={localChainId}
        NETWORKCHECK={NETWORKCHECK}
        passport={passport}
        userSigner={userSigner}
        mainnetProvider={mainnetProvider}
        blockExplorer={blockExplorer}
      />
      <div className="container mx-auto px-5 py-2">
        <div className="mx-auto flex flex-wrap">
          <div className="mt-0 md:ml-4 w-full pb-6 text-white sm:mt-40 sm:w-1/2 md:mt-40 md:w-1/2 md:pt-6">
            <div className="leading-relaxed">
              <p className="text-2xl sm:text-xl md:text-xl text-black text-left">Identity Staking</p>
              <p className="text-2xl sm:text-3xl md:text-3xl text-black text-left">
                Defend against sybil by staking on your identity
              </p>
            </div>
            <div className="text-left mt-0 text-lg text-gray-900 sm:text-xl md:mt-10 md:pr-20 md:text-xl">
              Identity Staking is a mechanism that allows you to stake on your own identity or stake on somebody else's.
              We use GTC to stake, and each staking is associated with a Passport. By staking, the profile of stamps in
              the Passport becomes more unique, which will likely result in a stronger Unique Humanity Score for the
              current Grants Round.
            </div>
            <div className="mt-4 w-full sm:mt-10 sm:w-1/2 md:mt-10 md:block md:w-1/2">
              <AccountHomePage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
