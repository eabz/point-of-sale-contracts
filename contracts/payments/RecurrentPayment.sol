// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BasePayment.sol";

/**
 * @dev RecurrentPayment is a contract for a payment.
 *      Deployed inside a POS this contract can be used multiple
 *      times.
 */
contract RecurrentPayment is Ownable, BasePayment {
    // =============================================== Storage ========================================================
    // =============================================== Events =========================================================
    // ============================================== Modifiers =======================================================
    // =============================================== Setters ========================================================

    /// @dev Constructor
    /// @param id_ Payment instance unique id.
    //  @param amount_ Amount in DAI to pay to emit the event.
    /// @param tokensRegistry_ The address of the proxy implementation of the `TokenRegistry` contract.
    /// @param swapHelper_ The address of the proxy implementation of the `SwapHelper` contract.
    constructor(
        string memory id_,
        uint256 amount_,
        address tokensRegistry_,
        address swapHelper_
    ) BasePayment(id_, amount_, tokensRegistry_, swapHelper_) {}

    // =============================================== Getters ========================================================
    // =============================================== Internal =======================================================
}
