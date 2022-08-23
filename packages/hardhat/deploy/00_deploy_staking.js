// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const admin = "0x77B8A624b2e8f6772C0f20c683b075E2bf778d64";
  // const trustedSigner = "0x7ba1e5E9d013EaE624D274bfbAC886459F291081";
  const trustedSigner = "0xb9598Aca9eDA4e229924726A11b38d8073184899";

  await deploy("Token", {
    from: deployer,
    log: true,
    waitConfirmations: 5,
  });

  const Token = await ethers.getContract("Token", deployer);

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
