import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import Blockies from 'react-blockies';

const LotteryWinner = ({ address, amount, timestamp }) => {
  return (
    <VStack px="5" pt="5" pb="7" w="full">
      <Flex
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        w="full"
      >
        <Box mr="3" mb="3">
          <Blockies seed={address} size={8} scale={4} />
        </Box>
        <Text mr="3" mb="3">
          ${amount}
        </Text>
        <Text mb="3">{timestamp.toUTCString()}</Text>
      </Flex>
      <Text textAlign="left" w="full">
        {address}
      </Text>
    </VStack>
  );
};

export default LotteryWinner;
