// SPDX-License-Identifier: MIT

pragma solidity >=0.4.21 <8.10.0;

interface IERC20Token {
	function transfer(address, uint256) external returns (bool);

	function approve(address, uint256) external returns (bool);

	function transferFrom(
		address,
		address,
		uint256
	) external returns (bool);

	function totalSupply() external view returns (uint256);

	function balanceOf(address) external view returns (uint256);

	function allowance(address, address) external view returns (uint256);

	event Transfer(address indexed from, address indexed to, uint256 value);
	event Approval(
		address indexed owner,
		address indexed spender,
		uint256 value
	);
}

contract CoinPot {
	struct Lock {
		uint256 balance;
		uint256 noOfDays;
		uint256 createdAt;
		uint256 unlockDate;
	}

	mapping(address => Lock) internal coinLocks;

	function newLock(uint256 amount, uint256 lockDays) public {
		require(amount > 0, "amount has to be greater than zero");
		require(lockDays > 0, "lock days has to be greater than zero");
		require(
			coinLocks[msg.sender].balance == 0,
			"current lock has not been cleared"
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
}
