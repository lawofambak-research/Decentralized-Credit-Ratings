const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("Basic Credit Rating Test", function () {

  let creditRatingTest;
  let NO_DEFAULT_USER;
  let DEFAULT_ONCE_USER;
  let DEFAULT_TWICE_USER;

  beforeEach(async function () {
    [NO_DEFAULT_USER, DEFAULT_ONCE_USER, DEFAULT_TWICE_USER] = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory("CreditRatingTest");
    creditRatingTest = await contractFactory.deploy();
  });

  it("Should only allow user create a credit profile once", async function () {
    // User first creates a credit profile
    await creditRatingTest.connect(NO_DEFAULT_USER).createProfile();

    // User tries to create a credit profile a second time
    await expect(
      creditRatingTest.connect(NO_DEFAULT_USER).createProfile()
    ).to.be.revertedWith("Already created Credit Profile");
  });

  it("User that has '0' amount of defaults should have a collateral factor equal to the default collateral factor", async function () {
    await creditRatingTest.connect(NO_DEFAULT_USER).createProfile();

    let defaultCollateralFactor = await creditRatingTest.defaultCollateralFactor();
    let borrowAmount = await creditRatingTest.connect(NO_DEFAULT_USER).getBorrowAmount();

    expect(defaultCollateralFactor).to.equal(borrowAmount);

    console.log("\nUser with 0 amount of defaults");
    console.log(`Default Collateral Factor: ${BigNumber.from(defaultCollateralFactor)}`);
    console.log(`User Borrow Amount: ${BigNumber.from(borrowAmount)}`);
  });

  it("User that has '1' amount of defaults should have a collateral factor equal to the default collateral factor subtracted by 5", async function () {
    await creditRatingTest.connect(DEFAULT_ONCE_USER).createProfile();

    let defaultCollateralFactor = await creditRatingTest.defaultCollateralFactor();

    // User defaults
    await creditRatingTest.connect(DEFAULT_ONCE_USER).defaultLoan();

    let borrowAmount = await creditRatingTest.connect(DEFAULT_ONCE_USER).getBorrowAmount();

    expect(borrowAmount).to.equal(defaultCollateralFactor - 5);

    console.log("\nUser with 1 amount of defaults");
    console.log(`Default Collateral Factor: ${BigNumber.from(defaultCollateralFactor)}`);
    console.log(`User Borrow Amount: ${BigNumber.from(borrowAmount)}`);
  });

  it("User that has '2' amounts of defaults should have a collateral factor equal to the default collateral factor subtracted by 10", async function () {
    await creditRatingTest.connect(DEFAULT_TWICE_USER).createProfile();

    let defaultCollateralFactor = await creditRatingTest.defaultCollateralFactor();

    // User defaults twice
    await creditRatingTest.connect(DEFAULT_TWICE_USER).defaultLoan();
    await creditRatingTest.connect(DEFAULT_TWICE_USER).defaultLoan();

    let borrowAmount = await creditRatingTest.connect(DEFAULT_TWICE_USER).getBorrowAmount();

    expect(borrowAmount).to.equal(defaultCollateralFactor - 10);

    console.log("\nUser with 2 amounts of defaults");
    console.log(`Default Collateral Factor: ${BigNumber.from(defaultCollateralFactor)}`);
    console.log(`User Borrow Amount: ${BigNumber.from(borrowAmount)}`);
  });

});
