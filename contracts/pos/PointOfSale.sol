// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/ITokensRegistry.sol";
import "../interfaces/ISwapHelper.sol";

/**
 * @dev `PointOfSale` is the contract that holds all the information about payments and subscriptions.
 */
contract PointOfSale is Ownable {
    // =============================================== Storage ========================================================

    /** @dev `PaymentType` is a enum to identify which type of payment is being used. */
    enum PaymentType {
        TOKEN_PAYED,
        USD_PAYED,
        SUBSCRIPTION
    }

    /** @dev Whitelisted tokens registry  **/
    ITokensRegistry public registry;

    /** @dev Utility contract to perform swaps.  **/
    ISwapHelper public swap;

    /** @dev Struct to define a payment properties.
     * @param id        The identifier of the payment.
     * @param _type     Type of payment.
     * @param amount    The amount required to pay (in tokens, USD or daily USD price).
     */
    struct Payment {
        uint256 id;
        PaymentType _type;
        uint256 amount;
    }

    // =============================================== Events =========================================================
    // =============================================== Setters ========================================================

    /** @dev Constructor.
     *  @param _registry    The address of the `TokensRegistry` contract.
     *  @param _swap        The address of the `SwapHelper` contract.
     */
    constructor(address _registry, address _swap) {
        registry = ITokensRegistry(_registry);
        swap = ISwapHelper(_swap);
    }

    // =============================================== Getters ========================================================

    /** @dev Withdraws the provided token to the owner address.
     * @param _token  Address of the token to withdraw.
     */
    function claim(address _token) public onlyOwner {
        IERC20(_token).transfer(
            owner(),
            IERC20(_token).balanceOf(address(this))
        );
    }
}
