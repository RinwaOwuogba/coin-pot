// SPDX-License-Identifier: MIT

pragma solidity >=0.4.21 <8.10.0;

import "./IERC20Token.sol";

struct Pot {
	uint256 balance;
	uint256 lastLotteryDate;
	uint16 daysBetweenLottery;
	uint256 percentageTax;
}

struct Lock {
	uint256 balance;
	uint256 noOfDays;
	uint256 createdAt;
	uint256 unlockDate;
}

struct Winner {
	uint256 timestamp;
	address winnerAddress;
	uint256 amount;
}

contract CoinPot {
	IERC20Token token;
	Pot pot;
	Winner[] winners;

	address internal cUSDTokenAddress;
	mapping(address => Lock) internal coinLocks;
	address[] owners;

	constructor(address tokenAddress) public {
		cUSDTokenAddress = tokenAddress;
		token = IERC20Token(tokenAddress);
		pot = Pot(0, block.timestamp, 7, 5);
	}

	function addLockOwner(address ownerAddress) internal {
		if (coinLocks[ownerAddress].createdAt == 0) {
			owners.push(ownerAddress);
		}
	}

	function getPot()
		public
		view
		returns (
			uint256 balance,
			uint256 lastLotteryDate,
			uint16 daysBetweenLottery,
			uint256 percentageTax
		)
	{
		return (
			pot.balance,
			pot.lastLotteryDate,
			pot.daysBetweenLottery,
			pot.percentageTax
		);
	}

	function newLock(uint256 amount, uint256 lockDays) public payable {
		require(amount > 0, "amount has to be greater than zero");
		require(
			coinLocks[msg.sender].balance == 0,
			"current lock has not been cleared"
		);
		require(
			token.transferFrom(msg.sender, address(this), amount),
			"Transfer failed"
		);

		uint256 createdAt = block.timestamp;
		uint256 unlockDate = createdAt + (1 days * lockDays);

		addLockOwner(msg.sender);
		coinLocks[msg.sender] = Lock(amount, lockDays, createdAt, unlockDate);
	}

	function getActiveLock()
		public
		view
		returns (
			uint256 balance,
			uint256 noOfDays,
			uint256 createdAt,
			uint256 unlockDate
		)
	{
		return (
			coinLocks[msg.sender].balance,
			coinLocks[msg.sender].noOfDays,
			coinLocks[msg.sender].createdAt,
			coinLocks[msg.sender].unlockDate
		);
	}

	function withdrawFromLock(uint256 amount) public {
		Lock memory activeLock = coinLocks[msg.sender];

		require(activeLock.balance > 0, "cannot withdraw from empty lock");
		require(
			amount <= activeLock.balance,
			"balance must be greater than amount"
		);

		bool isEarlyWithdraw = block.timestamp < activeLock.unlockDate;

		if (isEarlyWithdraw) {
			uint256 potDeposit = (amount * pot.percentageTax) / 100;

			require(
				(amount + potDeposit) <= activeLock.balance,
				"balance must be greater than amount plus tax"
			);

			coinLocks[msg.sender].balance -= amount + potDeposit;
			pot.balance += potDeposit;
		} else {
			coinLocks[msg.sender].balance -= amount;
		}

		require(token.transfer(msg.sender, amount), "Transfer failed");
	}

	function depositInLock(uint256 amount) public payable {
		require(amount > 0, "amount has to be greater than zero");
		require(
			coinLocks[msg.sender].unlockDate > block.timestamp,
			"sender does not have active lock"
		);
		require(
			token.transferFrom(msg.sender, address(this), amount),
			"Transfer failed"
		);

		coinLocks[msg.sender].balance += amount;
	}

	function runLottery() public {
		address[] memory possibleWinners = new address[](owners.length);
		uint256 noOfPossibleWinners;

		for (uint256 i = 0; i < owners.length; i++) {
			address owner = owners[i];

			if (coinLocks[owner].unlockDate > block.timestamp) {
				possibleWinners[noOfPossibleWinners] = owner;
				noOfPossibleWinners++;
			}
		}

		// todo: more secure random number generation
		uint256 winnerIndex = uint256(
			keccak256(abi.encodePacked(block.timestamp, msg.sender))
		) % noOfPossibleWinners;
		address winner = possibleWinners[winnerIndex];

		coinLocks[winner].balance += pot.balance;
		winners.push(Winner(block.timestamp, winner, pot.balance));
		pot.balance = 0;
	}

	function getLotteryWinners()
		public
		view
		returns (
			address[5] memory addresses,
			uint256[5] memory amounts,
			uint256[5] memory timestamps
		)
	{
		uint256 counter = 1;

		while (
			counter < 6 && winners.length != 0 && counter <= winners.length
		) {
			uint256 i = winners.length - counter;

			addresses[counter - 1] = winners[i].winnerAddress;
			amounts[counter - 1] = winners[i].amount;
			timestamps[counter - 1] = winners[i].timestamp;

			counter++;
		}

		return (addresses, amounts, timestamps);
	}
}
