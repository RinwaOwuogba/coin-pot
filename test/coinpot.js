const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { isSameDay, addDays } = require("date-fns");

chai.use(chaiAsPromised);

const { assert, expect } = chai;

const CoinPot = artifacts.require("./CoinPot.sol");
const MockContract = artifacts.require("./MockContract.sol");
const Token = artifacts.require("./IERC20Token.sol");

contract("CoinPot", async (accounts) => {
  let coinPotInstance;
  let mock;
  let token;

  // before(async () => {
  //   mock = await MockContract.new();
  //   coinPotInstance = await CoinPot.new(mock.address);
  // });

  contract("func: newLock", () => {
    before(async () => {
      mock = await MockContract.new();
      coinPotInstance = await CoinPot.new(mock.address);
    });

    contract("should create a new coin lock and retrieve it", (accounts) => {
      before(async () => {
        mock = await MockContract.new();
        coinPotInstance = await CoinPot.new(mock.address);
      });

      const cases = [
        { amount: 100, days: 200, from: accounts[0] },
        { amount: 21, days: 20, from: accounts[1] },
        { amount: 1130, days: 131, from: accounts[2] },
      ];

      cases.forEach((lockCase) => {
        const { amount, days, from } = lockCase;

        it(`amount_${amount}`, async () => {
          await mock.givenAnyReturnBool(true);
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

    it("should fail to create coin lock while sender sender lock is not cleared", async () => {
      const amount = 1130;
      const days = 131;

      await mock.givenAnyReturnBool(true);
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

  contract.only("func: withdrawFromLock", () => {
    before(async () => {
      mock = await MockContract.new();
      coinPotInstance = await CoinPot.new(mock.address);
      token = await Token.at(mock.address);
    });

    it("should withdraw from active lock", async () => {
      const amount = 1000;
      const days = 131;
      const withdrawAmount = 30;
      const from = accounts[0];

      // create lock
      await mock.givenAnyReturnBool(true);
      await coinPotInstance.newLock(amount, days, {
        from,
      });
      await mock.reset();

      // withdraw from lock
      const transferFromContract = token.contract.methods
        .transferFrom(coinPotInstance.address, from, withdrawAmount)
        .encodeABI();
      await mock.givenCalldataReturnBool(transferFromContract, true);
      await coinPotInstance.withdrawFromLock(withdrawAmount, {
        from,
      });

      // check withdrawal call
      const invocationCount = await mock.invocationCountForMethod.call(
        transferFromContract
      );
      assert.equal(
        invocationCount,
        1,
        `expected ${1} invocations, got ${invocationCount}`
      );

      // verify updated balance
      const resultingLock = await coinPotInstance.getActiveLock({ from });
      const expectedBalance = amount - withdrawAmount;

      assert.equal(
        resultingLock[0],
        expectedBalance,
        `expected ${expectedBalance} balance got ${resultingLock[0].toNumber()}`
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
