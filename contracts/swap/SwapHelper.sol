// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IWETH.sol";

/**
 * @dev SwapHelper is a wrapper around Uniswap Router to perform trades.
 */
contract SwapHelper is Ownable {
    // =============================================== Storage ========================================================

    /** @dev Contract address of the DEX router. */
    address public router;

    /** @dev Contract address for DAI token. */
    address public DAI;

    /** @dev Contract address for WETH. */
    address public WETH;

    /** @dev Pair of WETH/DAI for the DEX. */
    address public WETH_DAI_PAIR;

    // =============================================== Setters =========================================================

    /** @dev Constructor.
     * @param _router The contract address of the DEX router.
     * @param _weth_dai_pair The contract address of the WETH/DAI pair on the DEX.
     */
    constructor(
        address _router,
        address _dai,
        address _weth,
        address _weth_dai_pair
    ) {
        router = _router;
        WETH_DAI_PAIR = _weth_dai_pair;
        DAI = _dai;
        WETH = _weth;
    }

    /** @dev Performs a swap using ETH to DAI.
     *  @param daiAmount The minimum expected amount of DAI to receive.
     */
    function swapETHToDAI(uint256 daiAmount) public payable {
        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = DAI;

        IUniswapV2Router02(router).swapExactETHForTokens{value: msg.value}(
            daiAmount,
            path,
            msg.sender,
            block.timestamp + 200
        );
    }

    /** @dev Performs a swap using any token to DAI.
     * @param _token The converting token address.
     *  @param tokenAmount The amount of tokens spending to be converted.
     *  @param daiAmount The minimum expected amount of DAI to receive.
     *  @param useWETH Boolean to enable using WETH for the sell path.
     */
    function swapTokenToDAI(
        address _token,
        uint256 tokenAmount,
        uint256 daiAmount,
        bool useWETH
    ) public {
        IERC20(_token).transferFrom(msg.sender, address(this), tokenAmount);

        address[] memory path;

        if (useWETH) {
            path = new address[](3);
            path[0] = _token;
            path[1] = WETH;
            path[2] = DAI;
        } else {
            path = new address[](2);
            path[0] = _token;
            path[1] = DAI;
        }

        uint256 allowance = IERC20(_token).allowance(address(this), router);
        if (allowance < tokenAmount) {
            IERC20(_token).approve(router, tokenAmount);
        }

        IUniswapV2Router02(router).swapExactTokensForTokens(
            tokenAmount,
            daiAmount,
            path,
            msg.sender,
            block.timestamp + 200
        );
    }

    // =============================================== Getters ========================================================

    /** @dev Calculates the amount of tokens required to fulfill the `daiPrice`.
     * @param pair The address of the trade pair.
     *  @param daiPrice The amount of DAI that needs to be fulfilled.
     *  @param slippage percentage of variation of token price.
     */
    function getTokenAmount(
        address pair,
        uint256 daiPrice,
        uint256 slippage,
        bool isWETH
    ) public view returns (uint256) {
        require(pair != address(0), "SwapHelper: pair cannot be empty");
        require(daiPrice > 0, "SwapHelper: daiPrice should be more than 0");
        if (isWETH) {
            return _calcTokenAmountWETH(pair, daiPrice, slippage);
        } else {
            return _calcTokenAmount(pair, daiPrice, slippage);
        }
    }

    /** @dev Calculates the amount ETH required to fulfill `daiPrice`.
     *  @param daiPrice The amount of DAI that needs to be fulfilled.
     *  @param slippage percentage of variation of token price.
     */
    function getETHAmount(uint256 daiPrice, uint256 slippage)
        public
        view
        returns (uint256)
    {
        require(daiPrice > 0, "SwapHelper: daiPrice should be more than 0");
        uint256 amountETH = daiPrice / _daiToWETH();
        return amountETH + ((amountETH * slippage) / 100);
    }

    // =============================================== Internal ========================================================

    /** @dev Calculates the amount of tokens required to fulfill the `daiPrice`.
     * @param pair The address of the trade pair (it assumes it is token/DAI pair)
     *  @param daiPrice The amount of DAI that needs to be fulfilled.
     *  @param slippage percentage of variation of token price.
     */
    function _calcTokenAmount(
        address pair,
        uint256 daiPrice,
        uint256 slippage
    ) internal view returns (uint256) {
        (uint112 token, uint112 dai, ) = IUniswapV2Pair(pair).getReserves();
        uint256 amount = daiPrice * (dai / token);
        return amount + ((amount * slippage) / 100);
    }

    /** @dev Calculates the amount of tokens required to fulfill the `daiPrice` using token/weth as the pair.
     * @param pair The address of the trade pair (it assumes it is token/WETH pair)
     *  @param daiPrice The amount of DAI that needs to be fulfilled.
     *  @param slippage percentage of variation of token price.
     */
    function _calcTokenAmountWETH(
        address pair,
        uint256 daiPrice,
        uint256 slippage
    ) internal view returns (uint256) {
        uint256 amountETH = daiPrice / _daiToWETH();
        (uint112 token, uint112 weth, ) = IUniswapV2Pair(pair).getReserves();
        uint256 amount = amountETH * (weth / token);
        return amount + ((amount * slippage) / 100);
    }

    /** @dev Returns the amount of DAI required to buy 1 ETH. */
    function _daiToWETH() internal view returns (uint256) {
        (uint112 daiReserves, uint112 wethReserves, ) = IUniswapV2Pair(
            WETH_DAI_PAIR
        ).getReserves();
        return (daiReserves / wethReserves);
    }
}
