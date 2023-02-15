const { expect } = require("chai");
const { ethers } = require('hardhat');
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

//Tests pris de la documentation de Hardhat 

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

    // Transfer 50 tokens from owner to addr1
    await expect(hardhatUni.transfer(addr1.address, 50)).to.changeTokenBalances(hardhatUni, [owner, addr1], [-50, 50]);

    // Transfer 50 tokens from addr1 to addr2
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


//Tests demandés à ChatGPT pour la fonction constructor

describe("Uni Token", function () {
  let uniToken;
  let owner, minter;

  beforeEach(async function () {
    [owner, minter] = await ethers.getSigners();
    const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    const UniToken = await ethers.getContractFactory("Uni");
    uniToken = await UniToken.connect(owner).deploy(owner.address, minter.address, currentTime + 10000);
    await uniToken.deployed();
  });

  // it("should set the minter and mintingAllowedAfter correctly", async function () {
  //   const expectedMintingAllowedAfter = (await ethers.provider.getBlock("latest")).timestamp + 10000;
  //   expect(await uniToken.minter()).to.equal(minter.address);
  //   expect(await uniToken.mintingAllowedAfter()).to.equal(expectedMintingAllowedAfter);
  // });
 
  // it("should set the initial account's balance correctly", async function () {
  //   expect(await uniToken.balanceOf(owner.address)).to.equal(uniToken.totalSupply());
  // });

  it("Should have a total supply of 1 billion tokens", async () => {
    expect(await uniToken.totalSupply()).to.equal(ethers.utils.parseUnits("1000000000", "ether"));
  });

  it("Should set the initial balance of the deployer", async () => {
    expect(await uniToken.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits("1000000000", "ether"));
  });

  // it("should emit Transfer event when initial account is set", async function () {
  //   await expect(uniToken.deployTransaction).to.emit(uniToken, "Transfer").withArgs(0x0000000000000000000000000000000000000000, owner.address, totalSupply);
  // });

  // it("should emit MinterChanged event when minter is set", async function () {
  //   await expect(uniToken.deployTransaction).to.emit(uniToken, "MinterChanged").withArgs(address(0), minter.address);
  // });

  it("should throw error if mintingAllowedAfter is in the past", async function () {
    const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    const UniToken = await ethers.getContractFactory("Uni");
    await expect(
      UniToken.connect(owner).deploy(owner.address, minter.address, currentTime - 10000)
    ).to.be.revertedWith("Uni::constructor: minting can only begin after deployment");
  });
});
