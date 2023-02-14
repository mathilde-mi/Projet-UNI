const { expect } = require("chai");
const { ethers } = require('hardhat');

describe("Uni", function () {

  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const mintingAllowedAfter_ = Date.now() * 24;
    const Uni = await ethers.getContractFactory("Uni");
    const hardhatUni = await Uni.deploy(owner.address, addr1.address, mintingAllowedAfter_);

    const ownerBalance = await hardhatUni.balanceOf(owner.address);
    expect(await hardhatUni.totalSupply()).to.equal(ownerBalance);
  });
});
