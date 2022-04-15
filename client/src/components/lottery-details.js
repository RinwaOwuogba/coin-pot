import { Button, Flex, Text, VStack } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { ERC20_DECIMALS } from '../constants';

const LotteryDetails = ({ data, onRunLottery }) => {
  const { balance, dueForNextRun, lastLotteryDate, nextRunDate } = data;

  return (
    <Flex mt="10" justifyContent="center" mx="5">
      <Flex flexDir="column" alignItems="center">
        <Text fontSize="lg" fontWeight="medium" mb="3">
          Pot balance
        </Text>

        <Text
          fontSize="5xl"
          mb="10"
          border="2px"
          py="3"
          px="10"
          color="green.400"
        >
          ${new BigNumber(balance).shiftedBy(-ERC20_DECIMALS).toFixed(2)}{' '}
        </Text>

        <Button
          colorScheme="green"
          variant="outline"
          disabled={dueForNextRun}
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
            <Text as="span" fontWeight="bold">
              {lastLotteryDate.toUTCString()}
            </Text>
          </Text>

          <Text fontSize="sm" w="full">
            Next run date:{' '}
            <Text as="span" fontWeight="bold">
              {nextRunDate.toUTCString()}
            </Text>
          </Text>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default LotteryDetails;
