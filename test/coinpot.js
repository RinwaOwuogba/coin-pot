const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { isSameDay, addDays } = require("date-fns");

chai.use(chaiAsPromised);

const { assert, expect } = chai;

const CoinPot = artifacts.require("./CoinPot.sol");
const MockContract = artifacts.require("./MockContract.sol");
const Token = artifacts.require("./IERC20Token.sol");

const errors = {
  lockNotCleared: "current lock has not been cleared",
  amountNotAboveZero: "amount has to be greater than zero",
  withdrawFromEmptyLock: "cannot withdraw from empty lock",
  beforeUnlockDate: "cannot withdraw before unlock date",
};

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

    contract("should create a new lock and retrieve it", (accounts) => {
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

    it("should fail to create coin lock while current sender lock is not cleared", async () => {
      const amount = 1130;
      const days = 131;

      await mock.givenAnyReturnBool(true);
      await coinPotInstance.newLock(amount, days, {
        from: accounts[0],
      });

      await expectRevert(
        coinPotInstance.newLock(amount, days, {
          from: accounts[0],
        }),
        errors.lockNotCleared
      );
    });

    it("should fail to create coin lock with zero amount", async () => {
      const amount = 0;
      const days = 1;

      await expectRevert(
        coinPotInstance.newLock(amount, days, {
          from: accounts[0],
        }),
        errors.amountNotAboveZero
      );
    });
  });

  contract("func: withdrawFromLock", () => {
    before(async () => {
      mock = await MockContract.new();
      token = await Token.at(mock.address);
    });

    beforeEach(async () => {
      coinPotInstance = await CoinPot.new(mock.address);
      await mock.givenAnyReturnBool(true);
    });

    it("should withdraw from completed lock", async () => {
      const amount = 1000;
      const days = 0;
      const withdrawAmount = 30;
      const from = accounts[0];

      // create lock
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

    it("should fail to withdraw from empty lock", async () => {
      const from = accounts[0];

      await expectRevert(
        coinPotInstance.withdrawFromLock(100, {
          from,
        }),
        errors.withdrawFromEmptyLock
      );
    });

    it("should fail to withdraw before unlock date", async () => {
      const from = accounts[0];

      await coinPotInstance.newLock(100, 100, {
        from,
      });

      await expectRevert(
        coinPotInstance.withdrawFromLock(100, {
          from,
        }),
        errors.beforeUnlockDate
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
  let error;

  try {
    await promise;
  } catch (err) {
    error = err;
  } finally {
    if (!error) {
      expect.fail("transaction failed to revert");
      return;
    }

    expect(error.message).to.have.string(
      "Reason given: " + errMsg,
      `expected "${error.message}" to contain "Reason given: ${errMsg}"\n\n`
    );
  }
};
