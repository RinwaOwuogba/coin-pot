import { CPContractAddress, cUSDContractAddress } from './constants';
import coinpot from './contracts/CoinPot.json';
import erc20 from './contracts/IERC20Token.json';

export const approve = async (kit, price) => {
  const cUSDContract = new kit.web3.eth.Contract(
    erc20.abi,
    cUSDContractAddress
  );

  const result = await cUSDContract.methods
    .approve(CPContractAddress, price)
    .send({ from: kit.defaultAccount });

  return result;
};
