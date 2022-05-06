// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/ITokensRegistry.sol";
import "../interfaces/ISwapHelper.sol";
import "../tokens/TokensRegistry.sol";
import "../tokens/TokensRegistry.sol";

/**
 * @dev `PointOfSale` is the contract that holds all the information about payments and subscriptions.
 */
contract PointOfSale is Ownable {
    // =============================================== Storage ========================================================

    /** @dev `PaymentType` is a enum to identify which type of payment is being used. */
    enum PaymentType {
        TOKEN_BASED,
        USD_BASED,
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
     * @param active    Boolean to know if the payment is active.
     */
    struct Payment {
        uint256 id;
        PaymentType _type;
        uint256 amount;
        bool active;
    }

    /** @dev List of all payment identifiers */
    uint256[] private _payments;

    /** @dev Payments information */
    mapping(uint256 => Payment) private payments;

    // =============================================== Events =========================================================

    /** @dev Emitted by the `createPayment` function
     *  @param id The identifier of the new payment.
     */
    event CreatePayment(uint256 indexed id);

    /** @dev Emitted by the `disablePayment` function
     *  @param id The identifier of the new payment.
     */
    event DisabledPayment(uint256 indexed id);

    /** @dev Emitted by the `pay` function
     *  @param payer    Address of the user that payed.
     *  @param id       Identifier of the payment.
     */
    event Pay(address indexed payer, uint256 indexed id);

    // =============================================== Setters ========================================================

    /** @dev Constructor.
     *  @param _registry    The address of the `TokensRegistry` contract.
     *  @param _swap        The address of the `SwapHelper` contract.
     */
    constructor(address _registry, address _swap) {
        registry = ITokensRegistry(_registry);
        swap = ISwapHelper(_swap);
    }

    function createPayment(PaymentType _type, uint256 amount)
        public
        onlyOwner
        returns (uint256)
    {
        require(
            _type == PaymentType.TOKEN_BASED ||
                _type == PaymentType.USD_BASED ||
                _type == PaymentType.SUBSCRIPTION,
            "PointOfSale: Invalid payment type"
        );
        uint256 id = _payments.length + 1;
        Payment memory p = Payment(id, _type, amount, true);
        _payments.push(id);
        payments[id] = p;
        return id;
    }

    function disablePayment(uint256 _id) public onlyOwner {
        require(
            payments[_id].id != 0,
            "PointOfSale: Payment doesn't not exists"
        );
        payments[_id].active = false;
    }

    /** @dev Withdraws the provided token to the owner address.
     * @param _token  Address of the token to withdraw.
     */
    function claim(address _token) public onlyOwner {
        IERC20(_token).transfer(
            owner(),
            IERC20(_token).balanceOf(address(this))
        );
    }

    /** @dev Sends token to pay,
     * @param _id Payment identifier.
     */
    function pay(
        uint256 _id,
        address _token,
        uint256 _days
    ) public returns (bool) {
        require(
            payments[_id].id != 0,
            "PointOfSale: Payment doesn't not exists"
        );

        Payment memory p = payments[_id];

        require(
            p._type == PaymentType.TOKEN_BASED ||
                p._type == PaymentType.USD_BASED ||
                p._type == PaymentType.SUBSCRIPTION,
            "PointOfSale: Unknown Payment type"
        );

        if (p._type == PaymentType.TOKEN_BASED) {
            require(
                _token != address(0),
                "PointOfSale: Token based require a token address to pay"
            );
            return _payTokenBasedPayment(p, _token);
        }

        if (p._type == PaymentType.USD_BASED) {
            return _payUsdBasedPayment(p);
        }

        if (p._type == PaymentType.SUBSCRIPTION) {
            require(
                _days != 0,
                "PointOfSale: Subscription payments require an amount of days"
            );
            return _initializeSubscription(p, _days);
        }

        return false;
    }

    // =============================================== Getters ========================================================

    /** @dev Returns the payment information by an identifier.
     * @param _id Identifier of the payment.
     */
    function getPayment(uint256 _id) public view returns (Payment memory) {
        require(
            payments[_id].id != 0,
            "PointOfSale: Payment doesn't not exists"
        );
        return payments[_id];
    }

    /** @dev Returns all the payment identifiers */
    function getAllPayments() public view returns (uint256[] memory) {
        return _payments;
    }

    // =============================================== Internal ========================================================

    function _payTokenBasedPayment(Payment memory p, address _token)
        internal
        returns (bool)
    {
        address pair = registry.getTokenPair(_token);
        return true;
    }

    function _payUsdBasedPayment(Payment memory p) internal returns (bool) {
        return true;
    }

    function _initializeSubscription(Payment memory p, uint256 _days)
        internal
        returns (bool)
    {
        return true;
    }
}
