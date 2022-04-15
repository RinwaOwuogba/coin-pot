import { useEffect, useState } from 'react';
import Web3 from 'web3';
import { newKitFromWeb3 } from '@celo/contractkit';
import { Route, Routes } from 'react-router-dom';
import { useToast, Center, Spinner } from '@chakra-ui/react';

import coinpot from './contracts/CoinPot.json';
import Home from './pages/home';
import { CPContractAddress, ERC20_DECIMALS } from './constants';
import { useQuery } from 'react-query';
import Lottery from './pages/lottery';

function App() {
  const toast = useToast();
  const [data, setData] = useState({
    kit: null,
    contract: null,
    connecting: null,
  });
  const cUSDBalanceQuery = useQuery(['cUSDBalance', !!data.kit], async () => {
    const { kit } = data;

    if (kit) {
      const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
      totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

      return totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
    }

    return null;
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

  useEffect(() => {
    const initApp = async () => {
      const { kit, contract } = await connectCeloWallet();

      setData({
        kit,
        contract,
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
        <Route
          path="/lottery"
          element={
            <Lottery
              data={data}
              cUSDBalance={cUSDBalanceQuery.data}
              setData={setData}
            />
          }
        />
        <Route
          path="/"
          element={
            <Home
              data={data}
              cUSDBalance={cUSDBalanceQuery.data}
              setData={setData}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
