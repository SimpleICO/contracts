pragma solidity 0.4.19;

import '../node_modules/zeppelin-solidity/contracts/token/StandardToken.sol';
import '../node_modules/zeppelin-solidity/contracts/token/DetailedERC20.sol';

contract SimpleToken is StandardToken, DetailedERC20 {

    function SimpleToken() {}
    
}