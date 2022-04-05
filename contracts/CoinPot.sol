// SPDX-License-Identifier: MIT

pragma solidity >=0.4.21 <8.10.0;

import "./IERC20Token.sol";

contract CoinPot {
	address internal cUSDTokenAddress;
	IERC20Token token;

	constructor(address tokenAddress) public {
		cUSDTokenAddress = tokenAddress;
		token = IERC20Token(tokenAddress);
	}

	struct Lock {
		uint256 balance;
		uint256 noOfDays;
		uint256 createdAt;
		uint256 unlockDate;
	}

	mapping(address => Lock) internal coinLocks;

	function newLock(uint256 amount, uint256 lockDays) public {
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
			block.timestamp >= activeLock.unlockDate,
			"cannot withdraw before unlock date"
		);
		require(
			token.transferFrom(address(this), msg.sender, amount),
			"Transfer failed"
		);

		coinLocks[msg.sender].balance -= amount;
	}
}
