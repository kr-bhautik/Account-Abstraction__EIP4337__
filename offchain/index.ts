import { ethers, recoverAddress, hashMessage, toBeArray, getBytes, } from "ethers";
import ABI_EntryPoint from "./ABI_EntryPoint.json";

import env from "dotenv";
env.config();

const main = async () => {
    const SEPOLIA_RPC = `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`;
    const PRIVATE_KEY = `0x${process.env.DEPLOYER_KEY}`;

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const owner = new ethers.Wallet(PRIVATE_KEY, provider);

    const entryPointAddr = "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108";
    const entryPoint = new ethers.Contract(entryPointAddr, ABI_EntryPoint, owner);

    const smartWallet = "0x6f0840adf74626416611D1f115Cf719021C37F27";
    const nonce = await entryPoint.getNonce(smartWallet, 0);
    const callData = new ethers.Interface(["function execute(address target, uint256 value, bytes calldata data)"]).encodeFunctionData("execute", [
        "0xBBE60f2076BfcCd5DC66E94495290A2042De2186",
        ethers.parseEther("0.001"),
        "0x",
    ]);
    const verificationGasLimit = ethers.zeroPadValue(ethers.toBeHex(1000_000), 16);
    const callGasLimit = ethers.zeroPadValue(ethers.toBeHex(1000_000), 16);
    const accountGasLimits = verificationGasLimit + callGasLimit.slice(2);
    // console.log(accountGasLimits);
    // console.log(accountGasLimits.length);
    const maxPriorityFeePerGas = ethers.zeroPadValue(ethers.toBeHex(5e9), 16);
    const maxFeePerGas = ethers.zeroPadValue(ethers.toBeHex(30e9), 16);
    const gasFees = maxPriorityFeePerGas + maxFeePerGas.slice(2);
    // console.log(gasFees);
    // console.log(gasFees.length);

    const userOp = {
        sender: smartWallet,
        nonce,
        initCode: "0x",
        callData,
        accountGasLimits,
        preVerificationGas: 50_000,
        gasFees,
        paymasterAndData: "0x",
        signature: "0x",
    };

    const userOpHash = await entryPoint.getUserOpHash(userOp);

    const signature = await owner.signMessage(getBytes(userOpHash));
    userOp.signature = signature;
    // console.log(userOpHash);

    const ops = [userOp];
    const beneficiary = await owner.getAddress();

    console.log("Wallet balance before:",  ethers.formatEther(await provider.getBalance(smartWallet)));
    console.log("Receiver balance before:",  ethers.formatEther(await provider.getBalance('0xBBE60f2076BfcCd5DC66E94495290A2042De2186')));

    const tx = await entryPoint.handleOps(ops, beneficiary);
    await tx.wait();

    console.log("Wallet address After:",  ethers.formatEther(await provider.getBalance(smartWallet)));
    console.log("Receiver balance After:",  ethers.formatEther(await provider.getBalance('0xBBE60f2076BfcCd5DC66E94495290A2042De2186')));
    // console.log(tx);

};

main().catch(console.error);