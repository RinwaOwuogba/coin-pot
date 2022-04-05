const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const MockContract = artifacts.require("./MockContract.sol");
const CoinPot = artifacts.require("./CoinPot.sol");

module.exports = function (deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(MockContract);
  deployer.deploy(CoinPot, "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1");
};
