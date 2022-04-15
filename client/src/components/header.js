import { Flex, Text } from '@chakra-ui/react';

const Header = ({ balance }) => {
  return (
    <Flex
      as="nav"
      padding="4"
      alignItems="center"
      justifyContent="space-between"
    >
      <Text fontWeight="bold" fontSize="2xl">
        CoinPot
      </Text>

      <Text
        borderRadius="3xl"
        bg="gray.100"
        padding="2"
        border="2px"
        borderColor="gray.400"
        fontWeight="medium"
      >
        {balance}
      </Text>
    </Flex>
  );
};

export default Header;
