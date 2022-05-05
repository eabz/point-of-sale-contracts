require("@nomiclabs/hardhat-waffle");

require('dotenv').config()

let private_key = process.env.PRIVATE_KEY;

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            forking: {
                url: "https://rpc-mumbai.maticvigil.com",
            }
        }
    },
    solidity: {
        compilers: [{
            version: "0.8.13",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }]
    },
    mocha: {
        timeout: 2000000
    }
};