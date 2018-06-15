pragma solidity ^0.4.21;

import '../node_modules/openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol';
import './SimpleToken.sol';

contract SimpleCrowdsale is Crowdsale {

    uint256 public price;

    uint256 internal weiAmount;

    event ProcessedRemainder(uint256 remainder);

    constructor (uint256 _price, uint256 _rate, address _wallet, SimpleToken _token)
        public Crowdsale(_rate, _wallet, _token) {

        price = _price;

    }

    /**
   * @dev low level token purchase ***DO NOT OVERRIDE***
   * @param _beneficiary Address performing the token purchase
   */
    function buyTokens(address _beneficiary) public payable {
        
        _preValidatePurchase(_beneficiary, msg.value);

        weiAmount = _processRemainder(_beneficiary, msg.value);

        uint256 tokens = _getTokenAmount(weiAmount);

        weiRaised = weiRaised.add(weiAmount);

        _processPurchase(_beneficiary, tokens);
        emit TokenPurchase(
            msg.sender,
            _beneficiary,
            weiAmount,
            tokens
        );

        _updatePurchasingState(_beneficiary, weiAmount);

        _forwardFunds();
        _postValidatePurchase(_beneficiary, weiAmount);
    }

    /**
       * @dev Transfers back the remainder of the weiAmount against the token price to the beneficiary
       * @param _beneficiary Address performing the token purchase
       * @param _weiAmount Value in wei involved in the purchase
       * @return _weiAmount Value without the remainder
    */
    function _processRemainder(address _beneficiary, uint256 _weiAmount) internal returns (uint256) {
        uint256 remainder = _weiAmount % price;

        emit ProcessedRemainder(remainder);

        if (remainder > 0) {
            _beneficiary.transfer(remainder);
        }

        return _weiAmount.sub(remainder);
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
        return _weiAmount.div(price).mul(1 ether);
    }

    /**
        * @dev Determines how ETH is stored/forwarded on purchases.
   */
    function _forwardFunds() internal {
        wallet.transfer(weiAmount);
    }
}