import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { ethers } from 'hardhat'

/**
 *
 * @param hre deploying "EntryPoint" (tx: 0x6ca2e71915400b41b9cdd108de9530a1eb28aef66f70ed51267d841fe098c8ff)...: deployed at 0x34818a22741D92ec36c213111329783d6d1cF8ff with 5316874 gas
==entrypoint addr= 0x34818a22741D92ec36c213111329783d6d1cF8ff

deploying "SimpleAccount" (tx: 0xff9c899b73a99e24d634e86e6bc042f459c0a2bef3b1651885e3e0065840a6ab)...: deployed at 0x5Ddd760a2bF62D296FdCbBbD00E5bEa6983b34E4 with 1897411 gas
== wallet= 0x5Ddd760a2bF62D296FdCbBbD00E5bEa6983b34E4

deploying "TestCounter" (tx: 0xd2a62d763cf02a960934dda037a0f00b8e3f6fc0afea5a01e55669d4e0b2033d)...: deployed at 0x41E6636E2962256DC0E1E47255Ea7e8ffAac7121 with 254090 gas
==testCounter= 0x41E6636E2962256DC0E1E47255Ea7e8ffAac7121
*/
const deployEntryPoint: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const provider = ethers.provider

  const from = await provider.getSigner().getAddress()
  const network = await provider.getNetwork()

  const ret = await hre.deployments.deploy(
    'EntryPoint', {
      from,
      args: [],
      gasLimit: 6e6,
      log: true,
      deterministicDeployment: true
    })
  console.log('==entrypoint addr=', ret.address)

  // const entrypoint = await hre.deployments.get('EntryPoint')
  // console.log('==entrypoint addr=', entrypoint.address)

  const entryPointAddress = ret.address
  const w = await hre.deployments.deploy(
    'SimpleAccount', {
      from,
      args: [entryPointAddress],
      gasLimit: 2e6,
      log: true,
      deterministicDeployment: true
    })

  console.log('== wallet=', w.address)

  const t = await hre.deployments.deploy('TestCounter', {
    from,
    log: true,
    deterministicDeployment: true
  })
  console.log('==testCounter=', t.address)

}

export default deployEntryPoint
