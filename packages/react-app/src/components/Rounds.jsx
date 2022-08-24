import React from "react";
import { Button, Empty, Form, InputNumber, Menu, Table, Typography } from "antd";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import moment from "moment";
import { useState } from "react";
import Address from "./Address";
import AddressInput from "./AddressInput";
import { gql, useQuery } from "@apollo/client";
// import

const zero = ethers.BigNumber.from("0");

export const STARTING_GRANTS_ROUND = 15;

const Rounds = ({
  tokenSymbol,
  address,
  readContracts,
  stake,
  unstake,
  migrate,
  round,
  latestRound,
  mainnetProvider,
  stakeUsers,
  unstakeUsers,
}) => {
  const [form] = Form.useForm();
  const [openView, setOpenView] = useState("self");
  const [usersToUnstake, setUsersToUnstake] = useState([]);

  const query = gql(`
    query User($address: String!, $round: BigInt!) {
      user(id: $address) {
        xstakeTo (where: { amount_gt: 0, round: $round }) {
          id
          amount
          to {
            address
          }
        }
      }
    }
  `);

  const { loading, data, error } = useQuery(query, {
    pollInterval: 2500,
    variables: {
      address: address.toLowerCase(),
      round: round,
    },
  });

  console.log({ data, error });

  const stakedBalance = ethers.utils.formatUnits(
    useContractReader(readContracts, "IDStaking", "getUserStakeForRound", [round, address]) || zero,
  );

  const [start, duration, tvl] = useContractReader(readContracts, "IDStaking", "fetchRoundMeta", [round]) || [];

  const handleStakeUsers = async v => {
    console.log(v);
    await stakeUsers(round, [v.address], [ethers.utils.parseUnits(`${v.amount}`)]);
  };

  const columns = [
    {
      title: "User",
      dataIndex: ["to", "address"],
      key: ["to", "address"],
      render: text => <Address ensProvider={mainnetProvider} address={text} fontSize={14} />,
    },
    {
      title: "Amount (GTC)",
      dataIndex: "amount",
      key: "id",
      render: text => <span>{ethers.utils.formatUnits(text)} GTC</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <a
          href="#"
          onClick={async e => {
            e.preventDefault();

            await unstakeUsers(round, [record.to.address]);
          }}
        >
          Unstake
        </a>
      ),
    },
  ];

  return (
    <div className="pt-2 pb-2 w-full">
      <div className="container p-6">
        <div className="border-b-2">
          <p className="font-miriam-libre text-3xl text-left">
            Gitcoin Round {STARTING_GRANTS_ROUND + parseInt(round)} {/*{round} of {latestRound}*/}
          </p>
          <p className="font-miriam-libre text-base text-left mb-4">
            {moment.unix((start || zero).toString()).format("MMMM Do YYYY (h:mm:ss a)")} {" - "}
            {moment.unix((start || zero).add(duration || zero).toString()).format("MMMM Do YYYY (h:mm:ss a)")}
          </p>
        </div>
        {/* <div>
          stake of TVL: {stakedBalance} {tokenSymbol} staked of {ethers.utils.formatEther(tvl || zero)} {tokenSymbol}
        </div> */}
        {/* Stake Layout */}
        <div className="flex flex-row">
          <div className="text-gray-600 body-font w-4/5">
            <div className="container px-5 py-24 mx-auto">
              <div className="flex items-center lg:w-4/5 mx-auto border-b pb-10 mb-10 border-gray-200 sm:flex-row flex-col">
                <div className="w-20 h-20 sm:mr-10 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <div className="flex-grow sm:text-left text-center mt-6 sm:mt-0">
                  <h2 className="text-gray-900 text-lg title-font font-medium mb-2">Stake on yourself</h2>
                  <p className="leading-relaxed text-base">Some explanation on what this means</p>
                </div>
                <div className="flex-grow sm:text-left text-center mt-6 sm:mt-0">
                  <h2 className="text-gray-900 text-lg title-font font-medium mb-2">0 GTC</h2>
                  <p className="leading-relaxed text-base">Staked</p>
                </div>
                <button className="flex mx-auto text-white bg-purple-connectPurple border-0 py-2 px-20 focus:outline-none hover:bg-indigo-600 rounded-sm text-lg font-miriam-libre">
                  Stake
                </button>
              </div>

              <div className="flex items-center lg:w-4/5 mx-auto sm:flex-row flex-col">
                <div className="w-20 h-20 sm:mr-10 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="flex-grow sm:text-left text-center mt-6 sm:mt-0">
                  <h2 className="text-gray-900 text-lg title-font font-medium mb-2">Stake on other people</h2>
                  <p className="leading-relaxed text-base">Some explanation on what this means</p>
                </div>
                <div className="flex-grow sm:text-left text-center mt-6 sm:mt-0">
                  <h2 className="text-gray-900 text-lg title-font font-medium mb-2">0 GTC</h2>
                  <p className="leading-relaxed text-base">Staked</p>
                </div>
                <button className="flex mx-auto text-white bg-purple-connectPurple border-0 py-2 px-20 focus:outline-none hover:bg-indigo-600 rounded-sm text-lg font-miriam-libre">
                  Stake
                </button>
              </div>
            </div>
          </div>

          {/* Passport Windows on the  side */}
          <div className="p-4 w-1/3 flex flex-col">
            <div className="border-2 border-gray-200 px-4 py-6 rounded-lg bg-purple-200">
              <div className="flex flex-row items-center">
                <div className="ml-2 w-10 h-10 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <h2 className="text-gray-900 text-md text-left ml-6">
                  Get staked and receive the Community Staking stamp
                </h2>
              </div>

              <div className="flex-grow pl-6 mt-4">
                <p className="leading-relaxed text-base text-left border-b-2">
                  Looks like no one has staked on you yet. Get people you know to stake on you and receive the community
                  staking stamp on Gitcoin Passport.
                </p>
                <a className="mt-3 text-indigo-500 inline-flex items-center">More Info</a>
              </div>
            </div>
            <div className="border-2 border-gray-200 px-4 py-6 rounded-lg mt-6 bg-purple-200">
              <div className="flex flex-row items-center">
                <div className="ml-2 w-10 h-10 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <h2 className="text-gray-900 text-md text-left ml-6">Useful Info 1</h2>
              </div>

              <div className="flex-grow pl-6 mt-4">
                <p className="leading-relaxed text-base text-left border-b-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                </p>
                <a className="mt-3 text-indigo-500 inline-flex items-center">More Info</a>
              </div>
            </div>
          </div>
        </div>

        {/* <Menu
          mode="horizontal"
          defaultSelectedKeys={["self"]}
          style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
          onSelect={({ key }) => setOpenView(key)}
        >
          <Menu.Item key="self">Self Staking</Menu.Item>
          <Menu.Item key="community">Community Staking</Menu.Item>
        </Menu>

        <div style={{ padding: "5px", marginTop: "10px" }}>
          {openView === "self" && (
            <div style={{ width: "100%", marginTop: "5px" }}>
              <Button style={{ marginRight: "10px" }} onClick={() => stake(round, "100")}>
                Stake 100 {tokenSymbol}
              </Button>
              <Button style={{ marginRight: "10px" }} onClick={() => unstake(round, "100")}>
                Unstake 100 {tokenSymbol}
              </Button>
              {round !== latestRound && stakedBalance !== "0.0" && (
                <Button style={{ marginRight: "10px" }} onClick={() => migrate(round)}>
                  Migrate Stake {tokenSymbol}
                </Button>
              )}
            </div>
          )}

          {openView === "community" && (
            <div style={{ width: "100%", marginTop: "5px" }}>
              <Typography.Title level={5} style={{ marginBottom: "10px" }}>
                Stake on other user
              </Typography.Title>
              <Form
                form={form}
                style={{
                  margin: "0px auto",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  padding: "0px 10px",
                }}
                initialValues={{ amount: "10" }}
                name="stakeUsers"
                layout="inline"
                onFinish={handleStakeUsers}
              >
                <Form.Item name="address" required>
                  <AddressInput ensProvider={mainnetProvider} placeholder="Address of user" />
                </Form.Item>
                <Form.Item name="amount" required>
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item>
                  <Button style={{ marginRight: "10px" }} htmlType="submit">
                    Stake on User
                  </Button>
                </Form.Item>
              </Form>

              {!loading && (data?.user?.xstakeTo || []).length > 0 ? (
                <div style={{ marginTop: "20px" }}>
                  <Table
                    rowSelection={{ type: "checkbox", onChange: keys => setUsersToUnstake(keys) }}
                    rowKey={x => x.to.address}
                    columns={columns}
                    dataSource={data?.user?.xstakeTo || []}
                  />
                  {usersToUnstake.length > 0 && (
                    <Button
                      onClick={async () => {
                        await unstakeUsers(round, usersToUnstake);
                      }}
                    >
                      Unstake {usersToUnstake.length} users
                    </Button>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: "30px" }}>
                  <Empty description="You haven't staked on anyone in the community... yet" />
                </div>
              )}
            </div>
          )} 
        </div>*/}
      </div>
    </div>
  );
};

export default Rounds;
