var SimpleToken = artifacts.require("../contracts/simpletoken.v1.sol");
var SimpleCrowdsale = artifacts.require("../contracts/simplecrowdsale.v1.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleToken);
  deployer.deploy(SimpleCrowdsale);
}