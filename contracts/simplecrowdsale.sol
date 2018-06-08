pragma solidity ^0.4.21;

import '../node_modules/openzeppelin-solidity/contracts/crowdsale/Crowdsale.sol';
import './SimpleToken.sol';
// import '../node_modules/openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';

contract SimpleCrowdsale is Crowdsale {

    constructor (uint256 _rate, address _wallet, SimpleToken _token)
        public Crowdsale(_rate, _wallet, _token) {
    }

}