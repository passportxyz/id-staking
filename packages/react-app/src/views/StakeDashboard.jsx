import React, { useEffect, useState, useContext } from "react";
import { Button } from "antd";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { Select } from "antd";
import { Rounds, Navbar } from "../components";
import { STARTING_GRANTS_ROUND } from "../components/Rounds";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { gql, useLazyQuery } from "@apollo/client";
import { UsergroupAddOutlined, LockOutlined } from "@ant-design/icons";

import { getAmountStakedOnMe } from "../components/StakingModal/utils";

import { Web3Context } from "../helpers/Web3Context";

// --- sdk import
import { PassportReader } from "@gitcoinco/passport-sdk-reader";

const { Option } = Select;

const zero = ethers.BigNumber.from("0");
// Update Passport on address change
const reader = new PassportReader();

function StakeDashboard({
  tx,
  readContracts,
  address,
  writeContracts,
  mainnetProvider,
  networkOptions,
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
}) {
  const [pending, setPending] = useState(false);

  // Round in view is actually not currently set dynamically
  const { roundInView, setLoggedIn } = useContext(Web3Context);
  const navigate = useNavigate();
  // Route user to dashboard when wallet is connected
  useEffect(() => {
    if (!web3Modal?.cachedProvider) {
      navigate("/");
    }
  }, [web3Modal?.cachedProvider]);

  // Logout user if they do not have a passport
  // Route user to dashboard when wallet is connected
  useEffect(() => {
    if (process.env.REACT_APP_REQUIRE_USER_HAS_PASSPORT === "true") {
      console.log("wallet changed");
      async function getPassport() {
        if (userSigner) {
          const newAddress = await userSigner.getAddress();
          const newPassport = await reader.getPassport(newAddress);
          if (!newPassport) {
            navigate("/");
            setLoggedIn(false);
          }
        }
      }
      getPassport();
    }
  }, [address]);

  const [start, duration, tvl] =
    useContractReader(readContracts, "IDStaking", "fetchRoundMeta", [roundInView], 1000000) || [];

  const mintToken = async () => {
    tx(writeContracts.Token.mintAmount(ethers.utils.parseUnits("1000")));
  };

  const migrate = async id => {
    tx(writeContracts.IDStaking.migrateStake(id + ""));
  };

  // Populate Round Data
  const query = gql(`
  query User($address: String!, $round: BigInt!) {
    user(id: $address) {
      xstakeAggregates (where: { round: $round }) {
        id
        total
      },
      stakes(where: { round: $round }) {
        stake
        round {
          id
        }
      },
      xstakeTo(where: { round: $round }) {
        amount,
        to {
          address
        }
      }
    }
  }
`);

  const [getData, { loading, data, error }] = useLazyQuery(query, {
    variables: {
      address: address.toLowerCase(),
      round: roundInView,
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => address && getData(), [getData, address]);

  const awaitTransactionThenRefreshData = async asyncFunc => {
    setPending(true);
    await asyncFunc;
    // Wait for subgraph to update
    setTimeout(() => {
      getData();
      setPending(false);
    }, 7000);
  };

  const roundEndTimestamp = moment.unix((start || zero).add(duration || zero).toString());
  const roundEnded = moment().unix() >= roundEndTimestamp.unix();

  return (
    <>
      <Navbar
        readContracts={readContracts}
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

      {/* Grants Round Header */}
      <main className="container flex flex-1 flex-col px-8 md:mx-auto pb-10">
        <div className="mt-8 flex items-center justify-between">
          <div>
            <p className="mb-0 text-3xl text-left">Gitcoin Grants Beta Round</p>
            {roundInView ? (
              <p className="text-base text-left mb-0">
                {moment.unix((start || zero).toString()).format("MMMM Do YYYY (h:mm:ss a)")} {" - "}
                {roundEndTimestamp.format("MMMM Do YYYY (h:mm:ss a)")}
              </p>
            ) : (
              <></>
            )}
            <p className="text-base text-left mb-0">
              Staking only affects your Passport score when GTC is staked for an active round
            </p>
            <p className="text-base text-left mb-4">Once the round completes, GTC may be unstaked</p>
          </div>
          <Button
            disabled={pending}
            onClick={getData}
            className="rounded-sm rounded bg-purple-connectPurple py-2 px-10 text-white"
            style={{ backgroundColor: "#6F3FF5", color: "white" }}
          >
            ↻ {pending ? "Pending Transaction Finality..." : "Refresh Data"}
          </Button>
        </div>
        <div className="flex flex-1 md:flex-row flex-col">
          <section className="w-full border-t mr-8 mb-2">
            <div className="py-2 mt-6 w-full">
              <div className="text-gray-600 body-font w-full">
                {roundInView && (
                  <Rounds
                    tx={tx}
                    key={roundInView}
                    round={roundInView}
                    address={address}
                    migrate={migrate}
                    roundEnded={roundEnded}
                    readContracts={readContracts}
                    writeContracts={writeContracts}
                    mainnetProvider={mainnetProvider}
                    userSigner={userSigner}
                    targetNetwork={targetNetwork}
                    roundData={data}
                    handleStakingTransaction={awaitTransactionThenRefreshData}
                  />
                )}
              </div>
            </div>
          </section>

          <aside className="md:max-w-aside w-full">
            <div className="border border-asideBorder px-4 py-6 rounded-lg bg-asideBG">
              <div className="flex flex-row items-center">
                <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0">
                  <UsergroupAddOutlined style={{ fontSize: "25px" }} />
                </div>
                <h2 className="text-gray-900 text-md text-left ml-4 mb-0">
                  {getAmountStakedOnMe(data)
                    ? "People from your community have staked on your identity!"
                    : "Collect a Community Staking stamp when other people stake on your identity."}
                </h2>
              </div>

              <div className="flex-grow mt-4">
                {getAmountStakedOnMe(data) ? (
                  <div className="flex flex-col">
                    <p className="leading-relaxed text-base text-left">
                      You can now collect a Community Staking stamp on your Passport - visit Passport to do so now!
                    </p>
                    <p className="text-black text-left text-xl">{getAmountStakedOnMe(data)} GTC</p>
                  </div>
                ) : (
                  <p className="leading-relaxed text-base text-left">
                    Looks like no one has staked on you yet. Get people you know to stake on you and receive the
                    community staking stamp on Gitcoin Passport.
                  </p>
                )}

                <div className="mt-2 border-t border-divider">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://passport.gitcoin.co/"
                    className="mt-3 text-indigo-500 inline-flex items-center"
                  >
                    More Info
                  </a>
                </div>
              </div>
            </div>
            {roundEnded && (
              <div className="border border-asideBorder px-4 py-6 rounded-lg mt-6 bg-asideBG">
                <div className="flex flex-row items-center">
                  <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0">
                    <LockOutlined style={{ fontSize: "25px" }} />
                  </div>
                  <h2 className="text-gray-900 text-md text-left ml-4 mb-0">
                    Stakings are locked through the duration of the Round.
                  </h2>
                </div>

                <div className="flex-grow mt-4">
                  <p className="leading-relaxed text-base text-left">
                    In order to prevent users from sybil attacking through staking their GTC and moving it across
                    multiple passports during a Grants Round, all GTC staked is locked through the duration of the
                    current Grants Round.
                  </p>
                  <div className="mt-3 border-t border-divider">
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://gitcoin.notion.site/About-Staking-on-Grants-Round-15-768f88d430ff4335ba23b17876b6e981"
                      className="mt-3 text-indigo-500 inline-flex items-center"
                    >
                      More Info
                    </a>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
            <footer className="p-4 mt-4 text-center">
        {readContracts && readContracts.IDStaking && (
          <p>
            Identity Staking Contract:{" "}
            <a
              href={`${blockExplorer}/address/${readContracts.IDStaking.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {readContracts.IDStaking.address}
            </a>
          </p>
        )}
      </footer>
    </>
  );
}

export default StakeDashboard;
