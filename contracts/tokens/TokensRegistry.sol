// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ITokensRegistry.sol";

/**
 * @dev TokenRegistry is the contract in charge of whitelist tokens usable
 *      by POS contracts to accept as payments.
 *      This tokens are usually with enough liquidity to make sure token conversion
 *      is possible without any significant loss for users.
 */
contract TokensRegistry is Ownable {
    // =============================================== Storage ========================================================

    /// @dev Token is an struct to include token information
    /// @params id the contract address of the token.
    /// @params dai_pair the pair address against DAI for the selected DEX.
    /// @params weth_pair the pair address against WETH for the selected DEX.
    /// @params paused boolean to enabled/disable the token on the platform.
    struct Token {
        address id;
        address dai_pair;
        address weth_pair;
        bool paused;
    }

    /// @dev tokens array available for usage across the all the POS.
    address[] private _tokens;

    /// @dev tokens available for usage across the all the POS.
    mapping(address => Token) private _supported;

    // =============================================== Events =========================================================

    /// @dev Emitted by the `addToken` function
    /// @param token The address the token added to the registry
    event TokenAdded(address indexed token);

    /// @dev Emitted by the `pauseToken` function
    /// @param token The address the token paused on the registry
    event TokenPaused(address indexed token);

    /// @dev Emitted by the `resumeToken` function
    /// @param token The address the token resumed on the registry
    event TokenResumed(address indexed token);

    // =============================================== Setters ========================================================

    /// @dev adds a new token to the registry.
    ///      requires the token to not be supported before addition.
    /// @param token_ The address the token to add to the registry.
    /// @param dai_pair The address the token to add to the registry. If the token doesn't
    ///                 have a DAI (stable coin) pair use 0x0000000000000000000000000000000000000000
    /// @param weth_pair The address the token to add to the registry.
    function addToken(
        address token_,
        address dai_pair,
        address weth_pair
    ) external onlyOwner {
        require(
            !isSupported(token_),
            "TokenRegistry: the token is already supported"
        );
        _tokens.push(token_);
        Token memory t = Token(token_, dai_pair, weth_pair, false);
        _supported[token_] = t;
        emit TokenAdded(token_);
    }

    /// @dev pauses a previously added token.
    ///      requires the token to be supported.
    /// @param token_ The address the token to pause.
    function pauseToken(address token_) external onlyOwner {
        require(
            isSupported(token_),
            "TokenRegistry: the token is not supported"
        );
        _supported[token_].paused = true;
        emit TokenPaused(token_);
    }

    /// @dev pauses a previously added token.
    ///      requires the token to be supported and to be paused.
    /// @param token_ The address the token to resume.
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

    /// @dev returns all supported tokens.
    function getSupportedTokens() public view returns (address[] memory) {
        return _tokens;
    }

    /// @dev returns true if provided token is supported.
    /// @param token_ Address of the token to query.
    function isSupported(address token_) public view returns (bool) {
        return _supported[token_].id != address(0);
    }

    /// @dev returns true if provided token is paused.
    /// @param token_ Address of the token to query.
    function isPaused(address token_) public view returns (bool) {
        return _supported[token_].paused;
    }

    /// @dev returns true if provided token is supported and active.
    /// @param token_ Address of the token to query.
    function isActive(address token_) public view returns (bool) {
        return isSupported(token_) && !isPaused(token_);
    }
}
