import { Box, Center, Spinner, Text, useToast, VStack } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import AsyncContent from '../components/async-content';
import Header from '../components/header';
import LotteryDetails from '../components/lottery-details';
import LotteryWinner from '../components/lottery-winner';
import { ERC20_DECIMALS } from '../constants';
import useSimpleToast from '../hooks/use-simple-toast';

const Lottery = ({ data, cUSDBalance }) => {
  const { contract, kit } = data;
  const simpleToast = useSimpleToast();
  const toast = useToast();

  const queryClient = useQueryClient();

  const lotteryPotQuery = useQuery('lotteryPot', async () => {
    const result = await contract.methods.getPot().call();

    result.lastLotteryDate = new Date(Number(result.lastLotteryDate) * 1000);
    result.nextRunDate = new Date(result.lastLotteryDate);

    result.nextRunDate.setDate(
      result.lastLotteryDate.getDate() + Number(result.daysBetweenLottery)
    );
    result.dueForNextRun = result.nextRunDate > new Date();

    return result;
  });

  const lotteryWinnersQuery = useQuery('lotteryWinners', async () => {
    const { addresses, amounts, timestamps } = await contract.methods
      .getLotteryWinners()
      .call();

    const winners = [];

    for (let i = 0; i < addresses.length; i++) {
      const winner = {};

      // ignore empty winner entries
      if (timestamps[i] == 0) continue;

      winner.address = addresses[i];
      winner.amount = new BigNumber(amounts[i])
        .shiftedBy(-ERC20_DECIMALS)
        .toString();
      winner.timestamp = new Date(Number(timestamps[i]) * 1000);

      winners.push(winner);
    }

    return winners;
  });

  const runLotteryMutation = useMutation(
    () => {
      simpleToast.info(`Attempting to start lottery...`);

      return contract.methods.runLottery().send({ from: kit.defaultAccount });
    },
    {
      onSuccess: () => {
        simpleToast.success(
          `Lottery completed! Check the updated list of winners`
        );
        queryClient.invalidateQueries('lotteryWinners');
        queryClient.invalidateQueries('lotteryPot');
      },
      onError: error => {
        console.error(error);
        toast({
          title: `Something went wrong while trying to run lottery`,
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      },
    }
  );

  return (
    <>
      <Header balance={cUSDBalance} />

      <Box padding="4">
        <Text fontSize="xl" fontWeight="medium">
          Lottery
        </Text>

        <AsyncContent
          status={lotteryPotQuery.status}
          onLoading={() => (
            <Center>
              <Spinner thickness="4px" size="xl" />
            </Center>
          )}
          onError={() => (
            <Center>
              <Text>Unable to fetch lottery pot</Text>
            </Center>
          )}
          onSuccess={() => (
            <LotteryDetails
              data={lotteryPotQuery.data}
              onRunLottery={runLotteryMutation.mutate}
              isLoading={runLotteryMutation.isLoading}
            />
          )}
        />

        <AsyncContent
          status={lotteryWinnersQuery.status}
          onLoading={() => (
            <Center>
              <Spinner thickness="4px" size="xl" />
            </Center>
          )}
          onError={() => (
            <Center>
              <Text>Unable to fetch lottery winners</Text>
            </Center>
          )}
          onSuccess={() => (
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
          )}
        />
      </Box>
    </>
  );
};

export default Lottery;
