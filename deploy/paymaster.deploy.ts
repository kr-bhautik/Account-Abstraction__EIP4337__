import { deployments, getNamedAccounts, ethers } from "hardhat";

export default async function main() {
    const {Deployer} = await getNamedAccounts();
    const AccountContract = await deployments.deploy("Paymaster", {
        from: Deployer,
        args: ["0x1543BF1Fcd92A219ba88177A754617c8E725aB28", "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108"],
        log: true,
    }) 

    console.log("Paymaster contract deployed at:", AccountContract.address);
}
// 0x6Acb34626A855482af6602cBC34BE2B5c6c24D7e
// 0x77fC40Be68f82A6bB83fd5Afd85bF38aD7153467
// 0x212a96F04d9fE1Fe6e861BA6AF8982d47A7e3Ff9