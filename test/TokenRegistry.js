const { expect } = require('chai');
const { ethers } = require("hardhat")

describe('TokensRegistry', () => {

    before(async () => {
        const MockToken = await ethers.getContractFactory("MockToken");
        const TokensRegistry = await ethers.getContractFactory("TokensRegistry");
        this.registry = await TokensRegistry.deploy();
        await this.registry.deployed();

        this.token = await MockToken.deploy("Mock", "Mock", 100000);
        await this.token.deployed();
    });

    it('should check initial tokens', async () => {
        const tokens = await this.registry.getSupportedTokens();
        expect(tokens).to.be.empty
    });

    it('should add a new token', async () => {
        await expect(this.registry.addToken(this.token.address, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"))
            .to.emit(this.registry, "TokenAdded")
            .withArgs(this.token.address)

        const tokens = await this.registry.getSupportedTokens();
        expect(tokens).to.include(this.token.address)
    });

    it('should pause a token', async () => {
        await expect(this.registry.pauseToken(this.token.address))
            .to.emit(this.registry, "TokenPaused")
            .withArgs(this.token.address)
    });

    it('should resume a token', async () => {
        await expect(this.registry.resumeToken(this.token.address))
            .to.emit(this.registry, "TokenResumed")
            .withArgs(this.token.address)
    });

});