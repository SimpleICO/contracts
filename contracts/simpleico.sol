pragma solidity ^0.4.21;

contract SimpleICO {

    address[] public crowdsales;

    mapping (address => address[]) public crowdsalesByAddress;

    function addCrowdsale(address _crowdsale) public {
        
        crowdsales.push(_crowdsale);

        crowdsalesByAddress[msg.sender].push(_crowdsale);
    }

    function getCrowdsales() view public returns (address[]) {
        return crowdsales;
    }

    function getCrowdsalesByAddress(address _wallet) view public returns (address[]) {
        return crowdsalesByAddress[_wallet];
    }

}