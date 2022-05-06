const argv = require("yargs/yargs")()
  .env("")
  .options({
    ci: {
      type: "boolean",
      default: false,
    },
    coverage: {
      type: "boolean",
      default: false,
    },
    gas: {
      alias: "enableGasReport",
      type: "boolean",
      default: false,
    },
    compiler: {
      alias: "compileVersion",
      type: "string",
      default: "0.8.9",
    }
  }).argv;

if (argv.enableGasReport) {
  require("hardhat-gas-reporter");
}

require("@nomiclabs/hardhat-waffle");

require("dotenv").config();

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc-mumbai.maticvigil.com",
      },
    },
  },
  solidity: {
    compilers: [
      {
        version: argv.compiler,
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  gasReporter: {
    currency: "USD",
    outputFile: argv.ci ? "gas-report.txt" : undefined,
  },
};

if (argv.coverage) {
  require("solidity-coverage");
  module.exports.networks.hardhat.initialBaseFeePerGas = 0;
}
