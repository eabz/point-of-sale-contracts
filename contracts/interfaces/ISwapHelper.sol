// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

interface ISwapHelper {
    function swapETH(uint256 amount) external payable;

    function swap(
        address _token,
        address _pair,
        uint256 amount
    ) external;
}
