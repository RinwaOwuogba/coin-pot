var SimpleStorage = artifacts.require("./SimpleStorage.sol");
const CoinPot = artifacts.require("./CoinPot.sol");

module.exports = function (deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(CoinPot);
};
