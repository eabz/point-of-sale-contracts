// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./BasePayment.sol";

/**
 * @dev SubscriptionPayment is a contract for subscription payments.
 *      Deployed inside a POS this contract will charge the subscribed
 *      users each times it is called as long as payment periodicity is passed.
 */
contract SubscriptionPayment is Ownable, BasePayment {
    // =============================================== Storage ========================================================

    /// @dev the amount of blocks on which the subscription is charged.
    uint256 public periodicity;

    // =============================================== Events =========================================================
    // ============================================== Modifiers =======================================================
    // =============================================== Setters ========================================================

    /// @dev Constructor
    /// @param id_ Payment instance unique id.
    //  @param amount_ Amount in DAI to pay to emit the event.
    //  @param periodicity_ The amount of blocks required to pass to charge the user.
    /// @param tokensRegistry_ The address of the proxy implementation of the `TokenRegistry` contract.
    /// @param swapHelper_ The address of the proxy implementation of the `SwapHelper` contract.
    constructor(
        string memory id_,
        uint256 amount_,
        uint256 periodicity_,
        address tokensRegistry_,
        address swapHelper_
    ) BasePayment(id_, amount_, tokensRegistry_, swapHelper_) {
        periodicity = periodicity_;
    }

    // =============================================== Getters ========================================================
    // =============================================== Internal =======================================================
}
