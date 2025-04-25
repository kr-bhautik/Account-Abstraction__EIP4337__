import { ethers, recoverAddress, hashMessage, toBeArray, getBytes, hexlify, toBeHex} from "ethers";
import ABI_EntryPoint from "./ABI_EntryPoint.json";
import axios from 'axios'

import env from "dotenv";
env.config();

const main = async () => {
    const SEPOLIA_RPC = `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`;
    const PRIVATE_KEY = `0x${process.env.DEPLOYER_KEY}`;
    const PAYMASTER_PRIVATE_KEY = `0x${process.env.PAYMASTER_PRIVATE_KEY}`;
    const paymasterAddress = `0x212a96F04d9fE1Fe6e861BA6AF8982d47A7e3Ff9`;

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const owner = new ethers.Wallet(PRIVATE_KEY, provider);
    const paymaster = new ethers.Wallet(PAYMASTER_PRIVATE_KEY, provider);

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
    console.log(gasFees.length);

    const userOp = {
        sender: smartWallet,
        nonce,
        initCode: "0x",
        callData,
        accountGasLimits,
        preVerificationGas: 50_000,
        gasFees,
        paymasterVerificationGasLimit: 200_000n,
        paymasterPostOpGasLimit: 100_000n,
        paymasterAndData: "0x",
        signature: "0x",
    };

    const userOpHash = await entryPoint.getUserOpHash(userOp);

    const signature = await owner.signMessage(getBytes(userOpHash));
    const paymasterSignature = await paymaster.signMessage(getBytes(userOpHash));
    userOp.signature = signature;
    console.log("signature : ", signature);
    console.log("paymasterSignature : ", paymasterSignature);
    console.log(userOpHash)
    // const ethSignedHash = ethers.hashMessage(ethers.getBytes(userOpHash));
    const encodedVerificationGas = ethers.zeroPadValue(toBeHex(100000n), 6);
    const encodedPostOpGas = ethers.zeroPadValue(toBeHex(100000n), 6);
    userOp.paymasterAndData = ethers.concat([
        getBytes(paymasterAddress),
        getBytes(paymasterSignature),
        getBytes(encodedVerificationGas),
        getBytes(encodedPostOpGas)
    ]);
    // console.log("Recovered address: ", recoverAddress(ethSignedHash, paymasterSignature));

    console.log(userOpHash);
    console.log(userOp);

    const ops = [userOp];
    const beneficiary = "0x6ee7b2cFdDcA903A049Cc445E8ac1388E58f5220"

    console.log("Wallet balance before:", ethers.formatEther(await provider.getBalance(smartWallet)));
    console.log("Receiver balance before:", ethers.formatEther(await provider.getBalance('0xBBE60f2076BfcCd5DC66E94495290A2042De2186')));
    console.log("Paymaster balance before:", ethers.formatEther(await provider.getBalance(paymasterAddress)));
    console.log("Beneficiary balance before:", ethers.formatEther(await provider.getBalance(beneficiary)));
    
    const tx = await entryPoint.handleOps(ops, beneficiary);
    await tx.wait();
    
    console.log("Wallet address After:", ethers.formatEther(await provider.getBalance(smartWallet)));
    console.log("Receiver balance After:", ethers.formatEther(await provider.getBalance('0xBBE60f2076BfcCd5DC66E94495290A2042De2186')));
    console.log("Paymaster balance After:", ethers.formatEther(await provider.getBalance(paymasterAddress)));
    console.log("Beneficiary balance After:", ethers.formatEther(await provider.getBalance(beneficiary)));
    console.log(tx);

};

main().catch(console.error);