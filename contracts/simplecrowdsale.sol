pragma solidity ^0.4.21;

import '../node_modules/openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol';
import './SimpleToken.sol';

contract SimpleCrowdsale is Crowdsale {

    uint256 public price;

    constructor (uint256 _price, uint256 _rate, address _wallet, SimpleToken _token)
        public Crowdsale(_rate, _wallet, _token) {

            price = _price;

    }

    /**
       * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met. Use super to concatenate validations.
       * @param _beneficiary Address performing the token purchase
       * @param _weiAmount Value in wei involved in the purchase
    */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
        require(_beneficiary != address(0));
        require(_weiAmount != 0);
        require(_weiAmount >= price);
    }

    /**
       * @dev Override to extend the way in which ether is converted to tokens.
       * @param _weiAmount Value in wei to be converted into tokens
       * @return Number of tokens that can be purchased with the specified _weiAmount
   */
    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
       return _weiAmount.div(price).mul(rate);
    }
}