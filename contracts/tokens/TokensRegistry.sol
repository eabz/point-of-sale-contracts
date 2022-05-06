// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ITokensRegistry.sol";

/**
 * @dev `TokensRegistry` is the storage whitelisted tokens for the PointOfSale to use as payment.
 *      These tokens must have enough liquidity and paired directly with DAI.
 */
contract TokensRegistry is Ownable, ITokensRegistry {
    // =============================================== Storage ========================================================

    /** @dev Struct to include token information
     * @params id           Contract address of the token.
     * @params pair     Pair address against DAI for the selected DEX.
     * @params paused       Boolean to enabled/disable the token on the platform.
     */
    struct Token {
        address id;
        address pair;
        bool paused;
    }

    /** @dev Tokens available for usage across the all the `PointOfSale` instances. */
    address[] private _tokens;

    /** @dev Tokens available for usage across the all the `PointOfSale` instances. */
    mapping(address => Token) private _supported;

    // =============================================== Events =========================================================

    /** @dev Emitted by the `addToken` function
     * @param token The address the token added to the registry
     */
    event TokenAdded(address indexed token);

    /** @dev Emitted by the `pauseToken` function
     * @param token The address the token paused on the registry
     */
    event TokenPaused(address indexed token);

    /** @dev Emitted by the `resumeToken` function
     * @param token The address the token resumed on the registry
     */
    event TokenResumed(address indexed token);

    // =============================================== Setters ========================================================

    /** @dev Adds a new token to the registry. Requires the token to not be supported before addition.
     * @param token_        The address the token to add to the registry.
     * @param pair      The address of the token/DAI pair.
     */
    function addToken(address token_, address pair) external onlyOwner {
        require(
            !isSupported(token_),
            "TokensRegistry: the token is already supported"
        );
        require(pair != address(0), "TokensRegistry: missing token pair");
        _tokens.push(token_);
        Token memory t = Token(token_, pair, false);
        _supported[token_] = t;
        emit TokenAdded(token_);
    }

    /** @dev Pauses a previously added token. Requires the token to be supported.
     * @param token_ The address the token to pause.
     */
    function pauseToken(address token_) external onlyOwner {
        require(
            isSupported(token_),
            "TokenRegistry: the token is not supported"
        );
        _supported[token_].paused = true;
        emit TokenPaused(token_);
    }

    /** @dev Resumes a previously paused token. Requires the token to be supported and to be paused.
     * @param token_ The address the token to resume.
     */
    function resumeToken(address token_) external onlyOwner {
        require(
            isSupported(token_),
            "TokenRegistry: the token is not supported"
        );
        require(isPaused(token_), "TokenRegistry: the token is not paused");
        _supported[token_].paused = false;
        emit TokenResumed(token_);
    }

    // =============================================== Getters ========================================================

    /** @dev Returns the addresses of all the supported tokens. */
    function getSupportedTokens() public view returns (address[] memory) {
        return _tokens;
    }

    /** @dev Returns the token information */
    function getTokenPair(address _token) public view returns (address) {
        require(
            isActive(_token),
            "TokensRegistry: token doesn't exist or is paused"
        );
        return _supported[_token].pair;
    }

    /** @dev Returns if a token is supported.
     * @param token_ Address of the token to query.
     */
    function isSupported(address token_) public view returns (bool) {
        return _supported[token_].id != address(0);
    }

    /** @dev Returns if a token is paused..
     * @param token_ Address of the token to query.
     */
    function isPaused(address token_) public view returns (bool) {
        return _supported[token_].paused;
    }

    /** @dev Returns true if provided token is supported and active.
     * @param token_ Address of the token to query.
     */
    function isActive(address token_) public view returns (bool) {
        return isSupported(token_) && !isPaused(token_);
    }
}
