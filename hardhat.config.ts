import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();
import "hardhat-deploy"

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    }
  },
  networks: {
    sepolia : {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.DEPLOYER_KEY!],
      chainId: 11155111,
    },

  },
  // defaultNetwork: "sepolia",
  namedAccounts: {
    Deployer: {
      default: 0
    }
  },
  etherscan: {
    apiKey:process.env.ETHERSCAN_API_KEY,
  }
};

export default config;
