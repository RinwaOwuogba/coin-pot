import {
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { useQuery, useQueryClient } from 'react-query';
import Header from '../components/header';
import LotteryDetails from '../components/lottery-details';
import LotteryWinner from '../components/lottery-winner';
import { ERC20_DECIMALS } from '../constants';

const Lottery = ({ data, cUSDBalance }) => {
  const { contract, kit } = data;

  const queryClient = useQueryClient();
  // return {
  //   // isActive: true,
  //   isActive: false,
  //   balance: 100000000000000000,
  //   unlockDate: new Date(),
  // };
  const lotteryPotQuery = useQuery('lotteryPot', async () => {
    const result = await contract.methods.getPot().call();

    result.lastLotteryDate = new Date(Number(result.lastLotteryDate) * 1000);
    result.nextRunDate = new Date(result.lastLotteryDate);

    result.nextRunDate.setDate(
      result.lastLotteryDate.getDate() + result.daysBetweenLottery
    );
    result.dueForNextRun = result.nextRunDate > new Date();

    return result;
  });

  const lotteryWinnersQuery = useQuery('lotteryWinners', async () => {
    const { addresses, amounts, timestamps } = await contract.methods
      .getLotteryWinners()
      .call();

    const winners = [
      //   {
      //     address: '0x276539Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
      //     amount: '100',
      //     timestamp: new Date(),
      //   },
      //   {
      //     address: '0x898725Fa1Eb16D44d622F2e0Ca25eeA172369bC2',
      //     amount: '100',
      //     timestamp: new Date(),
      //   },
      //   {
      //     address: '0x87406abcd3e16D44d622F2e0Ca25eeA172369bC3',
      //     amount: '100',
      //     timestamp: new Date(),
      //   },
    ];

    for (let i = 0; i < addresses.length; i++) {
      const winner = {};

      // ignore empty winner entries
      if (timestamps[i] == 0) continue;

      winner.address = addresses[i];
      winner.amount = amounts[i];
      winner.timestamp = timestamps[i];

      winners.push(winner);
    }

    return winners;
  });

  return (
    <>
      <Header balance={cUSDBalance} />

      <Box padding="4">
        <Text fontSize="xl" fontWeight="medium">
          Lottery
        </Text>

        {lotteryPotQuery.status === 'loading' ? (
          <Center>
            <Spinner thickness="4px" size="xl" />
          </Center>
        ) : null}

        {lotteryPotQuery.status === 'error' ? (
          <Center>
            <Text>Unable to fetch lottery pot</Text>
          </Center>
        ) : null}

        {lotteryPotQuery.status === 'success' ? (
          <LotteryDetails data={lotteryPotQuery.data} onRunLottery={() => {}} />
        ) : null}

        {lotteryWinnersQuery.status === 'loading' ? (
          <Center>
            <Spinner thickness="4px" size="xl" />
          </Center>
        ) : null}

        {lotteryWinnersQuery.status === 'error' ? (
          <Center>
            <Text>Unable to fetch lottery pot</Text>
          </Center>
        ) : null}

        {lotteryWinnersQuery.status === 'success' ? (
          <>
            <Text fontWeight="medium" mb="3" mt="5">
              Past winners
            </Text>

            <VStack border="1px" borderBottom="none" mx="5">
              {lotteryWinnersQuery.data.map(winner => (
                <LotteryWinner
                  address={winner.address}
                  amount={winner.amount}
                  timestamp={winner.timestamp}
                />
              ))}

              {lotteryWinnersQuery.data.length === 0 ? (
                <Text py="3">No winners yet</Text>
              ) : null}
            </VStack>
          </>
        ) : null}
      </Box>
    </>
  );
};

export default Lottery;
