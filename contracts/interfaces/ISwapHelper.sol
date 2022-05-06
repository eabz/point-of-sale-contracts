// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

interface ISwapHelper {
    function swapETH(uint256 expected) external payable;

    function swap(address _token, uint256 expected) external;

    function getTokenAmount(address token, uint256 expected)
        external
        view
        returns (uint256);

    function getETHAmount(uint256 expected) external view returns (uint256);
}
