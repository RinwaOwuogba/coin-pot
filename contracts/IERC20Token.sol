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
