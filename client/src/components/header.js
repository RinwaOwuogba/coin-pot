import { Flex, HStack, Text, Link } from '@chakra-ui/react';
import { Link as RRLink } from 'react-router-dom';

const Header = ({ balance }) => {
  return (
    <Flex
      as="nav"
      padding="4"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
    >
      <Text fontWeight="bold" fontSize="2xl">
        CoinPot
      </Text>

      <HStack spacing={['3', '5']}>
        <Link as={RRLink} to="/">
          Home
        </Link>
        <Link as={RRLink} to="/lottery">
          Lottery
        </Link>

        <Text
          borderRadius="3xl"
          bg="gray.100"
          padding="2"
          border="2px"
          borderColor="gray.400"
          fontWeight="medium"
        >
          {balance} cUSD
        </Text>
      </HStack>
    </Flex>
  );
};

export default Header;
