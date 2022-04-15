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
    console.log(
      '🚀 ~ file: lottery.js ~ line 19 ~ lotteryPotQuery ~ result',
      result
    );

    result.lastLotteryDate = new Date(Number(result.lastLotteryDate) * 1000);
    result.nextRunDate = new Date(result.lastLotteryDate);

    result.nextRunDate.setDate(
      result.lastLotteryDate.getDate() + result.daysBetweenLottery
    );
    result.dueForNextRun = result.nextRunDate > new Date();

    return result;
  });

  //   const lotteryWinnersQuery = useQuery('lotteryWinners', async () => {
  //     const [addresses, amounts, timestamps] = await contract.methods.getLotteryWinners().call();

  //       const results = [];

  //       for (let i = 0; i < addresses.length; i++) {
  //           const winner = {};

  //           winner.address = addresss[i];
  //           winner.amount = amounts[i];
  //           winner.timestamp = timestamps[i];

  //       }

  //     return result;
  //   });

  return (
    <>
      <Header balance={cUSDBalance} />

      <Box padding="4">
        <Text fontSize="2xl" fontWeight="medium">
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
          <Flex mt="10" justifyContent="center" mx="5">
            <Flex flexDir="column" alignItems="center">
              <Text fontSize="xl" fontWeight="medium" mb="3">
                Pot balance
              </Text>

              <Text
                fontSize="5xl"
                mb="10"
                border="2px"
                py="3"
                px="10"
                borderColor="black"
                color="green.400"
              >
                $
                {new BigNumber(lotteryPotQuery.data.balance)
                  .shiftedBy(-ERC20_DECIMALS)
                  .toFixed(2)}{' '}
              </Text>

              <Button
                colorScheme="green"
                disabled={lotteryPotQuery.data.dueForNextRun}
                onClick={() => {}}
                mr="5"
                mb="5"
              >
                Run lottery
              </Button>

              <VStack
                spacing="2"
                mb="3"
                bg="gray.200"
                borderRadius="md"
                p="3"
                textAlign="left"
              >
                <Text fontSize="sm" w="full" textAlign="center">
                  Lottery runs every 7 days
                </Text>

                <Text fontSize="sm" w="full">
                  Last run date:{' '}
                  <Text as="span" fontWeight="medium">
                    {lotteryPotQuery.data.lastLotteryDate.toString()}
                  </Text>
                </Text>

                <Text fontSize="sm" w="full">
                  Next run date:{' '}
                  <Text as="span" fontWeight="medium">
                    {lotteryPotQuery.data.nextRunDate.toString()}
                  </Text>
                </Text>
              </VStack>
            </Flex>
          </Flex>
        ) : null}
      </Box>
    </>
  );
};

export default Lottery;
