// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const admin = "0x26c958dee4D9CcA4C106cb0D20F1DAcFbDCD5fd2";
  const trustedSigner = "0xb9598Aca9eDA4e229924726A11b38d8073184899";

  // const Token = await deploy("Token", {
  //   from: deployer,
  //   log: true,
  //   waitConfirmations: 5,
  // });

  const Token = { address: "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F" };

  const stakingArgs = [Token.address, trustedSigner];

  await deploy("IDStaking", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: stakingArgs,
    log: true,
    waitConfirmations: 5,
  });

  // Getting a previously deployed contract
  const IDStaking = await ethers.getContract("IDStaking", deployer);
  await IDStaking.transferOwnership(admin);

  // Verify from the command line by running `yarn verify`

  // You can also Verify your contracts with Etherscan here...
  // You don't want to verify on localhost
  try {
    if (chainId !== localChainId) {
      await run("verify:verify", {
        address: IDStaking.address,
        contract: "contracts/IDStaking.sol:IDStaking",
        constructorArguments: stakingArgs,
      });
    }
  } catch (error) {
    console.error(error);
  }
};
module.exports.tags = ["IDStaking", "Token"];
