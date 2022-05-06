// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

interface ITokensRegistry {
    function addToken(address token_, address pair) external;

    function pauseToken(address token_) external;

    function resumeToken(address token_) external;

    function getSupportedTokens() external view returns (address[] memory);

    function getTokenPair(address _id) external view returns (address);

    function isSupported(address token_) external view returns (bool);

    function isPaused(address token_) external view returns (bool);

    function isActive(address token_) external view returns (bool);
}
