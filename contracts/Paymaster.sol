// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@account-abstraction/contracts/interfaces/IPaymaster.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Paymaster is IPaymaster {
    using MessageHashUtils for bytes32;
    using ECDSA for bytes32;
    
    address public paymasterOwner;
    IEntryPoint public entryPoint;
    constructor(address _paymasterOwner, address _entryPoint) {
        paymasterOwner = _paymasterOwner;
        entryPoint = IEntryPoint(_entryPoint);
    }

    function validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 //maxCost
    ) external returns (bytes memory context, uint256 validationData)
    {
        require(msg.sender == address(entryPoint), "only entryPoint");
        address paymaster = getPaymasterAddress(userOp.paymasterAndData);
        bytes memory signature = getPaymasterSignature(userOp.paymasterAndData);

        require(paymaster == address(this), "Invalid paymaster");
        require(signature.length == 65, "Invalid signature length");

        bytes32 ethSignedHash = userOpHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedHash.recover(signature);

        // 1 means signature is invalid
        // 0 means signature is valid
        if( recoveredSigner != paymasterOwner) {
            return ("", 1);
        }
        return ("", 0);

    }

    // First 20 bytes of paymasterAndData is the paymaster address
    function getPaymasterAddress(bytes memory paymasterAndData) public pure returns (address) {
        require(paymasterAndData.length >= 20, "Invalid paymasterAndData");
        address paymaster;
        assembly {
            paymaster := mload(add(paymasterAndData, 20))
        }
        return paymaster;
    }

    // The next 65 bytes of paymasterAndData is the paymaster signature
    function getPaymasterSignature(bytes memory paymasterAndData) internal pure returns (bytes memory) {
        bytes memory signature = new bytes(65);
        for (uint i = 0; i < 65; i++) {
            signature[i] = paymasterAndData[i + 20]; 
        }
        return signature;
    }

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost,
        uint256 actualUserOpFeePerGas
    ) external 
    {}

    receive() external payable {}

    function withdraw() public {
        require(msg.sender == paymasterOwner, "Only owner can withdraw");
        payable(paymasterOwner).transfer(address(this).balance);
    }
}