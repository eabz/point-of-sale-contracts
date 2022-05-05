const { expect } = require('chai');
const { ethers } = require("hardhat")

describe('BasePayment', () => {

    before(async () => {

        const [owner] = await ethers.getSigners()

        this.minted = 100000;

        const TokensRegistry = await ethers.getContractFactory("TokensRegistry");
        const SwapHelper = await ethers.getContractFactory("SwapHelper");
        const MockToken = await ethers.getContractFactory("MockToken");
        const Factory = await ethers.getContractFactory("Factory");
        const PointOfSale = await ethers.getContractFactory("PointOfSale");
        const BasePayment = await ethers.getContractFactory("BasePayment");

        this.token = await MockToken.deploy("Mock", "Mock", this.minted);
        await this.token.deployed();

        this.registry = await TokensRegistry.deploy();
        await this.registry.deployed();

        await this.registry.addToken(this.token.address, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000")

        this.swap = await SwapHelper.deploy("0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000");
        await this.swap.deployed();

        this.factory = await Factory.deploy(this.registry.address, this.swap.address);
        await this.factory.deployed();

        await this.factory.setActive(true);
        await this.factory.deploy();

        const deployment = await this.factory.getDeployment(owner.address);

        this.pos = PointOfSale.attach(deployment);

        await this.pos.deployPayment("1", 0, "10000000000000000000", 0)

        const paymentDeploy = await this.pos.getPayment("1")

        this.payment = BasePayment.attach(paymentDeploy.deployment)
    });

    it('should be deployed correctly', async () => {
        const id = await this.payment.ID();
        expect(id).eq("1");

        const amount = await this.payment.amount();
        expect(amount).eq("10000000000000000000");
    });


});