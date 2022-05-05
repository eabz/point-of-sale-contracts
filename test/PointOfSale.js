const { expect } = require('chai');
const { ethers } = require("hardhat")

describe('PointOfSale', () => {

    before(async () => {

        const [owner] = await ethers.getSigners()

        this.owner = owner;
        this.minted = 100000;

        const TokensRegistry = await ethers.getContractFactory("TokensRegistry");
        const SwapHelper = await ethers.getContractFactory("SwapHelper");

        const MockToken = await ethers.getContractFactory("MockToken");
        const Factory = await ethers.getContractFactory("Factory");
        const PointOfSale = await ethers.getContractFactory("PointOfSale");

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
    });

    it('should initialize the pos correctly', async () => {
        const posOwner = await this.pos.owner();

        expect(posOwner).to.eq(this.owner.address)
    });

    it('should be able to claim tokens from the pos', async () => {
        await this.token.transfer(this.pos.address, this.minted);

        let posBalance = await this.token.balanceOf(this.pos.address);
        expect(posBalance).to.eq(this.minted);

        let ownerBalance = await this.token.balanceOf(this.owner.address);
        expect(ownerBalance).to.eq("0");

        await this.pos.claim(this.token.address);

        posBalance = await this.token.balanceOf(this.pos.address);
        expect(posBalance).to.eq("0");

        ownerBalance = await this.token.balanceOf(this.owner.address);
        expect(ownerBalance).to.eq(this.minted);
    });

    it('should deploy a recurrent payment', async () => {
        expect(this.pos.deployPayment("1", 0, "10000000000000000000", 0))
            .to.emit(this.pos, "PaymentDeployed")
    });

    it('should deploy a subscription payment', async () => {
        expect(this.pos.deployPayment("2", 1, "10000000000000000000", 100))
            .to.emit(this.pos, "PaymentDeployed")
    });

    it('should return both payments ids', async () => {
        const payments = await this.pos.getPayments()
        expect(payments).deep.equal(["1", "2"])
    });

    it('should return payments information', async () => {
        const recurrent = await this.pos.getPayment("1")
        expect(recurrent.id).eq("1")
        expect(recurrent._type).eq(0)
        expect(recurrent.amount).eq("10000000000000000000")
        expect(recurrent.periodicity).eq("0")

        const subscription = await this.pos.getPayment("2")
        expect(subscription.id).eq("2")
        expect(subscription._type).eq(1)
        expect(subscription.amount).eq("10000000000000000000")
        expect(subscription.periodicity).eq(100)
    });

});