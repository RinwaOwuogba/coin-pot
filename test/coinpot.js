const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { isSameDay, addDays } = require("date-fns");
const CoinPot = artifacts.require("./CoinPot.sol");

chai.use(chaiAsPromised);

const { assert, expect } = chai;
// const BigNumber = require("bignumber.js");

contract("CoinPot", function (accounts) {
  let coinPotInstance;

  beforeEach(async () => {
    coinPotInstance = await CoinPot.deployed();
  });

  contract("newLock", function () {
    contract("should create a new coin lock and retrieve it", (accounts) => {
      const cases = [
        { amount: 100, days: 200, from: accounts[0] },
        { amount: 21, days: 20, from: accounts[1] },
        { amount: 1130, days: 131, from: accounts[2] },
      ];

      cases.forEach((lockCase) => {
        const { amount, days, from } = lockCase;
        it(`amount_${amount}`, async () => {
          await coinPotInstance.newLock(amount, days, {
            from,
          });

          const got = await coinPotInstance.getActiveLock({
            from,
          });

          const bigNumberKeys = ["0", "1", "2", "3"];

          assert.containsAllKeys(got, bigNumberKeys);
          convertBigNumberValues(got, bigNumberKeys);

          const want = {
            0: amount,
            1: days,
          };

          const unlockDate = new Date(got[3] * 1000);
          const expectedUnlockDate = addDays(new Date(), days);

          assert.deepInclude(got, want);
          assert.equal(
            true,
            isSameDay(unlockDate, expectedUnlockDate),
            `expected unlock day ${expectedUnlockDate.toISOString()}, got ${unlockDate.toISOString()}`
          );
        });
      });
    });

    it("sender should fail to create coin lock while current lock is not cleared", async () => {
      const amount = 1130;
      const days = 131;

      await coinPotInstance.newLock(amount, days, {
        from: accounts[0],
      });

      const errMessage = /(.*)?current lock has not been cleared(.*)?/;

      await expectRevert(
        coinPotInstance.newLock(amount, days, {
          from: accounts[0],
        }),
        errMessage
      );
    });

    it("should fail to create coin lock with zero amount", async () => {
      const errMessage = /(.*)?amount has to be greater than zero(.*)?/;

      const amount = 0;
      const days = 1;

      await expectRevert(
        coinPotInstance.newLock(amount, days, {
          from: accounts[0],
        }),
        errMessage
      );
    });

    it("should fail to create coin lock with zero days", async () => {
      const errMessage = /(.*)?days has to be greater than zero(.*)?/;

      const amount = 1;
      const days = 0;

      await expectRevert(
        coinPotInstance.newLock(amount, days, {
          from: accounts[0],
        }),
        errMessage
      );
    });
  });
});

const convertBigNumberValues = (obj, keys) => {
  keys.forEach((key) => {
    obj[key] = obj[key].toNumber();
  });
};

const expectRevert = async (promise, errMsg) => {
  await expect(promise).to.eventually.be.rejectedWith(errMsg);
};
