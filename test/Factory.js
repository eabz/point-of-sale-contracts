const { expect } = require("chai");
const { ethers } = require("hardhat");
const UniswapV2Factory = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const UniswapV2Router02 = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const WETH9 = require("@uniswap/v2-periphery/build/WETH9.json");

describe("Factory", () => {
  before(async () => {
    const [owner, non_owner] = await ethers.getSigners();

    this.developer = owner;
    this.non_owner = non_owner;

    const factoryFactory = new ethers.ContractFactory(
      UniswapV2Factory.abi,
      UniswapV2Factory.bytecode,
      this.developer
    );

    factory = await factoryFactory.deploy(this.developer.address);
    await factory.deployed();

    const wethFactory = new ethers.ContractFactory(
      WETH9.abi,
      WETH9.bytecode,
      this.developer
    );
    const weth = await wethFactory.deploy();
    await weth.deployed();

    const routerFactory = new ethers.ContractFactory(
      UniswapV2Router02.abi,
      UniswapV2Router02.bytecode,
      this.developer
    );
    const router = await routerFactory.deploy(factory.address, weth.address);
    await router.deployed();

    const MockToken = await ethers.getContractFactory("MockToken");
    const SwapHelper = await ethers.getContractFactory("SwapHelper");
    const Registry = await ethers.getContractFactory("TokensRegistry");
    const Factory = await ethers.getContractFactory("Factory");

    const registry = await Registry.deploy();
    await registry.deployed();

    const dai = await MockToken.deploy(
      "Dai",
      "DAI",
      ethers.utils.parseEther("500")
    );
    await dai.deployed();

    this.helper = await SwapHelper.deploy(
      router.address,
      factory.address,
      dai.address,
      weth.address
    );
    await this.helper.deployed();

    this.factory = await Factory.deploy(factory.address, router.address);
    await this.factory.deployed();
  });

  it("should revert for trying to deploy while factory is not active", async () => {
    expect(this.factory.deploy()).to.revertedWith("Factory: not active");
  });

  it("should revert for trying to activate from a non owner", async () => {
    expect(
      this.factory.setActive(true, { from: this.non_owner.address })
    ).to.revertedWith("Ownable: caller is not the owner");
  });

  it("should activate the factory contract", async () => {
    await this.factory.setActive(true);
    expect(await this.factory.active()).to.eq(true);
  });

  it("should deploy a point of sale", async () => {
    expect(this.factory.deploy({ from: this.developer.address }))
      .to.emit(this.factory, "Deployed")
      .withArgs([this.developer.address]);
  });

  it("should revert a second deployment from the same address", async () => {
    expect(
      this.factory.deploy({ from: this.developer.address })
    ).to.revertedWith("Factory: user already has a deployment");
  });

  it("should return the deployment address", async () => {
    expect(await this.factory.getDeployment(this.developer.address)).to.eq(
      "0x3D8a0D51BB92dA867B7c85D6FBcc14BD97D182B4"
    );
  });
});
