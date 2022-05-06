const { expect } = require("chai");
const { ethers } = require("hardhat");

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const DAI_WETH = "0x60594a405d53811d3BC4766596EFD80fd545A270";

describe("SwapHelper", () => {
  before(async () => {
    const [owner] = await ethers.getSigners();

    this.developer = owner;

    const MockToken = await ethers.getContractFactory("MockToken");

    const UniFactory = await ethers.getContractFactory("UniswapV2Factory");
    const UniRouter = await ethers.getContractFactory("UniswapV2Router02");
    const UniPair = await ethers.getContractFactory("UniswapV2Pair");
    const WETH = await ethers.getContractFactory("WETH9");

    this.token1 = await MockToken.deploy(
      "Token1",
      "TKN1",
      ethers.utils.formatUnits(100, "wei")
    );
    await this.token1.deployed();

    this.token2 = await MockToken.deploy(
      "Token2",
      "TKN2",
      ethers.utils.formatUnits(100, "wei")
    );
    await this.token2.deployed();

    this.dai = await MockToken.deploy(
      "Dai",
      "DAI",
      ethers.utils.formatUnits(500, "wei")
    );
    await this.dai.deployed();

    this.factory = await UniFactory.deploy(this.developer.address);
    await this.factory.deployed();

    this.weth = await WETH.deploy();
    await this.weth.deployed();

    this.router = await UniRouter.deploy(
      this.factory.address,
      this.weth.address
    );
    await this.router.deployed();

    await this.factory.createPair(this.token1.address, this.dai.address);
    await this.factory.createPair(this.token2.address, this.dai.address);
    await this.factory.createPair(this.weth.address, this.dai.address);

    await this.token1.approve(
      this.router.address,
      ethers.utils.formatUnits(100000, "wei")
    );
    await this.token2.approve(
      this.router.address,
      ethers.utils.formatUnits(100000, "wei")
    );
    await this.dai.approve(
      this.router.address,
      ethers.utils.formatUnits(100000, "wei")
    );

    await this.router.addLiquidity(
      this.dai.address,
      this.token1.address,
      ethers.utils.formatUnits(50, "wei"),
      ethers.utils.formatUnits(50, "wei"),
      ethers.utils.formatUnits(10, "wei"),
      ethers.utils.formatUnits(10, "wei"),
      this.developer.address,
      Date.now() + 100
    );
  });

  it("should make sure everything is deployed correctly", async () => {
    await expect(await this.token1.balanceOf(this.developer.address)).to.eq(
      ethers.utils.formatUnits(100, "wei")
    );

    await expect(await this.token2.balanceOf(this.developer.address)).to.eq(
      ethers.utils.formatUnits(100, "wei")
    );

    await expect(await this.dai.balanceOf(this.developer.address)).to.eq(
      ethers.utils.formatUnits(100, "wei")
    );
  });
});
