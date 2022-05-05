const { expect } = require('chai');
const { ethers } = require("hardhat")

describe('Factory', () => {

    before(async () => {

        const TokensRegistry = await ethers.getContractFactory("TokensRegistry");
        const SwapHelper = await ethers.getContractFactory("SwapHelper");

        const Factory = await ethers.getContractFactory("Factory");

        this.registry = await TokensRegistry.deploy();
        await this.registry.deployed();

        this.swap = await SwapHelper.deploy("0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000");
        await this.swap.deployed();

        this.factory = await Factory.deploy(this.registry.address, this.swap.address);
        await this.factory.deployed();

    });

    it('should try to deploy and fail before active', async () => {
        await expect(this.factory.deploy()).to.revertedWith("Factory: not active")

        const active = await this.factory.active();
        expect(active).to.false
    });

    it('should set the factory to active', async () => {
        await this.factory.setActive(true);

        const active = await this.factory.active();

        expect(active).to.true
    });

    it('should deploy a user POS', async () => {
        await expect(this.factory.deploy())
            .to.emit(this.factory, "Deployed")
    });

    it('should fail the attempt to deploy a second user POS', async () => {
        await expect(this.factory.deploy())
            .to.revertedWith("Factory: user already has a deployment")
    });
});