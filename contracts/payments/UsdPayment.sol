// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "./Base.sol";

/**
 * @dev UsdPayment is the contract used to receive payments for a product or service using a fixed amount in USD.
 *      This contract accepts any token in the TokensRegistry and converts them to the selected token using the SwapHelper.
 */
contract TokenPayment is Base {
    // =============================================== Storage ========================================================
    // =============================================== Events =========================================================
    // ============================================== Modifiers =======================================================
    // =============================================== Setters ========================================================

    /** @dev Constructor
     */
    constructor() {}

    // =============================================== Getters ========================================================
    // =============================================== Internal =======================================================
}
