// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../pos/PointOfSale.sol";
import "../tokens/TokensRegistry.sol";

/**
 * @dev `Factory` deploys and stores implementations of `PointOfSale`.
 *       Users are only available to deploy a single instance for each address.
 */
contract Factory is Ownable {
    // =============================================== Storage ========================================================

    /** @dev Stores each address deployment **/
    mapping(address => address) private deployments;

    /** @dev Checks if the `Factory` is usable. **/
    bool public active;

    /** @dev Whitelisted tokens registry  **/
    address public registry;

    /** @dev Utility contract to perform swaps.  **/
    address public swap;

    // =============================================== Events ========================================================

    /** @dev Emitted by the `deploy` function
     *  @param user     The address that deployed the `PointOfSale`.
     *  @param pos      The address of the `PointOfSale` instance.
     */
    event Deployed(address indexed user, address indexed pos);

    // ============================================== Modifiers =======================================================

    /**
     * @dev Checks if `active` is enabled.
     */
    modifier onlyActive() {
        require(active, "Factory: not active");
        _;
    }

    // =============================================== Setters ========================================================

    /** @dev Constructor.
     *  @param _registry    The address of the `TokensRegistry` contract.
     *  @param _swap        The address of the `SwapHelper` contract.
     */
    constructor(address _registry, address _swap) {
        active = false;
        registry = _registry;
        swap = _swap;
    }

    /** @dev Enables or disables the `Factory` contract.
     *  @param _active  Enable or disable the Factory contract
     */
    function setActive(bool _active) external onlyOwner {
        active = _active;
    }

    /** @dev Deploys a `PointOfSale` instance with `msg.sender` as the owner. */
    function deploy() external onlyActive returns (PointOfSale) {
        require(
            deployments[msg.sender] == address(0),
            "Factory: user already has a deployment"
        );
        PointOfSale p = new PointOfSale(registry, swap);
        p.transferOwnership(msg.sender);
        deployments[msg.sender] = address(p);
        emit Deployed(msg.sender, address(p));
        return p;
    }

    // =============================================== Getters ========================================================

    /** @dev Returns the address of the user `PointOfSale` instance.
     *  @param _user Address of the deployer
     */
    function getDeployment(address _user) public view returns (address) {
        return deployments[_user];
    }
}
