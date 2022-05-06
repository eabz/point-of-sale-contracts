const { expect } = require("chai");
const { ethers } = require("hardhat");
const UniswapV2Factory = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const UniswapV2Router02 = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const WETH9 = require("@uniswap/v2-periphery/build/WETH9.json");

describe("SwapHelper", () => {
  before(async () => {
    await hre.network.provider.send("hardhat_reset")

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

    this.helper = await SwapHelper.deploy(
      this.router.address,
      this.factory.address,
      this.dai.address,
      this.weth.address
    );
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

  it("should return token 1 amount for DAI equally", async () => {
    let expected = 1;

    let slippage = 0;
    expect(
      await this.helper.getTokenAmount(this.token1.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(expected.toFixed(0)));

    slippage = 2;
    let slippageExpected = (1 + slippage / 100) * expected;
    expect(
      await this.helper.getTokenAmount(this.token1.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(slippageExpected.toString()));

    slippage = 5;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(
      await this.helper.getTokenAmount(this.token1.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(slippageExpected.toString()));

    slippage = 9;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(
      await this.helper.getTokenAmount(this.token1.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(slippageExpected.toString()));

    slippage = 19;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(
      await this.helper.getTokenAmount(this.token1.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(slippageExpected.toString()));

    slippage = 33;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(
      await this.helper.getTokenAmount(this.token1.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(slippageExpected.toString()));

    slippage = 50;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(
      await this.helper.getTokenAmount(this.token1.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(slippageExpected.toString()));
  });

  it("should return token 2 amount for DAI to half", async () => {
    let expected = 2;

    let slippage = 0;
    expect(
      await this.helper.getTokenAmount(this.token2.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(expected.toFixed(0)));

    slippage = 2;
    let slippageExpected = (1 + slippage / 100) * expected;
    expect(
      await this.helper.getTokenAmount(this.token2.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(slippageExpected.toString()));

    slippage = 5;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(
      await this.helper.getTokenAmount(this.token2.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(slippageExpected.toString()));

    slippage = 9;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(
      await this.helper.getTokenAmount(this.token2.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(slippageExpected.toString()));

    slippage = 19;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(
      await this.helper.getTokenAmount(this.token2.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(slippageExpected.toString()));

    slippage = 33;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(
      await this.helper.getTokenAmount(this.token2.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(slippageExpected.toString()));

    slippage = 50;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(
      await this.helper.getTokenAmount(this.token2.address, 1, slippage)
    ).to.eq(ethers.utils.parseEther(slippageExpected.toString()));
  });

  it("should return ETH amount for DAI to 1 / 20", async () => {
    let expected = 1;

    let slippage = 0;
    expect(await this.helper.getETHAmount(20, slippage)).to.eq(
      ethers.utils.parseEther(expected.toFixed(0))
    );

    slippage = 2;
    let slippageExpected = (1 + slippage / 100) * expected;
    expect(await this.helper.getETHAmount(20, slippage)).to.eq(
      ethers.utils.parseEther(slippageExpected.toString())
    );

    slippage = 5;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(await this.helper.getETHAmount(20, slippage)).to.eq(
      ethers.utils.parseEther(slippageExpected.toString())
    );

    slippage = 9;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(await this.helper.getETHAmount(20, slippage)).to.eq(
      ethers.utils.parseEther(slippageExpected.toString())
    );

    slippage = 19;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(await this.helper.getETHAmount(20, slippage)).to.eq(
      ethers.utils.parseEther(slippageExpected.toString())
    );

    slippage = 33;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(await this.helper.getETHAmount(20, slippage)).to.eq(
      ethers.utils.parseEther(slippageExpected.toString())
    );

    slippage = 50;
    slippageExpected = (1 + slippage / 100) * expected;
    expect(await this.helper.getETHAmount(20, slippage)).to.eq(
      ethers.utils.parseEther(slippageExpected.toString())
    );
  });

  it("perform a trade with token 1", async () => {});

  it("perform a trade with token 2", async () => {});

  it("perform a trade with ETH", async () => {});

  it("perform a trade with WETH", async () => {});
});
