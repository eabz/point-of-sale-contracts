const { ethers } = require("hardhat");

async function main() {
  const TokensRegistry = await ethers.getContractFactory("TokensRegistry");
  const Factory = await ethers.getContractFactory("Factory");

  const registry = await TokensRegistry.deploy();
  await registry.deployed();

  const factory = await Factory.deploy(registry.address);
  await factory.deployed();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
