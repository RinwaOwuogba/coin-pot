import { Box, Flex, Text } from '@chakra-ui/react';
import Blockies from 'react-blockies';

const LotteryWinner = ({ address, amount, timestamp }) => {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      w="full"
      px="5"
      pt="5"
      pb="2"
    >
      <Box mr="3" mb="3">
        <Blockies seed={address} size={8} scale={4} />
      </Box>
      <Text mr="3" mb="3">
        ${amount}
      </Text>
      <Text mb="3">{timestamp.toUTCString()}</Text>
    </Flex>
  );
};

export default LotteryWinner;
