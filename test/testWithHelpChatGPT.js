const { expect } = require("chai");
const { ethers } = require('hardhat');


describe("Uni", function () {
  let owner, minter, newMinter, recipient, spender, alice, bob, sender, src, dst, delegatee, signatory, account1, account2, user;
  let Uni;
  let uni;
  let nonce;
  let expiry;

  beforeEach(async function () {
    [owner, minter, newMinter, recipient, spender, alice, bob, sender, src, dst, delegatee, account1, account2, user] = await ethers.getSigners();
    const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
    const Uni = await ethers.getContractFactory("Uni");
    const mintingAllowedAfter_ = Date.now() * 24;
    uni = await Uni.deploy(owner.address, minter.address, mintingAllowedAfter_);
    await uni.deployed();
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
    expect(await uni.totalSupply()).to.equal(ethers.utils.parseUnits("1000000000", "ether"));
  });

  it("Should set the initial balance of the deployer", async () => {
    expect(await uni.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits("1000000000", "ether"));
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

// test fonction setMinter

  it("should allow the minter to change the minter address", async function () {
    await uni.connect(minter).setMinter(newMinter.address);
    expect(await uni.minter()).to.equal(newMinter.address);
  });

  it("should not allow a non-minter to change the minter address", async function () {
    await expect(
      uni.connect(owner).setMinter(newMinter.address)
    ).to.be.revertedWith("Uni::setMinter: only the minter can change the minter address");
  });

// test fonction mint

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

// test fonction allowance

  it("returns the correct allowance amount", async function() {

    // Approbation de la dépense
    const amountToApprove = ethers.utils.parseUnits("100", "ether");
    await uni.approve(spender.address, amountToApprove);

    // Vérification de l'approbation
    const allowanceAmount = await uni.allowance(owner.address, spender.address);
    expect(allowanceAmount).to.equal(allowanceAmount, amountToApprove, "Allowance amount is not correct");
  });

//test fonction approve

  it("allows the spender to transfer tokens up to the approved amount", async function() {

    // Approbation de la dépense
    const amountToApprove = ethers.utils.parseUnits("100", "ether");
    const approvalResult = await uni.approve(spender.address, amountToApprove);

    // Vérification que l'approbation a réussi
    expect(approvalResult).to.emit(uni, "Approval").withArgs(owner.address, spender.address, amountToApprove);

    // Vérification de l'approbation
    const allowanceAmount = await uni.allowance(owner.address, spender.address);
    expect(allowanceAmount).to.equal(amountToApprove, "Allowance amount is not correct");
  });

  // it("allows for an infinite amount to be approved", async function() {

  //   // Approbation de la dépense avec un montant infini
  //   const approvalResult = await uni.approve(spender.address, ethers.constants.MaxUint256);

  //   // Vérification que l'approbation a réussi
  //   expect(approvalResult).to.emit(uni, "Approval").withArgs(owner.address, spender.address, ethers.constants.MaxUint256);

  //   // Vérification de l'approbation
  //   const allowanceAmount = await uni.allowance(owner.address, spender.address);
  //   expect(allowanceAmount).to.equal(ethers.constants.MaxUint256, "Allowance amount is not correct");
  // });

//tests fonction permit

//   it("should permit spending", async function () {
//     const owner = ethers.Wallet.createRandom().address;
//     const spender = ethers.Wallet.createRandom().address;
//     const rawAmount = ethers.BigNumber.from(100);
//     const deadline = Math.floor(Date.now() / 1000) + 3600; // Expire in 1 hour
//     const nonce = await uni.nonces(owner);
//     const domainSeparator = await uni.DOMAIN_SEPARATOR();
//     const PERMIT_TYPEHASH = await uni.PERMIT_TYPEHASH();
//     const digest = ethers.utils.keccak256(
//       ethers.utils.solidityPack(
//         ["bytes1", "bytes1", "bytes32", "bytes32"],
//         [
//           "0x19",
//           "0x01",
//           domainSeparator,
//           ethers.utils.keccak256(
//             ethers.utils.solidityPack(
//               ["bytes32", "address", "address", "uint256", "uint256", "uint256"],
//               [PERMIT_TYPEHASH, owner, spender, rawAmount, nonce, deadline]
//             )
//           ),
//         ]
//       )
//     );
//     const signature = await ethers.provider.getSigner(owner).signMessage(ethers.utils.arrayify(digest));
//     const { v, r, s } = ethers.utils.splitSignature(signature);

//     await uni.permit(owner, spender, rawAmount, deadline, v, r, s);

//     expect(await uni.allowance(owner, spender)).to.equal(rawAmount);
//   });
// });


//test fonction balanceOf

  // it("should return the balance of an account", async function () {
  //   // Mint 100 tokens to Alice
  //   await uni.mint(alice.address, 100);
  //   const balance = await uni.balanceOf(alice.address);
  //   expect(balance).to.equal(100);
  // });

  // it("should return 0 balance for an account with no tokens", async function () {
  //   // Mint 100 tokens to Alice
  //   await uni.mint(alice.address, 100);
  //   const balance = await uni.balanceOf(owner.address);
  //   expect(balance).to.equal(0);
  // });

//test fonction transfer

  // it("Should transfer tokens from sender to recipient", async function () {
  //   const initialBalance = await uni.balanceOf(sender.address);
  //   const amount = ethers.utils.parseEther("100");
  //   await uni.transfer(recipient.address, amount);
  //   const senderBalance = await uni.balanceOf(sender.address);
  //   const recipientBalance = await uni.balanceOf(recipient.address);
  //   expect(senderBalance.toString()).to.equal(initialBalance.sub(amount).toString(), "Sender balance incorrect");
  //   expect(recipientBalance.toString()).to.equal(amount.toString(), "Recipient balance incorrect");
  // });

//test fonction transferfrom

  it("should transfer tokens from source to destination", async function () {
    const initialBalance = ethers.BigNumber.from(100);
    const amount = ethers.BigNumber.from(50);

    // Mint tokens to the source account
    await uni.connect(owner).mint(src.address, initialBalance);

    // Approve the spender to transfer tokens from the source account
    await uni.connect(src).approve(owner.address, amount);

    // Transfer tokens from the source to the destination account
    await uni.connect(owner).transferFrom(src.address, dst.address, amount);

    // Check the balances
    const srcBalance = await uni.balanceOf(src.address);
    const dstBalance = await uni.balanceOf(dst.address);
    //assert.equal(srcBalance.toString(), initialBalance.sub(amount).toString(), "Source balance incorrect");
    expect(srcBalance.toString()).to.equal(initialBalance.sub(amount).toString(),"Source balance incorrect" );
    //assert.equal(dstBalance.toString(), amount.toString(), "Destination balance incorrect");
    expect(dstBalance.toString(), amount.toString()).to.equal(amount.toString(), "Destination balance incorrect");
  });

  it("should revert if the spender tries to transfer more tokens than allowed", async function () {
    const initialBalance = ethers.BigNumber.from(100);
    const amount = ethers.BigNumber.from(150);

    // Mint tokens to the source account
    await uni.connect(owner).mint(src.address, initialBalance);

    // Approve the spender to transfer tokens from the source account
    await uni.connect(src).approve(owner.address, initialBalance);

    // Attempt to transfer tokens from the source to the destination account
    await expect(uni.connect(owner).transferFrom(src.address, dst.address, amount))
  .to.be.revertedWith("Uni::transferFrom: transfer amount exceeds spender allowance");

  });

  //test fonction delegate

  it("should delegate votes from the owner to the delegatee", async function() {
    await uni.delegate(delegatee.address);
    expect(await uni.delegates(owner.address)).to.equal(delegatee.address);
  });

//test fonction delegateBySig

  it("should delegate votes from signatory to delegatee", async function () {
    nonce = 0;
    expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const domainSeparator = await uni.DOMAIN_SEPARATOR();
    const delegationTypehash = await uni.DELEGATION_TYPEHASH();
    const structHash = await ethers.utils.solidityKeccak256(
      ["bytes32", "address", "uint256", "uint256"],
      [
        delegationTypehash,
        delegatee.address,
        nonce,
        expiry,
      ]
    );
    const digest = await ethers.utils.solidityKeccak256(
      ["bytes1", "bytes1", "bytes32", "bytes32"],
      [
        "0x19",
        "0x01",
        domainSeparator,
        structHash,
      ]
    );

    const { v, r, s } = await ethers.utils.signDigest(digest, signatory.privateKey);
    await uni.delegateBySig(delegatee.address, nonce, expiry, v, r, s);

    expect(await uni.delegates(signatory.address)).to.equal(delegatee.address);
  });

  it("should revert if the signature is invalid", async function () {
    nonce = 0;
    expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const invalidSignatory = ethers.Wallet.createRandom().address;
    const domainSeparator = await uni.DOMAIN_SEPARATOR();
  });

//test getCurrentVotes

  it("should return the current votes balance for the account", async function () {
    // Account 1 transfers some tokens to Account 2
    const transferAmount = ethers.utils.parseUnits("1000", 18);
    await uni.transfer(account1.address, transferAmount);
    await uni.connect(account1).transfer(account2.address, transferAmount);

    // Account 2 delegates votes to Account 1
    await uni.connect(account2).delegate(account1.address);

    // Get the current votes balance for Account 1 and Account 2
    const votesAccount1 = await uni.getCurrentVotes(account1.address);
    const votesAccount2 = await uni.getCurrentVotes(account2.address);

    // Assert that the current votes balance is correct
    expect(votesAccount1).to.equal(transferAmount);
    expect(votesAccount2).to.equal(0);
  });

//test fonction getPriorVotes

  it("should return the correct number of votes as of a previous block", async function() {
    // Transfer some tokens to account1 and delegate to owner
    const amount = ethers.utils.parseEther("100");
    await uni.connect(owner).transfer(account1.address, amount);
    await uni.connect(account1).delegate(owner.address);
    
    // Wait 5 blocks
    for(let i = 0; i < 5; i++) {
      await ethers.provider.send("evm_mine", []);
    }
    
    // Get the current block number and prior block number
    const currentBlockNumber = await ethers.provider.getBlockNumber();
    const priorBlockNumber = currentBlockNumber - 1;
    
    // Get the prior number of votes for account1 as of the prior block number
    const priorVotes = await uni.getPriorVotes(account1.address, priorBlockNumber);
    
    // Ensure the prior votes are correct
    expect(priorVotes).to.equal(amount, "Prior votes are incorrect");

  });

  //test fonction _delegate  
  
  it("should delegate votes and emit an event", async function () {
    const initialBalance = ethers.utils.parseEther("100");
    // Delegate votes from owner to delegatee
    await uni.connect(owner)._delegate(owner.address, delegatee.address);

    // Check that the delegatee is set correctly
    expect(await uni.delegates(owner.address)).to.equal(delegatee.address);

    // Check that the DelegateChanged event is emitted
    const event = await uni.queryFilter("DelegateChanged");
    expect(event.length).to.equal(1);
    expect(event[0].args.delegator).to.equal(owner.address);
    expect(event[0].args.currentDelegate).to.equal(owner.address);
    expect(event[0].args.delegatee).to.equal(delegatee.address);
  });

  it("should move delegate's votes", async function () {
    const initialBalance = ethers.utils.parseEther("100");

    // Transfer some tokens to user
    const amount = ethers.utils.parseEther("10");
    await uni.transfer(user.address, amount);

    // Delegate votes from owner to delegatee
    await uni.connect(owner)._delegate(owner.address, delegatee.address);

    // Check that the delegatee has the same number of votes as the owner
    const delegateeVotes = await uni.getCurrentVotes(delegatee.address);
    const ownerVotes = await uni.getCurrentVotes(owner.address);
    expect(delegateeVotes).to.equal(ownerVotes);

    // Move some of user's votes to delegatee
    await uni.connect(user)._delegate(delegatee.address, { gasLimit: 100000 });

    // Check that the delegatee's votes have increased
    const delegateeVotes2 = await uni.getCurrentVotes(delegatee.address);
    expect(delegateeVotes2).to.be.gt(delegateeVotes);

    // Check that the owner's votes have decreased
    const ownerVotes2 = await uni.getCurrentVotes(owner.address);
    expect(ownerVotes2).to.be.lt(ownerVotes);
  }); 

  //test fonction _transferTokens (internal?)
  
  it.only("should transfer tokens from one address to another", async function () {
    const amount = 10; // 10 ETH
    const weiAmount = ethers.utils.parseEther(amount.toString());

    await uni.mint(owner.address, weiAmount);

    const initialSrcBalance = await uni.balanceOf(owner.address);
    const initialDstBalance = await uni.balanceOf(alice.address);

    await uni.transfer(alice.address, weiAmount);

    const finalSrcBalance = await uni.balanceOf(owner.address);
    const finalDstBalance = await uni.balanceOf(alice.address);

    // assert.equal(finalSrcBalance, sub96(initialSrcBalance, toWei("10")), "Invalid source balance after transfer");
    //assert.equal(finalDstBalance, add96(initialDstBalance, toWei("10")), "Invalid destination balance after transfer");
    expect(finalSrcBalance).to.equal(sub96(initialSrcBalance, weiAmount), "Invalid source balance after transfer");
    expect(finalDestBalance).to.equal(add96(initialDestBalance, weiAmount), "Invalid destination balance after transfer");
 
  });

  it("should not transfer tokens from/to the zero address", async function () {
    await uni.mint(owner.address, toWei("100"));

    await expect(uni.transfer(constants.ZERO_ADDRESS, toWei("10"))).to.be.revertedWith(
      "Uni::_transferTokens: cannot transfer from/to the zero address"
    );
  });

  it("should not transfer tokens if the sender does not have enough balance", async function () {
    await uni.mint(owner.address, toWei("100"));

    await expect(uni.connect(alice).transfer(bob.address, toWei("101"))).to.be.revertedWith(
      "Uni::_transferTokens: transfer amount exceeds balance"
    );
  });
  
//test fonction _moveDelegates, _writeCheckpoint, safe32, safe96, add96, sub96, getChainId --> internal? 


});