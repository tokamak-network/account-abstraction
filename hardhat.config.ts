import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import { HardhatUserConfig } from 'hardhat/config'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-etherscan'

import dotenv from "dotenv" ;
import 'solidity-coverage'

import * as fs from 'fs'

dotenv.config();

const mnemonicFileName = process.env.MNEMONIC_FILE ?? `${process.env.HOME}/.secret/testnet-mnemonic.txt`
let mnemonic = 'test '.repeat(11) + 'junk'
if (fs.existsSync(mnemonicFileName)) { mnemonic = fs.readFileSync(mnemonicFileName, 'ascii') }

function getNetwork1 (url: string): { url: string, accounts: { mnemonic: string } } {
  return {
    url,
    accounts: { mnemonic }
  }
}

function getNetwork (name: string): { url: string, accounts: { mnemonic: string } } {
  return getNetwork1(`https://${name}.infura.io/v3/${process.env.INFURA_ID}`)
  // return getNetwork1(`wss://${name}.infura.io/ws/v3/${process.env.INFURA_ID}`)
}

const optimizedComilerSettings = {
  version: '0.8.17',
  settings: {
    optimizer: { enabled: true, runs: 1000000 },
    viaIR: true
  }
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{
      version: '0.8.15',
      settings: {
        optimizer: { enabled: true, runs: 1000000 }
      }
    }],
    overrides: {
      'contracts/core/EntryPoint.sol': optimizedComilerSettings,
      'contracts/samples/SimpleAccount.sol': optimizedComilerSettings
    }
  },
  networks: {
    dev: { url: 'http://localhost:8545' },
    // github action starts localgeth service, for gas calculations
    localgeth: { url: 'http://localgeth:8545' },
    goerli: getNetwork('goerli'),
    sepolia: getNetwork('sepolia'),
    proxy: getNetwork1('http://localhost:8545'),
    darius: {
      url: `${process.env.ETH_NODE_URI_DARIUS}`,
      accounts: [`${process.env.DEPLOYER}`],
      chainId: 5050,
      gasPrice: 250000,
      deploy: ['deploy']
    },
  },
  deterministicDeployment: (network: string) => {
    // Skip on hardhat's local network.
    if (network === "31337") {
        return undefined;
    } else if(network === "5") {
      return {
        factory: "0x4e59b44847b379578588920ca78fbf26c0b4956c",
        deployer: "0x3fab184622dc19b6109349b94811493bf2a45362",
        funding: "10000000000000000",
        signedTx: "0x00",
      }
    } else if(network === "5050"){
      return {
        factory: "0x1431517b50f69bf710cc63beef9f83af03fa1be6",
        deployer: "0x21d88d1cee7424f53b2dfe1547229608cc859f50",
        funding: "10000000000000000",
        signedTx: "0x00",
      }
    }
    return {
        factory: "0x2222229fb3318a6375fa78fd299a9a42ac6a8fbf",
        deployer: "0x90899d3cc800c0a9196aec83da43e46582cb7435",
        // Must be deployed manually. Required funding may be more on
        // certain chains (e.g. Ethereum mainnet).
        funding: "10000000000000000",
        signedTx: "0x00",
    };
  },
  mocha: {
    timeout: 10000
  },
  etherscan: {
    apiKey: {
      goerli: `${process.env.ETHERSCAN_API_KEY}`,
      darius: "abc"
    } ,
    customChains: [
      {
        network: "darius",
        chainId: 5050,
        urls: {
          apiURL: "https://goerli.explorer.tokamak.network/api",
          browserURL: "https://goerli.explorer.tokamak.network"
        }
      }
    ]
  },
}

// coverage chokes on the "compilers" settings
if (process.env.COVERAGE != null) {
  // @ts-ignore
  config.solidity = config.solidity.compilers[0]
}

export default config
