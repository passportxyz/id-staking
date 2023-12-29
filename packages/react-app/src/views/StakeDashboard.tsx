import React, { useEffect, useState, useContext, useCallback } from "react";
import { Button } from "antd";
import { BigNumber, ethers } from "ethers";
import { Rounds, Navbar } from "../components";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { UsergroupAddOutlined, LockOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { IndexedStakeData } from "../types";
import { useWeb3ModalAccount } from "@web3modal/ethers5/react";

import { getAmountStakedOnMe, formatGtc } from "../components/StakingModal/utils";
import StakingDoneNotificationModal from "../components/StakingModal/StakingDoneNotificationModal";
import RoundSelector from "../components/RoundSelector";

import { Web3Context } from "../helpers/Web3Context";

// --- sdk import
import { PassportReader } from "@gitcoinco/passport-sdk-reader";
import axios from "axios";

type StakeData = {
  id: number;
  event_type: string;
  round_id: number;
  staker?: string;
  address?: string;
  amount: string;
  staked: boolean;
  block_number: number;
  tx_hash: string;
};

// Update Passport on address change
const reader = new PassportReader();

type StakeDashboardProps = {
  tx: any;
  readContracts: any;
  address: string;
  writeContracts: any;
  mainnetProvider: ethers.providers.Web3Provider;
  networkOptions: any;
  USE_NETWORK_SELECTOR: any;
  localProvider: any;
  targetNetwork: any;
  selectedChainId: any;
  localChainId: any;
  NETWORKCHECK: any;
  passport: any;
  userSigner: any;
  blockExplorer: any;
};

function StakeDashboard({
  tx,
  readContracts,
  address,
  writeContracts,
  mainnetProvider,
  networkOptions,
  USE_NETWORK_SELECTOR,
  localProvider,
  targetNetwork,
  selectedChainId,
  localChainId,
  NETWORKCHECK,
  passport,
  userSigner,
  blockExplorer,
}: StakeDashboardProps) {
  const [pending, setPending] = useState(false);
  const [start, setStart] = useState("0");
  const [duration, setDuration] = useState("0");
  const [name, setName] = useState("");
  const [stakingDoneNotificationModalVisible, setStakingDoneNotificationModalVisible] = useState(false);
  const { isConnected } = useWeb3ModalAccount();

  // Round in view is actually not currently set dynamically
  const { roundInView, setLoggedIn } = useContext(Web3Context);
  const navigate = useNavigate();
  // Route user to dashboard when wallet is connected
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected]);

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

  useEffect(() => {
    (async () => {
      if (roundInView && readContracts?.IDStaking) {
        try {
          const [start, duration, _tvl, meta] = await readContracts.IDStaking.fetchRoundMeta(roundInView);
          setStart(start);
          setDuration(duration);
          setName(meta);
        } catch (e) {
          console.error(e);
        }
      }
    })();
  }, [roundInView, readContracts?.IDStaking]);

  const migrate = async (id: string) => {
    tx(writeContracts.IDStaking.migrateStake(id));
  };

  const [data, setData] = useState<IndexedStakeData>({
    user: {
      xstakeAggregates: [],
      stakes: [],
      xstakeTo: [],
    },
  });

  const getData = useCallback(async () => {
    if (address && roundInView) {
      const stakes: StakeData[] =
        (
          await axios.get(
            `${process.env.REACT_APP_SCORER_URL}/registry/gtc-stake/${address.toLowerCase()}/${roundInView}`,
          )
        ).data?.results || [];

      let stakedOnByOthersTotal = BigNumber.from(0);
      let selfStakeTotal = BigNumber.from(0);
      const xstakeToTotals: Record<string, BigNumber> = {};

      for (const stake of stakes) {
        // These amounts come from the API as decimal strings with 18 decimal places
        const stakeAmount = BigNumber.from(stake.amount.replace(".", ""));
        const operation = stake.staked ? "add" : "sub";

        if (stake.address?.toLowerCase() === address.toLowerCase()) {
          stakedOnByOthersTotal = stakedOnByOthersTotal[operation](stakeAmount);
        } else if (stake.staker?.toLowerCase() === address.toLowerCase()) {
          if (stake.address) {
            if (!xstakeToTotals[stake.address]) xstakeToTotals[stake.address] = BigNumber.from(0);
            xstakeToTotals[stake.address] = xstakeToTotals[stake.address][operation](stakeAmount);
          } else {
            selfStakeTotal = selfStakeTotal[operation](stakeAmount);
          }
        }
      }

      setData({
        user: {
          xstakeAggregates: [
            {
              total: stakedOnByOthersTotal.toString(),
            },
          ],
          stakes: [
            {
              stake: selfStakeTotal.toString(),
            },
          ],
          xstakeTo: Object.entries(xstakeToTotals).map(([address, total]) => ({
            to: {
              address,
            },
            amount: total.toString(),
          })),
        },
      });
    }
  }, [address, roundInView]);

  useEffect(() => {
    address && getData();
  }, [getData, address, roundInView]);

  const awaitTransactionThenRefreshData = async (asyncResult: Promise<any>) => {
    setPending(true);
    await asyncResult;
    // Wait for subgraph to update
    setTimeout(() => {
      getData();
      setPending(false);
      setStakingDoneNotificationModalVisible(true);
      // Wait for subgraph to update
    }, 7000);
  };

  const roundEndTimestamp = moment.unix(parseInt(start || "0") + parseInt(duration || "0"));
  const roundEnded = moment().unix() >= roundEndTimestamp.unix();
  const amountStakedOnMe = getAmountStakedOnMe(data);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        readContracts={readContracts}
        networkOptions={networkOptions}
        USE_NETWORK_SELECTOR={USE_NETWORK_SELECTOR}
        localProvider={localProvider}
        targetNetwork={targetNetwork}
        selectedChainId={selectedChainId}
        localChainId={localChainId}
        NETWORKCHECK={NETWORKCHECK}
        passport={passport}
        userSigner={userSigner}
        mainnetProvider={mainnetProvider}
        blockExplorer={blockExplorer}
      />

      <StakingDoneNotificationModal
        visible={stakingDoneNotificationModalVisible}
        onClose={() => {
          setStakingDoneNotificationModalVisible(false);
        }}
      />
      {/* Grants Round Header */}
      <main className="container flex flex-1 flex-col px-8 md:mx-auto pb-10">
        <div className="mt-8 flex items-center justify-between">
          <div>
            <p className="mb-0 text-3xl text-left">
              Gitcoin {name}
              {name === "Alpha" || name === "Beta" ? " Round" : ""}
            </p>
            {roundInView && start ? (
              <p className="text-base font-bold text-left mb-0">
                {moment.unix(parseFloat(start || "0")).format("MMMM Do YYYY (h:mm:ss a)")} {" - "}
                {roundEndTimestamp.format("MMMM Do YYYY (h:mm:ss a)")}
              </p>
            ) : (
              <></>
            )}
            <p className="text-base text-left mb-0">
              Staked GTC only affects your Passport score during the above time period.
            </p>
            <p className="text-base text-left mb-0">
              When this time period is over, you can re-stake your GTC for the next period
            </p>
            <p className="text-base text-left mb-4">or you can un-stake your GTC.</p>
          </div>
          <Button
            disabled={pending}
            onClick={() => getData()}
            className="rounded-sm bg-purple-connectPurple py-2 px-10 text-white"
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
                    pending={pending}
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
                  {amountStakedOnMe.gt(0)
                    ? "People from your community have staked on your identity!"
                    : "Collect a Community Staking stamp when other people stake on your identity."}
                </h2>
              </div>

              <div className="flex-grow mt-4">
                {amountStakedOnMe.gt(0) ? (
                  <div className="flex flex-col">
                    <p className="leading-relaxed text-base text-left">
                      You can now collect a Community Staking stamp on your Passport - visit Passport to do so now!
                    </p>
                    <p className="text-black text-left text-xl">{formatGtc(amountStakedOnMe)} GTC</p>
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
                    href="https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-passport/identity-staking-questions#what-is-community-staking"
                    className="mt-3 text-indigo-500 inline-flex items-center"
                  >
                    More Info
                  </a>
                </div>
              </div>
            </div>
            <div className="border border-asideBorder px-4 py-6 rounded-lg bg-asideBG mt-6">
              <div className="flex flex-row items-center">
                <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0">
                  <InfoCircleOutlined style={{ fontSize: "25px" }} />
                </div>
                <h2 className="text-gray-900 text-md text-left ml-4 mb-0">Prior Seasons & Unstaking Information:</h2>
              </div>

              <div className="flex-grow mt-4">
                <div className="flex flex-col">
                  <p className="leading-relaxed text-base text-left">
                    Season 18 concluded on August 31st. If you wish to manage stakes from previous seasons, including
                    Alpha, Beta, and Season 18, scroll down to the{" "}
                    <a className="underline" href="#viewing-stake-for">
                      Viewing Stake for
                    </a>{" "}
                    section at the bottom of this page. You can select the relevant round to unstake or restake as
                    needed.
                  </p>
                </div>
              </div>
            </div>
            {roundEnded || (
              <div className="border border-asideBorder px-4 py-6 rounded-lg mt-6 bg-asideBG">
                <div className="flex flex-row items-center">
                  <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0">
                    <LockOutlined style={{ fontSize: "25px" }} />
                  </div>
                  <h2 className="text-gray-900 text-md text-left ml-4 mb-0">When can I unstake?</h2>
                </div>

                <div className="flex-grow mt-4">
                  <p className="leading-relaxed text-base text-left">
                    In order to prevent sybil attacks, staked GTC will be locked until the end of the round.
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
        <div id="viewing-stake-for">
          Viewing Stake for:
          <span className="ml-2">
            <RoundSelector />
          </span>
        </div>
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
    </div>
  );
}

export default StakeDashboard;
