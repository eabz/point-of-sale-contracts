// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IUniswapV2Pair.sol";
import "../interfaces/IUniswapV2Router02.sol";
import "../interfaces/IUniswapV2Factory.sol";
import "../interfaces/IWETH.sol";
import "../interfaces/ISwapHelper.sol";

/**
 * @dev `SwapHelper` is a wrapper around Uniswap Router to perform trades.
 */
contract SwapHelper is Ownable, ISwapHelper {
    // =============================================== Storage ========================================================

    /** @dev Address of the DEX router. */
    address public router;

    /** @dev Address of the DEX factory. */
    address public factory;

    /** @dev Address for DAI token. */
    address public DAI;

    /** @dev Address for the Wrapped Native token of the network. */
    address public WETH;

    // =============================================== Setters =========================================================

    /** @dev Constructor.
     * @param _router           The DEX router address.
     * @param _factory          The DEX factory address.
     * @param _dai              The address of the DAI token of the network.
     * @param _weth             The address of the wrapped native token of the network.
     */
    constructor(
        address _router,
        address _factory,
        address _dai,
        address _weth
    ) {
        router = _router;
        factory = _factory;
        DAI = _dai;
        WETH = _weth;
    }

    /** @dev Performs a swap using ETH to DAI.
     * @param amount The minimum expected amount of DAI to receive.
     */
    function swapETH(uint256 eth, uint256 amount) public payable {
        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = DAI;

        IUniswapV2Router02(router).swapExactETHForTokens{value: eth}(
            amount,
            path,
            msg.sender,
            block.timestamp + 200
        );
    }

    /** @dev Performs a swap using any token to DAI.
     * @param _token        The converting token address.
     * @param tokenAmount   The maximum amount of tokens used for the trade
     * @param amount        The minimum expected amount of DAI to receive.
     */
    function swap(
        address _token,
        uint256 tokenAmount,
        uint256 amount
    ) public {
        IERC20(_token).transferFrom(msg.sender, address(this), tokenAmount);

        address[] memory path;

        uint256 allowance = IERC20(_token).allowance(address(this), router);
        if (allowance < tokenAmount) {
            IERC20(_token).approve(router, tokenAmount);
        }

        IUniswapV2Router02(router).swapExactTokensForTokens(
            tokenAmount,
            amount,
            path,
            msg.sender,
            block.timestamp + 200
        );
    }

    // =============================================== Getters ========================================================

    /** @dev Calculates the amount of tokens required to fulfill the `amount`.
     * @param token      The address of the trade pair.
     * @param amount    The amount of DAI that needs to be fulfilled.
     * @param slippage  Percentage of variation of token price.
     */
    function getTokenAmount(
        address token,
        uint256 amount,
        uint256 slippage
    ) external view returns (uint256) {
        require(token != address(0), "SwapHelper: token cannot be empty");
        require(amount > 0, "SwapHelper: amount should be more than 0");
        address pair = IUniswapV2Factory(factory).getPair(token, DAI);
        require(pair != address(0), "SwapHelper: pair cannot be empty");
        return _calcTokenAmount(pair, amount, slippage);
    }

    /** @dev Calculates the amount ETH required to fulfill `amount`.
     * @param amount    The amount of DAI that needs to be fulfilled.
     * @param slippage  Percentage of variation of token price.
     */
    function getETHAmount(uint256 amount, uint256 slippage)
        external
        view
        returns (uint256)
    {
        require(amount > 0, "SwapHelper: amount should be more than 0");
        uint256 amountETH = (amount / _daiToWETH()) * 1 ether;
        uint256 slippage = ((amountETH / 100) * slippage);
        return amountETH + slippage;
    }

    // =============================================== Internal ========================================================

    /** @dev Calculates the amount of tokens required to fulfill the `daiAmount`.
     * @param pair The address of the trade pair (it assumes it is token/DAI pair)
     * @param expected The amount of DAI that needs to be fulfilled.
     * @param slippage percentage of variation of token price.
     */
    function _calcTokenAmount(
        address pair,
        uint256 expected,
        uint256 slippage
    ) internal view returns (uint256) {
        (uint112 token, uint112 dai, ) = IUniswapV2Pair(pair).getReserves();
        uint256 amount = (expected * (dai / token)) * 1 ether;
        uint256 slippage = ((amount / 100) * slippage);
        return amount + slippage;
    }

    /** @dev Returns the amount of DAI required to buy 1 ETH. */
    function _daiToWETH() internal view returns (uint256) {
        address pair = IUniswapV2Factory(factory).getPair(WETH, DAI);
        (uint112 dai, uint112 eth, ) = IUniswapV2Pair(pair).getReserves();
        return (dai / eth);
    }
}
