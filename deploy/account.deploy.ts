import { deployments, getNamedAccounts, ethers } from "hardhat";

export default async function main() {
    const {Deployer} = await getNamedAccounts();
    const AccountContract = await deployments.deploy("MySmartWallet", {
        from: Deployer,
        args: ["0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108"],
        log: true,
    }) 

    console.log("Account contract deployed at:", AccountContract.address);
}

// 0xB6D8DcF4514dB15c2Ba99b54e25CF1c4640fE6bf
// 0xe33a51484Fd3942B9Cfc848F7317796cc018A335
// 0x28588B356cCB758EF264F48778444050bCD3ab1e