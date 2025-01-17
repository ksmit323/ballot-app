import { HardhatUserConfig, task } from 'hardhat/config'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-chai-matchers'
import '@typechain/hardhat'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import 'hardhat-contract-sizer'
import 'solidity-coverage'
import dotenv from 'dotenv'

dotenv.config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.21',
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  contractSizer: {
    alphaSort: false,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    mainnet: {
      url: process.env.ALCHEMY_API || '',
      gasPrice: 140 * 1000000000,
    },
    fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      gas: 5000000,
      gasPrice: 180 * 1000000000,
      chainId: 43113,
    },
    ava_mainnet: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      gasPrice: 28 * 1000000000,
      chainId: 43114,
    },
    bsc_mainnet: {
      url: 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      gasPrice: 5000000000,
    },
    sepolia: {
      url: 'https://rpc.notadegen.com/sepolia',
      chainId: 11155111,
      gasPrice: 5000000000,
    },
  },
}

if (process.env.ACCOUNT_PRIVATE_KEYS) {
  config.networks = {
    ...config.networks,
    fuji: {
      ...config.networks?.fuji,
      accounts: JSON.parse(process.env.ACCOUNT_PRIVATE_KEYS),
    },
    ava_mainnet: {
      ...config.networks?.ava_mainnet,
      accounts: JSON.parse(process.env.ACCOUNT_PRIVATE_KEYS),
    },
    bsc_mainnet: {
      ...config.networks?.bsc_mainnet,
      accounts: JSON.parse(process.env.ACCOUNT_PRIVATE_KEYS),
    },
    sepolia: {
      ...config.networks?.sepolia,
      accounts: JSON.parse(process.env.ACCOUNT_PRIVATE_KEYS),
    },
  }
}

config.gasReporter = {
  enabled: process.env.REPORT_GAS ? true : false,
}

task('winning-proposal', 'Give the name of the winner and total vote')
  .addParam('contract', 'Ballot contract address')
  .setAction(async (_arg, { ethers }) => {
    const contractAddress = _arg['contract']
    const contract = await ethers.getContractAt('Ballot', contractAddress)
    const winningProposal = await contract.winningProposal().then((idx) => contract.proposals(idx))

    if (winningProposal.voteCount <= 0n) {
      return console.log('Winner: none')
    }

    console.log('Winner:', ethers.decodeBytes32String(winningProposal.name))
    console.log('Total Count:', winningProposal.voteCount.toString())
  })

task('accounts', 'Get account list').setAction(async (_arg, { ethers }) => {
  const accounts = await ethers.getSigners()
  for (const account of accounts) {
    console.log(account.address)
  }
})

export default config
