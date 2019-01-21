pragma solidity ^0.4.21;

import '../node_modules/openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import '../node_modules/openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol';

contract SimpleToken is StandardToken, DetailedERC20 {
    constructor (
    string _name, 
    string _symbol, 
    uint8 _decimals,
    uint256 _totalSupply) public DetailedERC20 (_name, _symbol, _decimals) {
        require(_totalSupply > 0);
        uint256 supply = _totalSupply * 1 ether;
        totalSupply_ = supply;
        balances[msg.sender] = supply;
        emit Transfer(0x0, msg.sender, supply);
    }
}