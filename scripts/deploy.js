// We require the Hardhat Runtime Environment explicitly here. This is optional but useful for running the script in a standalone fashion through `node <script>`.
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat will compile your contracts, add the Hardhat Runtime Environment's members to the global scope, and execute the script.

// imports
const { hre, run, network } = require("hardhat")
// const { ethers, run, network } = require("hardhat")

// async main
async function main() {
    const SimpleStorageFactory = await hre.getContractFactory("SimpleStorage")
    console.log("Deploying contract...")
    const simpleStorage = await SimpleStorageFactory.deploy()
    await simpleStorage.waitForDeployment()
    console.log(`Deployed contract to ${simpleStorage.target}`)
    // What happens when we deploy to our hardhat network?
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations...")
        // await simpleStorage.deployTransaction.wait(6)
        await simpleStorage.waitForDeployment(6)
        await verify(simpleStorage.target, [])
    }

    const currentValue = await simpleStorage.retrieve()
    console.log(`Current Value is: ${currentValue}`)

    // Update the current value
    const transactionResponse = await simpleStorage.store(7)
    await transactionResponse.wait(1)
    const updatedValue = await simpleStorage.retrieve()
    console.log(`Updated Value is: ${updatedValue}`)

    // const currentTimestampInSeconds = Math.round(Date.now() / 1000)
    // const unlockTime = currentTimestampInSeconds + 60
    // const lockedAmount = hre.ethers.parseEther("0.001")
    // const lock = await hre.ethers.deployContract("Lock", [unlockTime], {
    //     value: lockedAmount,
    // })
    // await lock.waitForDeployment()
    // console.log(
    //     `Lock with ${ethers.formatEther(
    //         lockedAmount
    //     )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
    // )
}

// async function verify(contractAddress, args) {}
const verify = async (contractAddress, args) => {
    console.log("Verifying contract....")
    try {
        await run("verify:verify", {
            target: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!")
        } else {
            console.log(e)
        }
    }
}

// main
// We recommend this pattern to be able to use async/await everywhere and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error)
//     process.exit(1)
//   })
