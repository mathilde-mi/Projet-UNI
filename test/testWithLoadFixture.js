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
  
    it("Should transfer tokens between accounts", async function () {
      const { hardhatUni, owner, addr1, addr2 } = await loadFixture(deployUniFixture);

      await expect(hardhatUni.transfer(addr1.address, 50)).to.changeTokenBalances(hardhatUni, [owner, addr1], [-50, 50]);
      await expect(hardhatUni.connect(addr1).transfer(addr2.address, 50)).to.changeTokenBalances(hardhatUni, [addr1, addr2], [-50, 50]);
    });
  
    //  it("Should set the right owner", async function () {
    //    const { hardhatUni, owner } = await loadFixture(deployUniFixture);
  
    //    expect(await hardhatUni.owner()).to.equal(owner.address);
    //  });
  
    it("Should emit Transfer events", async function () {
      const { hardhatUni, owner, addr1, addr2 } = await loadFixture(deployUniFixture);
  
      // Transfer 50 tokens from owner to addr1
      await expect(hardhatUni.transfer(addr1.address, 50)).to.emit(hardhatUni, "Transfer").withArgs(owner.address, addr1.address, 50);
  
      // Transfer 50 tokens from addr1 to addr2
      await expect(hardhatUni.connect(addr1).transfer(addr2.address, 50)).to.emit(hardhatUni, "Transfer").withArgs(addr1.address, addr2.address, 50);
    });
  
    // it("Should fail if sender doesn't have enough tokens", async function () {
    //   const { hardhatUni, owner, addr1 } = await loadFixture(deployUniFixture);
    //   const initialOwnerBalance = await hardhatUni.balanceOf(owner.address);
  
    //   // Try to send 1 token from addr1 (0 tokens) to owner.
    //   await expect(hardhatUni.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith("Not enough tokens");
  
    //   // Owner balance shouldn't have changed.
    //   expect(await hardhatUni.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    // });
  });