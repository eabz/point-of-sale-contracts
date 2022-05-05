// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

interface ISwapHelper {
    function swapETHToDAI(uint256 amount) external payable;

    function swapTokenToDAI(
        address _token,
        uint256 tokenAmount,
        uint256 daiAmount,
        bool useWETH
    ) external;

    function getTokenAmount(
        address pair,
        uint256 daiPrice,
        uint256 slippage,
        bool isWETH
    ) external returns (uint256);

    function getETHAmount(uint256 daiPrice, uint256 slippage)
        external
        returns (uint256);
}
