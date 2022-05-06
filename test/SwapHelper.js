const { expect } = require("chai");
const { ethers } = require("hardhat");
const UniswapV2Factory = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const UniswapV2Router02 = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const WETH9 = require("@uniswap/v2-periphery/build/WETH9.json");

describe("SwapHelper", () => {
  before(async () => {
    const [owner] = await ethers.getSigners();

    this.developer = owner;

    const factory = new ethers.ContractFactory(
      UniswapV2Factory.abi,
      UniswapV2Factory.bytecode,
      this.developer
    );
    this.factory = await factory.deploy(this.developer.address);
    await this.factory.deployed();

    const weth = new ethers.ContractFactory(
      WETH9.abi,
      WETH9.bytecode,
      this.developer
    );
    this.weth = await weth.deploy();
    await this.weth.deployed();

    const router = new ethers.ContractFactory(
      UniswapV2Router02.abi,
      UniswapV2Router02.bytecode,
      this.developer
    );
    this.router = await router.deploy(this.factory.address, this.weth.address);
    await this.router.deployed();

    const MockToken = await ethers.getContractFactory("MockToken");
    const SwapHelper = await ethers.getContractFactory("SwapHelper");

    this.token1 = await MockToken.deploy(
      "Token1",
      "TKN1",
      ethers.utils.parseEther("100")
    );
    await this.token1.deployed();

    this.token2 = await MockToken.deploy(
      "Token2",
      "TKN2",
      ethers.utils.parseEther("100")
    );
    await this.token2.deployed();

    this.dai = await MockToken.deploy(
      "Dai",
      "DAI",
      ethers.utils.parseEther("500")
    );
    await this.dai.deployed();

    await this.token1.approve(
      this.router.address,
      ethers.utils.parseEther("100000")
    );
    await this.token2.approve(
      this.router.address,
      ethers.utils.parseEther("100000")
    );
    await this.dai.approve(
      this.router.address,
      ethers.utils.parseEther("100000")
    );

    const timestamp = Math.floor(Date.now() / 1000) + 300;

    await this.router.addLiquidity(
      this.token1.address,
      this.dai.address,
      ethers.utils.parseEther("10"),
      ethers.utils.parseEther("10"),
      ethers.utils.parseEther("10"),
      ethers.utils.parseEther("10"),
      this.developer.address,
      timestamp
    );

    await this.router.addLiquidity(
      this.token2.address,
      this.dai.address,
      ethers.utils.parseEther("20"),
      ethers.utils.parseEther("10"),
      ethers.utils.parseEther("20"),
      ethers.utils.parseEther("10"),
      this.developer.address,
      timestamp
    );

    await this.router.addLiquidityETH(
      this.dai.address,
      ethers.utils.parseEther("20"),
      ethers.utils.parseEther("20"),
      ethers.utils.parseEther("1"),
      this.developer.address,
      timestamp,
      { value: ethers.utils.parseEther("1") }
    );

    const dai_weth_pair = await this.factory.getPair(this.weth.address, this.dai.address);

    this.helper = await SwapHelper.deploy(this.router.address, this.dai.address, this.weth.address, dai_weth_pair)
    await this.helper.deployed();

  });

  it("should make sure everything is deployed correctly", async () => {
    await expect(await this.token1.balanceOf(this.developer.address)).to.eq(
      ethers.utils.parseEther("90")
    );

    await expect(await this.token2.balanceOf(this.developer.address)).to.eq(
      ethers.utils.parseEther("80")
    );

    await expect(await this.dai.balanceOf(this.developer.address)).to.eq(
      ethers.utils.parseEther("460")
    );
  });
});
