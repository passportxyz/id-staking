const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("My Dapp", function () {
  describe("YourContract", function () {
    this.beforeEach(async function () {
      [this.owner, this.user] = await ethers.getSigners();

      const Token = await ethers.getContractFactory("GTC");
      const token = await Token.deploy(
        this.owner.address,
        this.owner.address,
        Math.floor(new Date().getTime() / 1000) + 2
      );

      await token.connect(this.owner).mint(this.owner.address, 1000000);
      await token.connect(this.owner).mint(this.user.address, 1000000);

      const YourContract = await ethers.getContractFactory("IDStaking");

      this.idStaking = await YourContract.deploy(token.address);

      await this.idStaking.deployed();

      await token.connect(this.user).approve(this.idStaking.address, 1000000);

      await this.idStaking.createRound(
        Math.floor(Date.now() / 1000) + 10,
        100000,
        "Test"
      );
    });

    describe("setPurpose()", function () {
      it("Should be able to set a new purpose", async function () {
        await this.idStaking.connect(this.user).stake(1, 100000);

        await this.idStaking
          .connect(this.user)
          .stakeUsers(1, [this.owner.address], [100000]);

        await this.idStaking
          .connect(this.user)
          .stakeUsers(1, [this.owner.address], [200000]);

        await this.idStaking
          .connect(this.owner)
          .stakeUsers(1, [this.user.address], [100000]);

        await this.idStaking
          .connect(this.owner)
          .stakeUsers(1, [this.user.address], [200000]);

        await this.idStaking.connect(this.owner).stake(1, 100000);
      });
    });
  });
});
