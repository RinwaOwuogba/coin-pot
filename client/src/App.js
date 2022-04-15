import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { newKitFromWeb3 } from '@celo/contractkit';
import BigNumber from 'bignumber.js';
import { Route, Routes } from 'react-router-dom';
import { useToast, Center, Spinner } from '@chakra-ui/react';

import coinpot from './contracts/CoinPot.json';
import erc20 from './contracts/IERC20Token.json';
import Header from './components/header';
import Home from './pages/home';

const ERC20_DECIMALS = 18;
const CPContractAddress = '0x2B5e641d834c701c6bc088ca65b36eD7Eb8Fe096';
const cUSDContractAddress = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';

function App() {
  const toast = useToast();
  const [data, setData] = useState({
    kit: null,
    contract: null,
    connecting: null,
    cUSDBalance: '',
  });

  const connectCeloWallet = async function () {
    if (window.celo) {
      toast({
        title: 'Please approve this DApp to use it.',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      try {
        await window.celo.enable();

        const web3 = new Web3(window.celo);
        const kit = newKitFromWeb3(web3);

        // set default kit account
        const accounts = await kit.web3.eth.getAccounts();
        kit.defaultAccount = accounts[0];

        // create contract instance
        const contract = new kit.web3.eth.Contract(
          coinpot.abi,
          CPContractAddress
        );

        return { kit, contract };
      } catch (error) {
        console.error(error);

        toast({
          title: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      }
    } else {
      toast({
        title: 'Please install the CeloExtensionWallet.',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  };

  const getBalance = async function (kit) {
    const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
    totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

    return totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
  };

  useEffect(() => {
    const initApp = async () => {
      const { kit, contract } = await connectCeloWallet();
      const cUSDBalance = await getBalance(kit);

      setData({
        kit,
        contract,
        cUSDBalance,
      });
    };

    if (!window.initApp) {
      window.initApp = true;

      initApp();
    }
  }, []);

  if (!data.kit) {
    return (
      <Center height="full">
        <Spinner thickness="4px" size="xl" />
      </Center>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Home data={data} setData={setData} />} />
      </Routes>
    </>
  );
}

export default App;
