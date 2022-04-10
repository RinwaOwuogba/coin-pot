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
  insufficientBalance: "balance must be greater than amount",
  insufficientBalanceWithTax: "balance must be greater than amount plus tax",
  lockNotFound: "sender does not have active lock",
};

contract("CoinPot", async (accounts) => {
  let coinPotInstance;
  let mock;
  let token;

  before(async () => {
    mock = await MockContract.new();
    token = await Token.at(mock.address);
  });

  describe("func: newLock", () => {
    before(async () => {
      mock = await MockContract.new();
      coinPotInstance = await CoinPot.new(mock.address);
    });

    describe("should create a new lock and retrieve it", () => {
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

          const bigNumberKeys = ["0", "1"];
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

  describe("func: withdrawFromLock", () => {
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

      await assertSuccessfulTransferOnWithdraw(
        mock,
        coinPotInstance,
        token,
        from,
        withdrawAmount
      );

      // verify updated balance
      const resultingLock = await coinPotInstance.getActiveLock({ from });
      const expectedBalance = amount - withdrawAmount;

      assertBalance(resultingLock[0].toNumber(), expectedBalance);
      // assert.equal(
      //   resultingLock[0],
      //   expectedBalance,
      //   `expected ${expectedBalance} balance got ${resultingLock[0].toNumber()}`
      // );
    });

    it("should pay a fee to the pot for early withdrawal", async () => {
      const from = accounts[0];
      const depositAmount = 100;
      const withdrawAmount = 50;

      await coinPotInstance.newLock(depositAmount, 100, {
        from,
      });
      await mock.reset();

      await assertSuccessfulTransferOnWithdraw(
        mock,
        coinPotInstance,
        token,
        from,
        withdrawAmount
      );

      const [pot, senderLock] = await Promise.all([
        coinPotInstance.getPot({ from }),
        coinPotInstance.getActiveLock({ from }),
      ]);

      const percentageTax = 0.05; // 5%
      const expectedPotAmount = Math.floor(withdrawAmount * percentageTax);
      const expectedUserBalance =
        depositAmount -
        withdrawAmount -
        Math.floor(withdrawAmount * percentageTax);

      // assert.equal(
      //   pot.balance.toNumber(),
      //   expectedPotAmount,
      //   `expected ${expectedPotAmount} in pot, got ${pot.balance.toNumber()}`
      // );
      assertPotBalance(pot.balance.toNumber(), expectedPotAmount);
      assertBalance(senderLock.balance.toNumber(), expectedUserBalance);
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

    it("should fail to withdraw more than balance on completed lock", async () => {
      const from = accounts[0];
      const depositAmount = 100;
      const withdrawAmount = depositAmount + 1;
      const days = 0;

      await coinPotInstance.newLock(depositAmount, days, {
        from,
      });

      await expectRevert(
        coinPotInstance.withdrawFromLock(withdrawAmount, {
          from: accounts[0],
        }),
        errors.insufficientBalance
      );
    });

    it("should fail to withdraw when balance less than amount plus tax on early withdraw", async () => {
      const from = accounts[0];
      const depositAmount = 100;
      const days = 1;

      await coinPotInstance.newLock(depositAmount, days, {
        from,
      });

      await expectRevert(
        coinPotInstance.withdrawFromLock(depositAmount, {
          from: accounts[0],
        }),
        errors.insufficientBalanceWithTax
      );
    });
  });

  describe("func: depositInLock", () => {
    beforeEach(async () => {
      coinPotInstance = await CoinPot.new(mock.address);
      await mock.givenAnyReturnBool(true);
    });

    it("should deposit token in active lock", async () => {
      const amount = 100;
      const additionalDeposit = 10;
      const days = 100;
      const from = accounts[0];

      await coinPotInstance.newLock(amount, days, {
        from,
      });

      await coinPotInstance.depositInLock(additionalDeposit, {
        from,
      });

      const got = await coinPotInstance.getActiveLock({
        from,
      });

      assertBalance(got[0].toNumber(), amount + additionalDeposit);
    });

    it("should fail to deposit amount not greater zero", async () => {
      const amount = 100;
      const days = 100;
      const from = accounts[0];

      await coinPotInstance.newLock(amount, days, {
        from,
      });

      await expectRevert(
        coinPotInstance.depositInLock(0),
        errors.amountNotAboveZero
      );
    });

    it("should fail to deposit if lock is inactive", async () => {
      const from = accounts[0];

      await expectRevert(
        coinPotInstance.depositInLock(10, { from }),
        errors.lockNotFound
      );
    });
  });

  describe.only("func: runLottery", () => {
    beforeEach(async () => {
      coinPotInstance = await CoinPot.new(mock.address);
      await mock.givenAnyReturnBool(true);
    });

    it("should award pot to a random user with an active lock on or after next lottery date", async () => {
      const users = [...accounts.slice(0, 3)];
      const depositAmount = 100;
      const days = 100;
      const withdrawAmount = depositAmount / 2;

      // create active locks for small group of users
      // and make early withdraws to create pot donations
      for await (const from of users) {
        await coinPotInstance.newLock(depositAmount, days, {
          from,
        });

        await coinPotInstance.withdrawFromLock(withdrawAmount, { from });
      }

      await coinPotInstance.runLottery();

      const { addresses } = await coinPotInstance.getLotteryWinners();
      const [lotteryWinner] = addresses;

      assert.include(
        users,
        lotteryWinner,
        `expected winner address to be one of "${users}", got address ${lotteryWinner}\n\n`
      );

      const percentageTax = 0.05; // 5%
      const earlyWithdrawTax = Math.floor(withdrawAmount * percentageTax);
      const potAmount = Math.round(earlyWithdrawTax) * users.length;

      const [winnerLock, pot] = await Promise.all([
        coinPotInstance.getActiveLock({
          from: lotteryWinner,
        }),
        coinPotInstance.getPot(),
      ]);

      assertBalance(
        winnerLock.balance.toNumber(),
        depositAmount - withdrawAmount - earlyWithdrawTax + potAmount
      );
      assertPotBalance(pot.balance.toNumber(), 0);
    });
  });
});

const assertPotBalance = (got, want) => {
  assert.equal(got, want, `expected ${want} in pot, got ${got}`);
};

const assertBalance = (got, want) => {
  assert.equal(got, want, `expected balance of ${want}, got ${got}`);
};

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

const assertSuccessfulTransferOnWithdraw = async (
  mock,
  coinPotInstance,
  token,
  from,
  withdrawAmount
) => {
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
};
