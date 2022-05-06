// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

interface ISwapHelper {
    function swapETH(uint256 eth, uint256 amount) external payable;

    function swap(
        address _token,
        uint256 tokenAmount,
        uint256 amount
    ) external;

    function getTokenAmount(
        address token,
        uint256 amount,
        uint256 slippage
    ) external view returns (uint256);

    function getETHAmount(uint256 amount, uint256 slippage)
        external
        view
        returns (uint256);
}
