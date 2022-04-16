# **CoinPot**

## **Description**

This is a very simple savings dapp with a twist, where users can:

- Create a lock for an amount of cUSD for a number of days.
- Add money to a lock.
- Withdraw from a user's lock when it is complete without charges or before it is completed with a fee of 5% of the withdrawal amount.
- Deposit money into an active lock.
- Participate in a lottery:
  - All the fees from early withdrawals are put into a lottery pot that runs at fixed intervals (current deployed version of the contract is 0 days to ease testing).
  - Only users with active locks can participate in the lottery.

## **Live Demo**

[CoinPot Dapp](https://rinwaowuogba.github.io/coin-pot/)

## **Usage**

### **Requirements**

1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the Google Chrome Store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.

### **Test**

#### **Automated Tests**

```
cd coin-pot
truffle test
```

#### **Manual Testing**

1. Create a lock with an amount.
2. Check that lock balance increases.
3. Deposit into a lock.
4. Check that lock balance increases.
5. Withdraw before lock completion date.
6. Check that an additional fee of %5 of the withdrawn amount has been subtracted from the lock balance and added to the lottery pot.
7. Withdraw on or after lock completion date (optional)
8. Observe that no fee is deducted.(optional)
9. Run the lottery.
10. Check the updated list of winners.

## **Project Setup**

### Install

```
npm install -g truffle # install truffle globally
cd coin-pot
npm install # install truffle dependencies for local testing
cd client
npm install # build frontend locally
```

### Start

```
cd coin-pot/client
npm start # start frontend locally
```

### Build

```
npm run build
```

## **Some Possible Improvements**

- A more secure random implementation is needed for running the lottery.
- A minimum number of days to lock a user's cUSD for could be added to the contract.
- The contract could be updated to make the odds of winning proportional to the money in a user's active lock.
