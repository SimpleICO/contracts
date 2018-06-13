// var SimpleToken = artifacts.require("../contracts/simpletoken.sol");
// var SimpleCrowdsale = artifacts.require("../contracts/simplecrowdsale.sol");
var SimpleICO = artifacts.require("../contracts/simpleico.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleICO);
  // deployer.deploy(SimpleCrowdsale, 'My SimpleToken', 'MST', 0, 1);
}