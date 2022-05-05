const { expect } = require('chai');
const { ethers } = require("hardhat")
const routerABI = require("@uniswap/v2-periphery/build/UniswapV2Router02.json")
const factoryABI = require("@uniswap/v2-core/build/UniswapV2Factory.json")
const pairABI = require("@uniswap/v2-core/build/UniswapV2Pair.json")

const ROUTER =  "0x50db5A60009f655f59703d2266819491a977634d"
const WETH =    "0xC614405267eCDbF01FB5b425e3F2EC657160101A"
const FACTORY = "0x6f032f18330029345fD34C925c1154BBDce6567E"

describe('SwapHelper', () => {

    before(async () => {

        const [owner] = await ethers.getSigners()

        this.owner = owner;

        const MockToken = await ethers.getContractFactory("MockToken");
        const SwapHelper = await ethers.getContractFactory("SwapHelper");

        const router = new ethers.Contract(ROUTER, routerABI.abi, owner)
        const factory = new ethers.Contract(FACTORY, factoryABI.abi, owner)

        // Deploy a Mock for DAI
        this.dai = await MockToken.deploy("MockDAI", "MockDAI", "200000000000000000000000")
        await this.dai.deployed()

        // Deploy a Mock Token
        this.token = await MockToken.deploy("MockToken", "MockToken", "250000000000000000000000")
        await this.token.deployed()

        // Approve Router
        await this.dai.approve(ROUTER, "100000000000000000000000000000")
        await this.token.approve(ROUTER, "100000000000000000000000000000")

        // Create the Token/DAI Pair
        // Proportion is 1:1
        await router.addLiquidity(this.token.address, this.dai.address, "100000000000000000000000", "100000000000000000000000", "100000000000000000000000", "100000000000000000000000", owner.address, Date.now() + 5000)
        
        // Create the Token/WETH Pair
        // Proportion is 1000:1
        await router.addLiquidityETH(this.token.address, "100000000000000000000000", "100000000000000000000000", "100000000000000000000", owner.address, Date.now() + 5000, {value: "100000000000000000000"})

        // Create the DAI/WETH Pair
        // Proportion is 1000:1
        await router.addLiquidityETH(this.dai.address, "100000000000000000000000", "100000000000000000000000", "100000000000000000000", owner.address, Date.now() + 5000, {value: "100000000000000000000"})

        // Create the Token/DAI Pair
        // Proportion is 1:1
        const pair_dai = await factory.getPair(this.dai.address, this.token.address)
        this.pairDAI = new ethers.Contract(pair_dai, pairABI.abi, owner)

        // Create the Token/WETH Pair
        // Proportion is 1000:1
        const pair_weth = await factory.getPair(WETH, this.token.address)
        this.pairWETH = new ethers.Contract(pair_weth, pairABI.abi, owner)

        const pair_weth_dai = await factory.getPair(WETH, this.dai.address)

        this.swap = await SwapHelper.deploy(ROUTER, this.dai.address, WETH, pair_weth_dai)
        await this.swap.deployed()

        // Approve the swap contract
        await this.token.approve(this.swap.address, "100000000000000000000000000000")

    });

    it('should fetch the correct prices', async () => {
        const prices = [
            { price: "5", expected: "5100000000000000000", expected_eth: "5100000000000000" },
            { price: "15", expected: "15300000000000000000", expected_eth: "15300000000000000" },
            { price: "100", expected: "102000000000000000000", expected_eth: "102000000000000000" },
            { price: "1.5", expected: "1530000000000000000", expected_eth: "1530000000000000" },
            { price: "12.12345", expected: "12365919000000000000", expected_eth: "12365919000000000" },
        ]
    
        for (let i = 0; i < prices.length; i++) {
            let wei = ethers.utils.parseEther(prices[i].price)
            let tokenAmountUsingDAI = await this.swap.getTokenAmount(this.pairDAI.address, wei, 2, false);
            let tokenAmountUsingWETH = await this.swap.getTokenAmount(this.pairWETH.address, wei, 2, true);
            let ethAmount = await this.swap.getETHAmount(wei, 2);
            expect(tokenAmountUsingDAI).eq(tokenAmountUsingWETH)
            expect(tokenAmountUsingDAI.toString()).eq(prices[i].expected)
            expect(ethAmount.toString()).eq(prices[i].expected_eth)
        }
    
    });

    it('should swap tokens to DAI correctly using the DAI pair', async () => {
        const prices = [ "5", "15", "100", "1.5", "12.12345" ]
        let daiBalance = await this.dai.balanceOf(this.owner.address);
        expect(daiBalance.toString()).eq("0")
        
        let tokenBalance = await this.token.balanceOf(this.owner.address);
        expect(tokenBalance.toString()).eq("50000000000000000000000");

        for (let i = 0; i < prices.length; i++) {
            let wei = ethers.utils.parseEther(prices[i])
            let tokenAmount = await this.swap.getTokenAmount(this.pairDAI.address, wei, 2, false);
            await this.swap.swapTokenToDAI(this.token.address, tokenAmount, wei, false);
        }

        daiBalance = await this.dai.balanceOf(this.owner.address);
        expect(daiBalance.toString()).eq("135702513338807652646");

        tokenBalance = await this.token.balanceOf(this.owner.address);
        expect(tokenBalance.toString()).eq("49863704081000000000000");
    });

    it('should swap tokens to DAI correctly using the WETH pair', async () => {
        const prices = [ "5", "15", "100", "1.5", "12.12345" ]
        let daiBalance = await this.dai.balanceOf(this.owner.address);
        expect(daiBalance.toString()).eq("135702513338807652646")
        
        let tokenBalance = await this.token.balanceOf(this.owner.address);
        expect(tokenBalance.toString()).eq("49863704081000000000000");

        for (let i = 0; i < prices.length; i++) {
            let wei = ethers.utils.parseEther(prices[i])
            let tokenAmount = await this.swap.getTokenAmount(this.pairWETH.address, wei, 2, true);
            await this.swap.swapTokenToDAI(this.token.address, tokenAmount, wei, true);
        }

        daiBalance = await this.dai.balanceOf(this.owner.address);
        expect(daiBalance.toString()).eq("270999981645258595543");

        tokenBalance = await this.token.balanceOf(this.owner.address);
        expect(tokenBalance.toString()).eq("49727221055921599634784");
    });

    it('should swap ETH to DAI correctly', async () => {
        const prices = [ "5", "15", "100", "1.5", "12.12345" ]
        let daiBalance = await this.dai.balanceOf(this.owner.address);
        expect(daiBalance.toString()).eq("270999981645258595543")

        for (let i = 0; i < prices.length; i++) {
            let wei = ethers.utils.parseEther(prices[i])
            let ethAmount = await this.swap.getETHAmount(wei, 2);
            await this.swap.swapETHToDAI(wei, {value: ethAmount});
        }

        daiBalance = await this.dai.balanceOf(this.owner.address);
        expect(daiBalance.toString()).eq("406885477650011227203");

    });

});