// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const { ADMIN_ADDRESS, TRUSTED_SIGNER_ADDRESS, USER_ADDRESS } = process.env;

  if (!ADMIN_ADDRESS || !TRUSTED_SIGNER_ADDRESS) {
    throw Error(
      "Must define ADMIN_ADDRESS and TRUSTED_SIGNER_ADDRESS in the env"
    );
  }

  let TokenDeployment;
  if (chainId === localChainId) {
    TokenDeployment = await deploy("Token", {
      from: deployer,
      log: true,
      waitConfirmations: 5,
    });
    if (USER_ADDRESS) {
      const Token = await ethers.getContract("Token", deployer);
      await Token.mint();
      await Token.transfer(USER_ADDRESS, ethers.utils.parseEther("100"));
    }
  } else {
    TokenDeployment = { address: "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F" };
  }

  const stakingArgs = [TokenDeployment.address, TRUSTED_SIGNER_ADDRESS];

  await deploy("IDStaking", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: stakingArgs,
    log: true,
    waitConfirmations: 5,
  });

  // Getting a previously deployed contract
  const IDStaking = await ethers.getContract("IDStaking", deployer);
  await IDStaking.transferOwnership(ADMIN_ADDRESS);

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
