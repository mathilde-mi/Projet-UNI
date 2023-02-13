const { expect } = require("chai");

describe("Uni", function () {
  it.only("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();

    const Uni = await ethers.getContractFactory("Uni");

    const hardhatUni = await Uni.deploy(address account, address minter_, uint mintingAllowedAfter_);

    const ownerBalance = await hardhatUni.balanceOf(owner.address);
    expect(await hardhatUni.totalSupply()).to.equal(ownerBalance);
  });
});