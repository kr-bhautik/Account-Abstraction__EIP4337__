// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract MySmartWallet is BaseAccount {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    uint256 constant SIG_VALIDATION_FAILED = 1;

    IEntryPoint private immutable _entryPoint;
    address public owner;

    constructor(address entryPoint_) payable {
        _entryPoint = IEntryPoint(entryPoint_);
        owner = msg.sender;

    }

    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }

    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {

        // address recovered = userOpDigest.recover(userOp.signature);

        bytes32 ethSigned = userOpHash.toEthSignedMessageHash();
        address recovered = ethSigned.recover(userOp.signature);
        if (recovered != owner) {
            return SIG_VALIDATION_FAILED;
        }
        return 0; // Valid signature
    }

    receive() external payable {}

    function withdraw() public {
        require(msg.sender == owner);
        payable(owner).transfer(address(this).balance);
    }
}
