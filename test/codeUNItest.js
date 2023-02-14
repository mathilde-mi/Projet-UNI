const { expect } = require("chai");
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Uni", function () {
  async function deployUniFixture() {
     const [owner, addr1, addr2] = await ethers.getSigners();
     const mintingAllowedAfter_ = Date.now() * 24;
     const Uni = await ethers.getContractFactory("Uni");
     const hardhatUni = await Uni.deploy(owner.address, addr1.address, mintingAllowedAfter_);

     return { Uni, hardhatUni, mintingAllowedAfter_, owner, addr1, addr2 };
     };

  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const { hardhatUni, owner } = await loadFixture(deployUniFixture);

    const ownerBalance = await hardhatUni.balanceOf(owner.address);
    expect(await hardhatUni.totalSupply()).to.equal(ownerBalance);
  });
});
