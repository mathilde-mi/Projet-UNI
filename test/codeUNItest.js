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

describe("Uni", function () {
  let uniToken;
  let owner, minter;

  beforeEach(async function () {
    [owner, minter] = await ethers.getSigners();
    // [addressZero] = await ethers.getSigner(0);
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
  //   await expect(uniToken.deployTransaction).to.emit(uniToken, "MinterChanged").withArgs(addressZero, minter.address);
  // });

  it("should throw error if mintingAllowedAfter is in the past", async function () {
    const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    const UniToken = await ethers.getContractFactory("Uni");
    await expect(
      UniToken.connect(owner).deploy(owner.address, minter.address, currentTime - 10000)
    ).to.be.revertedWith("Uni::constructor: minting can only begin after deployment");
  });
});

// test fonction setMinter

describe("Uni", function () {
  let Uni;
  let uni;
  let owner;
  let minter;
  let newMinter;

  beforeEach(async function () {
    Uni = await ethers.getContractFactory("Uni");
    [owner, minter, newMinter] = await ethers.getSigners();
    //uni = await Uni.connect(owner).deploy(minter.address);
    const mintingAllowedAfter_ = Date.now() * 24;
    uni = await Uni.deploy(owner.address, minter.address, mintingAllowedAfter_);
  });
  it("should allow the minter to change the minter address", async function () {
    await uni.connect(minter).setMinter(newMinter.address);
    expect(await uni.minter()).to.equal(newMinter.address);
  });
  it("should not allow a non-minter to change the minter address", async function () {
    await expect(
      uni.connect(owner).setMinter(newMinter.address)
    ).to.be.revertedWith("Uni::setMinter: only the minter can change the minter address");
  });
});

// test fonction mint

describe("Uni contract", function () {
  let Uni;
  let uni;
  let owner;
  let minter;
  let recipient;

  beforeEach(async function () {
    Uni = await ethers.getContractFactory("Uni");
    [owner, minter, recipient] = await ethers.getSigners();
    //uni = await Uni.connect(owner).deploy(minter.address);
    const mintingAllowedAfter_ = Date.now() * 124;
    uni = await Uni.deploy(owner.address, minter.address, mintingAllowedAfter_);
  });

  describe("mint", function () {
    // it("should allow the minter to mint new tokens", async function () {
    //   const amountToMint = ethers.utils.parseEther("100");
    //   const initialTotalSupply = await uni.totalSupply();
    //   const initialRecipientBalance = await uni.balanceOf(recipient.address);

    //   await uni.connect(minter).mint(recipient.address, amountToMint);

    //   const finalTotalSupply = await uni.totalSupply();
    //   const finalRecipientBalance = await uni.balanceOf(recipient.address);

    //   expect(finalTotalSupply).to.equal(initialTotalSupply.add(amountToMint));
    //   expect(finalRecipientBalance).to.equal(initialRecipientBalance.add(amountToMint));
    // });

    it("should not allow a non-minter to mint new tokens", async function () {
      const amountToMint = ethers.utils.parseEther("100");

      await expect(
        uni.connect(recipient).mint(recipient.address, amountToMint)
      ).to.be.revertedWith("Uni::mint: only the minter can mint");
    });

    // it("should not allow minting before the mintingAllowedAfter time", async function () {
    //   const amountToMint = ethers.utils.parseEther("100");
    //   const futureTime = (await ethers.provider.getBlock("latest")).timestamp + 60;

    //   await uni.setMintingAllowedAfter(futureTime);

    //   await expect(
    //     uni.connect(minter).mint(recipient.address, amountToMint)
    //   ).to.be.revertedWith("Uni::mint: minting not allowed yet");
    // });

    // it("should not allow minting to the zero address", async function () {
    //   const amountToMint = ethers.utils.parseEther("100");

    //   await expect(
    //     uni.connect(minter).mint("0x0000000000000000000000000000000000000000", amountToMint)
    //   ).to.be.revertedWith("Uni::mint: cannot transfer to the zero address");
    // });

    // it("should not exceed the mint cap", async function () {
    //   const amountToMint = ethers.utils.parseEther("100");
    //   const mintCap = await uni.mintCap();
    //   const totalSupply = await uni.totalSupply();

    //   await expect(
    //     uni.connect(minter).mint(recipient.address, mintCap.sub(totalSupply).add(amountToMint))
    //   ).to.be.revertedWith("Uni::mint: exceeded mint cap");
    // });
  });


// test fonction allowance

  describe("allowance", function() {
    it("returns the correct allowance amount", async function() {
      const [owner, spender] = await ethers.getSigners();
  
      // Création d'une instance de contrat
      const Uni = await ethers.getContractFactory("Uni");
      const mintingAllowedAfter_ = Date.now() * 124;
      const tokenInstance = await Uni.deploy(owner.address, minter.address, mintingAllowedAfter_);
      await tokenInstance.deployed();

      // Approbation de la dépense
      const amountToApprove = ethers.utils.parseUnits("100", "ether");
      await tokenInstance.approve(spender.address, amountToApprove);
  
      // Vérification de l'approbation
      const allowanceAmount = await tokenInstance.allowance(owner.address, spender.address);
      expect(allowanceAmount).to.equal(allowanceAmount, amountToApprove, "Allowance amount is not correct");
    });
  });

//test fonction approve

describe("approve", function() {
  it("allows the spender to transfer tokens up to the approved amount", async function() {
    const [owner, spender] = await ethers.getSigners();

    // Création d'une instance de contrat
    const token = await ethers.getContractFactory("Uni");
    const mintingAllowedAfter_ = Date.now() * 124;
    const tokenInstance = await Uni.deploy(owner.address, minter.address, mintingAllowedAfter_);
    await tokenInstance.deployed();    

    // Approbation de la dépense
    const amountToApprove = ethers.utils.parseUnits("100", "ether");
    const approvalResult = await tokenInstance.approve(spender.address, amountToApprove);

    // Vérification que l'approbation a réussi
    expect(approvalResult).to.emit(tokenInstance, "Approval").withArgs(owner.address, spender.address, amountToApprove);

    // Vérification de l'approbation
    const allowanceAmount = await tokenInstance.allowance(owner.address, spender.address);
    expect(allowanceAmount).to.equal(amountToApprove, "Allowance amount is not correct");
  });

  // it("allows for an infinite amount to be approved", async function() {
  //   const [owner, spender] = await ethers.getSigners();

  //   // Création d'une instance de contrat
  //   const token = await ethers.getContractFactory("Uni");
  //   const mintingAllowedAfter_ = Date.now() * 124;
  //   const tokenInstance = await Uni.deploy(owner.address, minter.address, mintingAllowedAfter_);
  //   await tokenInstance.deployed();

  //   // Approbation de la dépense avec un montant infini
  //   const approvalResult = await tokenInstance.approve(spender.address, ethers.constants.MaxUint256);

  //   // Vérification que l'approbation a réussi
  //   expect(approvalResult).to.emit(tokenInstance, "Approval").withArgs(owner.address, spender.address, ethers.constants.MaxUint256);

  //   // Vérification de l'approbation
  //   const allowanceAmount = await tokenInstance.allowance(owner.address, spender.address);
  //   expect(allowanceAmount).to.equal(ethers.constants.MaxUint256, "Allowance amount is not correct");
  // });
});




});
