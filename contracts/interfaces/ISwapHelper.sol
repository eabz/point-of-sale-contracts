// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

interface ISwapHelper {
    function swapETH(uint256 amount) external payable;

    function swap(
        address _token,
        uint256 tokenAmount,
        uint256 amount
    ) external;

    function getTokenAmount(
        address pair,
        uint256 amount,
        uint256 slippage
    ) external view returns (uint256);
}
